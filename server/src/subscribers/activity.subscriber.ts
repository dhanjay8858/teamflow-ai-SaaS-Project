import { domainEventBus } from '../events/domainEventBus.js';
import { activityService } from '../services/activity.service.js';
import { DomainEventType, ActivityEntityType } from '../types/activity.types.js';

export function registerActivitySubscribers(): void {
  // Authentication Events
  domainEventBus.subscribe(DomainEventType.USER_REGISTERED, async (event) => {
    const { userId, name, email } = event.payload as any;
    await activityService.recordActivity({
      userId,
      eventType: DomainEventType.USER_REGISTERED,
      entityType: ActivityEntityType.AUTHENTICATION,
      entityId: userId,
      title: 'New Account Registered',
      description: `${name} (${email}) joined TeamFlow AI`,
    });
  });

  domainEventBus.subscribe(DomainEventType.USER_LOGGED_IN, async (event) => {
    const { userId, name } = event.payload as any;
    await activityService.recordActivity({
      userId,
      eventType: DomainEventType.USER_LOGGED_IN,
      entityType: ActivityEntityType.AUTHENTICATION,
      entityId: userId,
      title: 'User Logged In',
      description: `${name} logged into TeamFlow AI`,
    });
  });

  domainEventBus.subscribe(DomainEventType.USER_LOGGED_OUT, async (event) => {
    const { userId } = event.payload as any;
    await activityService.recordActivity({
      userId,
      eventType: DomainEventType.USER_LOGGED_OUT,
      entityType: ActivityEntityType.AUTHENTICATION,
      entityId: userId,
      title: 'User Logged Out',
      description: `User session terminated`,
    });
  });

  // Organization Events
  domainEventBus.subscribe(DomainEventType.ORGANIZATION_CREATED, async (event) => {
    const { organizationId, name, ownerUserId } = event.payload as any;
    await activityService.recordActivity({
      organizationId,
      userId: ownerUserId,
      eventType: DomainEventType.ORGANIZATION_CREATED,
      entityType: ActivityEntityType.ORGANIZATION,
      entityId: organizationId,
      title: 'Organization Created',
      description: `Organization '${name}' was created`,
    });
  });

  // Workspace Events
  domainEventBus.subscribe(DomainEventType.WORKSPACE_CREATED, async (event) => {
    const { workspaceId, organizationId, name, createdByUserId } = event.payload as any;
    await activityService.recordActivity({
      organizationId,
      workspaceId,
      userId: createdByUserId,
      eventType: DomainEventType.WORKSPACE_CREATED,
      entityType: ActivityEntityType.WORKSPACE,
      entityId: workspaceId,
      title: 'Workspace Created',
      description: `Workspace '${name}' was created`,
    });
  });

  // Membership Events
  domainEventBus.subscribe(DomainEventType.MEMBERSHIP_ADDED, async (event) => {
    const { membershipId, workspaceId, organizationId, userId, role } = event.payload as any;
    await activityService.recordActivity({
      organizationId,
      workspaceId,
      userId,
      eventType: DomainEventType.MEMBERSHIP_ADDED,
      entityType: ActivityEntityType.MEMBERSHIP,
      entityId: membershipId,
      title: 'Member Joined Workspace',
      description: `Member joined workspace with role ${role}`,
    });
  });

  domainEventBus.subscribe(DomainEventType.ROLE_CHANGED, async (event) => {
    const { membershipId, workspaceId, organizationId, requestingUserId, targetUserId, newRole } = event.payload as any;
    await activityService.recordActivity({
      organizationId,
      workspaceId,
      userId: requestingUserId || targetUserId,
      eventType: DomainEventType.ROLE_CHANGED,
      entityType: ActivityEntityType.MEMBERSHIP,
      entityId: membershipId,
      title: 'Member Role Updated',
      description: `Member role updated to ${newRole}`,
    });
  });

  // Invitation Events
  domainEventBus.subscribe(DomainEventType.INVITATION_CREATED, async (event) => {
    const { invitationId, workspaceId, organizationId, invitedByUserId, email, role } = event.payload as any;
    await activityService.recordActivity({
      organizationId,
      workspaceId,
      userId: invitedByUserId,
      eventType: DomainEventType.INVITATION_CREATED,
      entityType: ActivityEntityType.INVITATION,
      entityId: invitationId,
      title: 'Invitation Sent',
      description: `Invitation sent to ${email} for role ${role}`,
    });
  });

  domainEventBus.subscribe(DomainEventType.INVITATION_ACCEPTED, async (event) => {
    const { invitationId, workspaceId, organizationId, acceptingUserId, email } = event.payload as any;
    await activityService.recordActivity({
      organizationId,
      workspaceId,
      userId: acceptingUserId,
      eventType: DomainEventType.INVITATION_ACCEPTED,
      entityType: ActivityEntityType.INVITATION,
      entityId: invitationId,
      title: 'Invitation Accepted',
      description: `${email} accepted workspace invitation`,
    });
  });

  domainEventBus.subscribe(DomainEventType.INVITATION_DECLINED, async (event) => {
    const { invitationId, workspaceId, organizationId, invitedByUserId, email } = event.payload as any;
    if (invitedByUserId) {
      await activityService.recordActivity({
        organizationId,
        workspaceId,
        userId: invitedByUserId,
        eventType: DomainEventType.INVITATION_DECLINED,
        entityType: ActivityEntityType.INVITATION,
        entityId: invitationId,
        title: 'Invitation Declined',
        description: `Invitation to ${email} was declined`,
      });
    }
  });

  // Project Events
  domainEventBus.subscribe(DomainEventType.PROJECT_CREATED, async (event) => {
    const { projectId, workspaceId, organizationId, name, createdByUserId } = event.payload as any;
    await activityService.recordActivity({
      organizationId,
      workspaceId,
      userId: createdByUserId,
      eventType: DomainEventType.PROJECT_CREATED,
      entityType: ActivityEntityType.PROJECT,
      entityId: projectId,
      title: 'Project Created',
      description: `Project '${name}' was created`,
    });
  });

  domainEventBus.subscribe(DomainEventType.PROJECT_UPDATED, async (event) => {
    const { projectId, workspaceId, updatedByUserId } = event.payload as any;
    await activityService.recordActivity({
      workspaceId,
      userId: updatedByUserId,
      eventType: DomainEventType.PROJECT_UPDATED,
      entityType: ActivityEntityType.PROJECT,
      entityId: projectId,
      title: 'Project Updated',
      description: `Project details updated`,
    });
  });

  domainEventBus.subscribe(DomainEventType.PROJECT_ARCHIVED, async (event) => {
    const { projectId, workspaceId, archivedByUserId } = event.payload as any;
    await activityService.recordActivity({
      workspaceId,
      userId: archivedByUserId,
      eventType: DomainEventType.PROJECT_ARCHIVED,
      entityType: ActivityEntityType.PROJECT,
      entityId: projectId,
      title: 'Project Archived',
      description: `Project archived`,
    });
  });

  domainEventBus.subscribe(DomainEventType.PROJECT_MEMBER_ADDED, async (event) => {
    const { projectId, workspaceId, organizationId, userId, role, addedByUserId } = event.payload as any;
    await activityService.recordActivity({
      organizationId,
      workspaceId,
      userId: addedByUserId || userId,
      eventType: DomainEventType.PROJECT_MEMBER_ADDED,
      entityType: ActivityEntityType.PROJECT,
      entityId: projectId,
      title: 'Project Member Added',
      description: `Added user to project as ${role}`,
    });
  });

  domainEventBus.subscribe(DomainEventType.PROJECT_MEMBER_REMOVED, async (event) => {
    const { projectId, workspaceId, requestingUserId, targetUserId } = event.payload as any;
    await activityService.recordActivity({
      workspaceId,
      userId: requestingUserId || targetUserId,
      eventType: DomainEventType.PROJECT_MEMBER_REMOVED,
      entityType: ActivityEntityType.PROJECT,
      entityId: projectId,
      title: 'Project Member Removed',
      description: `Member removed from project`,
    });
  });

  domainEventBus.subscribe(DomainEventType.PROJECT_ROLE_CHANGED, async (event) => {
    const { projectId, workspaceId, newRole, requestingUserId, targetUserId } = event.payload as any;
    await activityService.recordActivity({
      workspaceId,
      userId: requestingUserId || targetUserId,
      eventType: DomainEventType.PROJECT_ROLE_CHANGED,
      entityType: ActivityEntityType.PROJECT,
      entityId: projectId,
      title: 'Project Role Changed',
      description: `Project role changed to ${newRole}`,
    });
  });

  // Board Events
  domainEventBus.subscribe(DomainEventType.BOARD_CREATED, async (event) => {
    const { boardId, workspaceId, name, createdByUserId } = event.payload as any;
    await activityService.recordActivity({
      workspaceId,
      userId: createdByUserId,
      eventType: DomainEventType.BOARD_CREATED,
      entityType: ActivityEntityType.BOARD,
      entityId: boardId,
      title: 'Kanban Board Created',
      description: `Kanban board '${name}' was created`,
    });
  });

  domainEventBus.subscribe(DomainEventType.BOARD_UPDATED, async (event) => {
    const { boardId, updatedByUserId } = event.payload as any;
    await activityService.recordActivity({
      userId: updatedByUserId,
      eventType: DomainEventType.BOARD_UPDATED,
      entityType: ActivityEntityType.BOARD,
      entityId: boardId,
      title: 'Kanban Board Updated',
      description: `Kanban board metadata updated`,
    });
  });

  domainEventBus.subscribe(DomainEventType.BOARD_ARCHIVED, async (event) => {
    const { boardId, archivedByUserId } = event.payload as any;
    await activityService.recordActivity({
      userId: archivedByUserId,
      eventType: DomainEventType.BOARD_ARCHIVED,
      entityType: ActivityEntityType.BOARD,
      entityId: boardId,
      title: 'Kanban Board Archived',
      description: `Kanban board column archived`,
    });
  });

  domainEventBus.subscribe(DomainEventType.BOARD_REORDERED, async (event) => {
    const { workspaceId, reorderedByUserId } = event.payload as any;
    await activityService.recordActivity({
      workspaceId,
      userId: reorderedByUserId,
      eventType: DomainEventType.BOARD_REORDERED,
      entityType: ActivityEntityType.BOARD,
      entityId: workspaceId || 'boards',
      title: 'Kanban Board Column Order Changed',
      description: `Board column positions reordered`,
    });
  });

  // Task Events
  domainEventBus.subscribe(DomainEventType.TASK_CREATED, async (event) => {
    const { taskId, taskKey, workspaceId, title, createdByUserId } = event.payload as any;
    await activityService.recordActivity({
      workspaceId,
      userId: createdByUserId,
      eventType: DomainEventType.TASK_CREATED,
      entityType: ActivityEntityType.TASK,
      entityId: taskId,
      title: `Task Created [${taskKey}]`,
      description: `'${title}' was created`,
    });
  });

  domainEventBus.subscribe(DomainEventType.TASK_UPDATED, async (event) => {
    const { taskId, taskKey, updatedByUserId } = event.payload as any;
    await activityService.recordActivity({
      userId: updatedByUserId,
      eventType: DomainEventType.TASK_UPDATED,
      entityType: ActivityEntityType.TASK,
      entityId: taskId,
      title: `Task Updated [${taskKey}]`,
      description: `Task properties updated`,
    });
  });

  domainEventBus.subscribe(DomainEventType.TASK_MOVED, async (event) => {
    const { taskId, taskKey, movedByUserId } = event.payload as any;
    await activityService.recordActivity({
      userId: movedByUserId,
      eventType: DomainEventType.TASK_MOVED,
      entityType: ActivityEntityType.TASK,
      entityId: taskId,
      title: `Task Moved [${taskKey}]`,
      description: `Task moved to another board stage`,
    });
  });

  domainEventBus.subscribe(DomainEventType.TASK_ASSIGNED, async (event) => {
    const { taskId, taskKey, assignedByUserId } = event.payload as any;
    await activityService.recordActivity({
      userId: assignedByUserId,
      eventType: DomainEventType.TASK_ASSIGNED,
      entityType: ActivityEntityType.TASK,
      entityId: taskId,
      title: `Task Assignee Changed [${taskKey}]`,
      description: `Task assigned user updated`,
    });
  });

  domainEventBus.subscribe(DomainEventType.TASK_STATUS_CHANGED, async (event) => {
    const { taskId, taskKey, newStatus, changedByUserId } = event.payload as any;
    await activityService.recordActivity({
      userId: changedByUserId,
      eventType: DomainEventType.TASK_STATUS_CHANGED,
      entityType: ActivityEntityType.TASK,
      entityId: taskId,
      title: `Task Status Changed [${taskKey}]`,
      description: `Status changed to ${newStatus}`,
    });
  });

  domainEventBus.subscribe(DomainEventType.TASK_PRIORITY_CHANGED, async (event) => {
    const { taskId, taskKey, newPriority, changedByUserId } = event.payload as any;
    await activityService.recordActivity({
      userId: changedByUserId,
      eventType: DomainEventType.TASK_PRIORITY_CHANGED,
      entityType: ActivityEntityType.TASK,
      entityId: taskId,
      title: `Task Priority Changed [${taskKey}]`,
      description: `Priority updated to ${newPriority}`,
    });
  });

  domainEventBus.subscribe(DomainEventType.TASK_ARCHIVED, async (event) => {
    const { taskId, taskKey, archivedByUserId } = event.payload as any;
    await activityService.recordActivity({
      userId: archivedByUserId,
      eventType: DomainEventType.TASK_ARCHIVED,
      entityType: ActivityEntityType.TASK,
      entityId: taskId,
      title: `Task Archived [${taskKey}]`,
      description: `Task archived`,
    });
  });

  // Rich Task Feature Events
  domainEventBus.subscribe(DomainEventType.CHECKLIST_CREATED, async (event) => {
    const { taskId, createdByUserId } = event.payload as any;
    await activityService.recordActivity({
      userId: createdByUserId,
      eventType: DomainEventType.CHECKLIST_CREATED,
      entityType: ActivityEntityType.TASK,
      entityId: taskId,
      title: 'Checklist Item Added',
      description: 'Checklist item added to task',
    });
  });

  domainEventBus.subscribe(DomainEventType.CHECKLIST_COMPLETED, async (event) => {
    const { taskId, updatedByUserId } = event.payload as any;
    await activityService.recordActivity({
      userId: updatedByUserId,
      eventType: DomainEventType.CHECKLIST_COMPLETED,
      entityType: ActivityEntityType.TASK,
      entityId: taskId,
      title: 'Checklist Item Completed',
      description: 'Checklist item checked off',
    });
  });

  domainEventBus.subscribe(DomainEventType.SUBTASK_CREATED, async (event) => {
    const { parentTaskId, createdByUserId } = event.payload as any;
    await activityService.recordActivity({
      userId: createdByUserId,
      eventType: DomainEventType.SUBTASK_CREATED,
      entityType: ActivityEntityType.TASK,
      entityId: parentTaskId,
      title: 'Subtask Created',
      description: 'Subtask added to task',
    });
  });

  domainEventBus.subscribe(DomainEventType.DEPENDENCY_CREATED, async (event) => {
    const { taskId, createdByUserId } = event.payload as any;
    await activityService.recordActivity({
      userId: createdByUserId,
      eventType: DomainEventType.DEPENDENCY_CREATED,
      entityType: ActivityEntityType.TASK,
      entityId: taskId,
      title: 'Task Dependency Added',
      description: 'Dependency relationship established',
    });
  });

  domainEventBus.subscribe(DomainEventType.TIME_UPDATED, async (event) => {
    const { taskId, estimateMinutes, spentMinutes, updatedByUserId } = event.payload as any;
    await activityService.recordActivity({
      userId: updatedByUserId,
      eventType: DomainEventType.TIME_UPDATED,
      entityType: ActivityEntityType.TASK,
      entityId: taskId,
      title: 'Task Time Tracking Updated',
      description: `Est: ${estimateMinutes || 0}m, Spent: ${spentMinutes || 0}m`,
    });
  });

  // Task Collaboration Events
  domainEventBus.subscribe(DomainEventType.TASK_WATCHED, async (event) => {
    const { taskId, userId } = event.payload as any;
    await activityService.recordActivity({
      userId,
      eventType: DomainEventType.TASK_WATCHED,
      entityType: ActivityEntityType.TASK,
      entityId: taskId,
      title: 'Task Watched',
      description: 'User started watching task',
    });
  });

  domainEventBus.subscribe(DomainEventType.MENTIONS_PARSED, async (event) => {
    const { taskId, mentionedUsernames, parsedByUserId } = event.payload as any;
    await activityService.recordActivity({
      userId: parsedByUserId,
      eventType: DomainEventType.MENTIONS_PARSED,
      entityType: ActivityEntityType.TASK,
      entityId: taskId,
      title: 'User Mentions Detected',
      description: `Mentioned: ${mentionedUsernames.map((u: string) => `@${u}`).join(', ')}`,
    });
  });

  // Comment Events
  domainEventBus.subscribe(DomainEventType.COMMENT_CREATED, async (event) => {
    const { commentId, taskId, workspaceId, authorUserId } = event.payload as any;
    await activityService.recordActivity({
      workspaceId,
      userId: authorUserId,
      eventType: DomainEventType.COMMENT_CREATED,
      entityType: ActivityEntityType.COMMENT,
      entityId: commentId,
      title: 'Comment Added',
      description: `New comment added to task`,
      metadata: { taskId },
    });
  });

  domainEventBus.subscribe(DomainEventType.COMMENT_UPDATED, async (event) => {
    const { commentId, taskId, workspaceId, updatedByUserId } = event.payload as any;
    await activityService.recordActivity({
      workspaceId,
      userId: updatedByUserId,
      eventType: DomainEventType.COMMENT_UPDATED,
      entityType: ActivityEntityType.COMMENT,
      entityId: commentId,
      title: 'Comment Edited',
      description: `Comment was edited`,
      metadata: { taskId },
    });
  });

  domainEventBus.subscribe(DomainEventType.COMMENT_DELETED, async (event) => {
    const { commentId, taskId, workspaceId, deletedByUserId } = event.payload as any;
    await activityService.recordActivity({
      workspaceId,
      userId: deletedByUserId,
      eventType: DomainEventType.COMMENT_DELETED,
      entityType: ActivityEntityType.COMMENT,
      entityId: commentId,
      title: 'Comment Deleted',
      description: `Comment was removed`,
      metadata: { taskId },
    });
  });

  domainEventBus.subscribe(DomainEventType.COMMENT_REPLIED, async (event) => {
    const { replyId, parentCommentId, taskId, workspaceId, authorUserId } = event.payload as any;
    await activityService.recordActivity({
      workspaceId,
      userId: authorUserId,
      eventType: DomainEventType.COMMENT_REPLIED,
      entityType: ActivityEntityType.COMMENT,
      entityId: replyId,
      title: 'Reply Added',
      description: `Reply added to a comment`,
      metadata: { taskId, parentCommentId },
    });
  });

  domainEventBus.subscribe(DomainEventType.COMMENT_REACTION_ADDED, async (event) => {
    const { commentId, emoji, userId, taskId } = event.payload as any;
    await activityService.recordActivity({
      userId,
      eventType: DomainEventType.COMMENT_REACTION_ADDED,
      entityType: ActivityEntityType.COMMENT,
      entityId: commentId,
      title: 'Reaction Added',
      description: `Reacted with ${emoji}`,
      metadata: { taskId },
    });
  });

  domainEventBus.subscribe(DomainEventType.COMMENT_REACTION_REMOVED, async (event) => {
    const { commentId, emoji, userId, taskId } = event.payload as any;
    await activityService.recordActivity({
      userId,
      eventType: DomainEventType.COMMENT_REACTION_REMOVED,
      entityType: ActivityEntityType.COMMENT,
      entityId: commentId,
      title: 'Reaction Removed',
      description: `Removed ${emoji} reaction`,
      metadata: { taskId },
    });
  });
}
