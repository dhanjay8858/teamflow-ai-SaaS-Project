import crypto from 'crypto';
import { Types } from 'mongoose';
import { workspaceInvitationRepository, WorkspaceInvitationRepository } from '../repositories/invitation.repository.js';
import { workspaceRepository, WorkspaceRepository } from '../repositories/workspace.repository.js';
import { organizationRepository } from '../repositories/organization.repository.js';
import { userRepository, UserRepository } from '../repositories/user.repository.js';
import { membershipService, MembershipService } from './membership.service.js';
import { IWorkspaceInvitationDocument, InvitationStatus } from '../types/invitation.types.js';
import { MembershipRole } from '../types/organization.types.js';
import { AppError } from '../utils/appError.js';
import { invitationEvents } from '../events/invitation.events.js';
import { domainEventBus } from '../events/domainEventBus.js';
import { DomainEventType } from '../types/activity.types.js';
import { notificationService, NotificationService } from './notification.service.js';
import { NotificationType, NotificationEntityType } from '../types/notification.types.js';
import { emailService } from './email.service.js';
import { env } from '../config/env.config.js';

export class WorkspaceInvitationService {
  constructor(
    private invRepo: WorkspaceInvitationRepository = workspaceInvitationRepository,
    private wsRepo: WorkspaceRepository = workspaceRepository,
    private userRepo: UserRepository = userRepository,
    private memberService: MembershipService = membershipService,
    private notifyService: NotificationService = notificationService
  ) {}

  private generateRawToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private hashToken(rawToken: string): string {
    return crypto.createHash('sha256').update(rawToken).digest('hex');
  }

  public async createInvitation(
    invitedByUserId: string,
    payload: { workspaceId: string; email: string; role?: MembershipRole }
  ): Promise<{ invitation: IWorkspaceInvitationDocument; rawToken: string }> {
    const ws = await this.wsRepo.findById(payload.workspaceId);
    if (!ws || ws.isArchived) {
      throw AppError.notFound('Workspace not found');
    }

    const email = payload.email.toLowerCase().trim();
    const invitedByUserObjectId = new Types.ObjectId(invitedByUserId);

    // Check if target user is already a member of workspace
    const existingUser = await this.userRepo.findByEmail(email);
    if (existingUser) {
      const existingMember = await this.memberService.getWorkspaceMembers(ws._id.toString());
      const isMember = existingMember.some((m) => m.user._id.toString() === existingUser._id.toString());
      if (isMember) {
        throw AppError.conflict('User is already an active member of this workspace');
      }
    }

    // Check for duplicate active pending invitation
    const activeInv = await this.invRepo.findActivePendingInvitation(ws._id, email);
    if (activeInv) {
      throw AppError.conflict('A pending invitation already exists for this email address in this workspace');
    }

    const rawToken = this.generateRawToken();
    const hashedToken = this.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invitation = await this.invRepo.create({
      organization: ws.organization,
      workspace: ws._id,
      invitedBy: invitedByUserObjectId,
      invitedUser: existingUser ? existingUser._id : null,
      email,
      role: payload.role || MembershipRole.MEMBER,
      status: InvitationStatus.PENDING,
      token: hashedToken,
      expiresAt,
    });

    const acceptUrl = `${env.CLIENT_URL}/invitations/accept?token=${rawToken}`;
    const inviter = await this.userRepo.findById(invitedByUserId);
    const org = await organizationRepository.findById(ws.organization);

    // Dispatch Email Notification directly to recipient's Gmail via Nodemailer
    try {
      await emailService.sendWorkspaceInvitation({
        toEmail: email,
        inviterName: inviter?.name || 'A team member',
        workspaceName: ws.name,
        organizationName: org?.name || 'TeamFlow AI',
        role: invitation.role,
        acceptUrl,
        expiresAt,
      });
    } catch {
      // Non-blocking fallback
    }

    // Emit internal event for email delivery queue plugins
    invitationEvents.emit('invitation.created', {
      invitationId: invitation._id.toString(),
      email,
      rawToken,
      role: invitation.role,
      workspaceId: ws._id.toString(),
      organizationId: ws.organization.toString(),
      invitedByUserId,
      expiresAt,
    });

    // Publish Domain Event
    domainEventBus.publish(DomainEventType.INVITATION_CREATED, {
      invitationId: invitation._id.toString(),
      workspaceId: ws._id.toString(),
      organizationId: ws.organization.toString(),
      invitedByUserId,
      email,
      role: invitation.role,
    });

    if (existingUser) {
      if (inviter) {
        await this.notifyService.createNotification({
          recipient: existingUser._id,
          actor: invitedByUserObjectId,
          type: NotificationType.WORKSPACE_INVITED,
          entityType: NotificationEntityType.INVITATION,
          entityId: invitation._id.toString(),
          title: 'Workspace Invitation',
          message: `${inviter.name} invited you to join the workspace "${ws.name}"`,
          workspace: ws._id,
          metadata: {
            invitationId: invitation._id.toString(),
            token: rawToken,
            role: payload.role || MembershipRole.MEMBER,
          },
        });
      }
    }

    return { invitation, rawToken };
  }

