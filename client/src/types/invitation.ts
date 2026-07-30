import { MembershipRole } from './organization';

export enum InvitationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export interface WorkspaceInvitation {
  _id: string;
  organization: {
    _id: string;
    name: string;
    slug: string;
    logo?: string;
  };
  workspace: {
    _id: string;
    name: string;
    slug: string;
    icon?: string;
  };
  invitedBy: {
    _id: string;
    name: string;
    username: string;
    email: string;
    avatar?: string;
  };
  email: string;
  role: MembershipRole;
  status: InvitationStatus;
  expiresAt: string;
  acceptedAt?: string | null;
  declinedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvitationPayload {
  workspaceId: string;
  email: string;
  role?: MembershipRole;
}