  public async getWorkspacePendingInvitations(workspaceId: string): Promise<IWorkspaceInvitationDocument[]> {
    return this.invRepo.findWorkspacePendingInvitations(workspaceId);
  }

  public async validateInvitationToken(rawToken: string): Promise<IWorkspaceInvitationDocument> {
    const hashedToken = this.hashToken(rawToken);
    const invitation = await this.invRepo.findByHashedToken(hashedToken);

    if (!invitation) {
      throw AppError.notFound('Invalid invitation token');
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw AppError.badRequest(`Invitation cannot be processed because it is ${invitation.status.toLowerCase()}`);
    }

    if (new Date() > invitation.expiresAt) {
      await this.invRepo.updateStatus(invitation._id, InvitationStatus.EXPIRED);
      throw AppError.badRequest('Invitation token has expired');
    }

    return invitation;
  }

  public async acceptInvitation(rawToken: string, acceptingUserId: string): Promise<{ organizationSlug: string; workspaceSlug: string }> {
    const invitation = await this.validateInvitationToken(rawToken);

    // Automatically create workspace membership using MembershipService
    await this.memberService.addMember(invitation.workspace._id.toString(), acceptingUserId, invitation.role);

    // Update invitation status to ACCEPTED
    await this.invRepo.updateStatus(invitation._id, InvitationStatus.ACCEPTED, {
      acceptedAt: new Date(),
    });

    // Automatically set user's active context to the newly joined organization and workspace
    await this.userRepo.updateUser(acceptingUserId, {
      lastOrganization: invitation.organization._id,
      lastWorkspace: invitation.workspace._id,
    });

    // Publish Domain Event
    domainEventBus.publish(DomainEventType.INVITATION_ACCEPTED, {
      invitationId: invitation._id.toString(),
      workspaceId: invitation.workspace._id.toString(),
      organizationId: invitation.organization._id.toString(),
      acceptingUserId,
      email: invitation.email,
    });

    const org = await organizationRepository.findById(invitation.organization._id);
    const ws = await this.wsRepo.findById(invitation.workspace._id);

    return {
      organizationSlug: org?.slug || '',
      workspaceSlug: ws?.slug || 'general',
    };
  }

  public async declineInvitation(rawToken: string): Promise<void> {
    const invitation = await this.validateInvitationToken(rawToken);

    await this.invRepo.updateStatus(invitation._id, InvitationStatus.DECLINED, {
      declinedAt: new Date(),
    });

    // Publish Domain Event
    domainEventBus.publish(DomainEventType.INVITATION_DECLINED, {
      invitationId: invitation._id.toString(),
      workspaceId: invitation.workspace._id.toString(),
      organizationId: invitation.organization._id.toString(),
      invitedByUserId: invitation.invitedBy._id ? invitation.invitedBy._id.toString() : invitation.invitedBy.toString(),
      email: invitation.email,
    });
  }

  public async cancelInvitation(invitationId: string): Promise<void> {
    const invitation = await this.invRepo.findById(invitationId);
    if (!invitation) {
      throw AppError.notFound('Invitation record not found');
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw AppError.badRequest('Only pending invitations can be cancelled');
    }

    await this.invRepo.updateStatus(invitationId, InvitationStatus.CANCELLED);
  }

  public async resendInvitation(invitationId: string): Promise<{ invitation: IWorkspaceInvitationDocument; rawToken: string }> {
    const invitation = await this.invRepo.findById(invitationId);
    if (!invitation) {
      throw AppError.notFound('Invitation record not found');
    }

    const rawToken = this.generateRawToken();
    const hashedToken = this.hashToken(rawToken);
    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const updated = await this.invRepo.updateTokenAndExpiry(invitationId, hashedToken, newExpiresAt);
    if (!updated) throw AppError.internal('Failed to resend invitation');

    invitationEvents.emit('invitation.resent', {
      invitationId: updated._id.toString(),
      email: updated.email,
      rawToken,
      role: updated.role,
      workspaceId: updated.workspace._id.toString(),
      organizationId: updated.organization._id.toString(),
      invitedByUserId: updated.invitedBy.toString(),
      expiresAt: newExpiresAt,
    });

    return { invitation: updated, rawToken };
  }
}

export const workspaceInvitationService = new WorkspaceInvitationService();
