import { domainEventBus } from '../events/domainEventBus.js';
import { notificationService } from '../services/notification.service.js';
import { taskWatcherRepository } from '../repositories/taskWatcher.repository.js';
import { commentRepository } from '../repositories/comment.repository.js';
import { userRepository } from '../repositories/user.repository.js';
import { taskRepository } from '../repositories/task.repository.js';
import { DomainEventType } from '../types/activity.types.js';
import { NotificationType, NotificationEntityType } from '../types/notification.types.js';
import { logger } from '../utils/logger.js';

export function registerNotificationSubscribers(): void {
  // 1. Task Assigned Notification
  domainEventBus.subscribe(DomainEventType.TASK_ASSIGNED, async (event) => {
    try {
      const { taskId, taskKey, newAssigneeId, assignedByUserId, workspaceId } = event.payload as any;
      if (!newAssigneeId || newAssigneeId === assignedByUserId) return;

      await notificationService.createNotification({
        recipient: newAssigneeId,
        actor: assignedByUserId,
        workspace: workspaceId,
        type: NotificationType.TASK_ASSIGNED,
        entityType: NotificationEntityType.TASK,
        entityId: taskId,
        title: `Task Assigned: [${taskKey}]`,
        message: `You were assigned to task ${taskKey}`,
        metadata: { taskId, taskKey },
      });
    } catch (err: any) {
      logger.error(`❌ [NotificationSubscriber] Error on TASK_ASSIGNED: ${err.message}`);
    }
  });

  // 2. Task Status Changed Notification (Notify Watchers)
  domainEventBus.subscribe(DomainEventType.TASK_STATUS_CHANGED, async (event) => {
    try {
      const { taskId, taskKey, newStatus, changedByUserId, workspaceId } = event.payload as any;
      const watchers = await taskWatcherRepository.findTaskWatchers(taskId);

      const notifications = watchers
        .map((w) => (w.user._id ? w.user._id.toString() : w.user.toString()))
        .filter((uId) => uId !== changedByUserId)
        .map((recipientId) => ({
          recipient: recipientId,
          actor: changedByUserId,
          workspace: workspaceId,
          type: newStatus === 'DONE' ? NotificationType.TASK_COMPLETED : NotificationType.TASK_UPDATED,
          entityType: NotificationEntityType.TASK,
          entityId: taskId,
          title: `Task [${taskKey}] Status Changed`,
          message: `Status updated to ${newStatus}`,
          metadata: { taskId, taskKey, newStatus },
        }));

      await notificationService.createBatchNotifications(notifications);
    } catch (err: any) {
      logger.error(`❌ [NotificationSubscriber] Error on TASK_STATUS_CHANGED: ${err.message}`);
    }
  });

  // 3. Task Moved Notification
  domainEventBus.subscribe(DomainEventType.TASK_MOVED, async (event) => {
    try {
      const { taskId, taskKey, movedByUserId, workspaceId } = event.payload as any;
      const watchers = await taskWatcherRepository.findTaskWatchers(taskId);

      const notifications = watchers
        .map((w) => (w.user._id ? w.user._id.toString() : w.user.toString()))
        .filter((uId) => uId !== movedByUserId)
        .map((recipientId) => ({
          recipient: recipientId,
          actor: movedByUserId,
          workspace: workspaceId,
          type: NotificationType.TASK_MOVED,
          entityType: NotificationEntityType.TASK,
          entityId: taskId,
          title: `Task [${taskKey}] Moved`,
          message: `Task ${taskKey} was moved to a new board column`,
          metadata: { taskId, taskKey },
        }));

      await notificationService.createBatchNotifications(notifications);
    } catch (err: any) {
      logger.error(`❌ [NotificationSubscriber] Error on TASK_MOVED: ${err.message}`);
    }
  });

  // 4. Comment Created Notification (Notify Task Watchers)
  domainEventBus.subscribe(DomainEventType.COMMENT_CREATED, async (event) => {
    try {
      const { commentId, taskId, workspaceId, projectId, authorUserId } = event.payload as any;
      const watchers = await taskWatcherRepository.findTaskWatchers(taskId);
      const task = await taskRepository.findById(taskId);
      const taskKey = task?.taskKey || 'Task';

      const notifications = watchers
        .map((w) => (w.user._id ? w.user._id.toString() : w.user.toString()))
        .filter((uId) => uId !== authorUserId)
        .map((recipientId) => ({
          recipient: recipientId,
          actor: authorUserId,
          workspace: workspaceId,
          project: projectId,
          type: NotificationType.COMMENT_CREATED,
          entityType: NotificationEntityType.COMMENT,
          entityId: commentId,
          title: `New Comment on [${taskKey}]`,
          message: `A new comment was posted on task ${taskKey}`,
          metadata: { taskId, commentId, taskKey },
        }));

      await notificationService.createBatchNotifications(notifications);
    } catch (err: any) {
      logger.error(`❌ [NotificationSubscriber] Error on COMMENT_CREATED: ${err.message}`);
    }
  });

  // 5. Comment Replied Notification (Notify Parent Author)
  domainEventBus.subscribe(DomainEventType.COMMENT_REPLIED, async (event) => {
    try {
      const { replyId, parentCommentId, taskId, workspaceId, authorUserId } = event.payload as any;
      const parentComment = await commentRepository.findById(parentCommentId);
      if (!parentComment) return;

      const parentAuthorId = parentComment.author._id
        ? parentComment.author._id.toString()
        : parentComment.author.toString();

      if (parentAuthorId === authorUserId) return;

      const task = await taskRepository.findById(taskId);
      const taskKey = task?.taskKey || 'Task';

      await notificationService.createNotification({
        recipient: parentAuthorId,
        actor: authorUserId,
        workspace: workspaceId,
        type: NotificationType.COMMENT_REPLY,
        entityType: NotificationEntityType.COMMENT,
        entityId: replyId,
        title: `Reply to your comment on [${taskKey}]`,
        message: `Someone replied to your comment on ${taskKey}`,
        metadata: { taskId, commentId: replyId, parentCommentId, taskKey },
      });
    } catch (err: any) {
      logger.error(`❌ [NotificationSubscriber] Error on COMMENT_REPLIED: ${err.message}`);
    }
  });

  // 6. User Mention Notification
  domainEventBus.subscribe(DomainEventType.MENTIONS_PARSED, async (event) => {
    try {
      const { taskId, commentId, mentionedUsernames, parsedByUserId } = event.payload as any;
      if (!mentionedUsernames || mentionedUsernames.length === 0) return;

      const task = await taskRepository.findById(taskId);
      if (!task) return;

      const taskKey = task.taskKey;
      const workspaceId = task.workspace.toString();

      for (const username of mentionedUsernames) {
        const user = await userRepository.findByUsername(username);
        if (user && user._id.toString() !== parsedByUserId) {
          await notificationService.createNotification({
            recipient: user._id.toString(),
            actor: parsedByUserId,
            workspace: workspaceId,
            project: task.project.toString(),
            type: NotificationType.COMMENT_MENTION,
            entityType: NotificationEntityType.COMMENT,
            entityId: commentId || taskId,
            title: `Mentioned in [${taskKey}]`,
            message: `You were mentioned in task ${taskKey}`,
            metadata: { taskId, commentId, taskKey },
          });
        }
      }
    } catch (err: any) {
      logger.error(`❌ [NotificationSubscriber] Error on MENTIONS_PARSED: ${err.message}`);
    }
  });

  // 7. Project Member Added Notification
  domainEventBus.subscribe(DomainEventType.PROJECT_MEMBER_ADDED, async (event) => {
    try {
      const { projectId, workspaceId, userId, addedByUserId, role } = event.payload as any;
      if (!userId || userId === addedByUserId) return;

      await notificationService.createNotification({
        recipient: userId,
        actor: addedByUserId || userId,
        workspace: workspaceId,
        project: projectId,
        type: NotificationType.PROJECT_MEMBER_ADDED,
        entityType: NotificationEntityType.PROJECT,
        entityId: projectId,
        title: `Added to Project`,
        message: `You were added to a project with role ${role}`,
        metadata: { projectId, role },
      });
    } catch (err: any) {
      logger.error(`❌ [NotificationSubscriber] Error on PROJECT_MEMBER_ADDED: ${err.message}`);
    }
  });

  // 8. Invitation Accepted Notification
  domainEventBus.subscribe(DomainEventType.INVITATION_ACCEPTED, async (event) => {
    try {
      const { invitationId, workspaceId, acceptingUserId, email } = event.payload as any;

      await notificationService.createNotification({
        recipient: acceptingUserId,
        actor: acceptingUserId,
        workspace: workspaceId,
        type: NotificationType.INVITATION_ACCEPTED,
        entityType: NotificationEntityType.WORKSPACE,
        entityId: workspaceId,
        title: `Workspace Joined`,
        message: `Welcome! You have successfully joined the workspace`,
        metadata: { invitationId, email },
      });
    } catch (err: any) {
      logger.error(`❌ [NotificationSubscriber] Error on INVITATION_ACCEPTED: ${err.message}`);
    }
  });

  // 9. File Uploaded Notification (Notify Task Watchers)
  domainEventBus.subscribe(DomainEventType.FILE_UPLOADED, async (event) => {
    try {
      const { fileId, taskId, workspaceId, originalName, uploadedByUserId } = event.payload as any;
      if (!taskId) return;

      const watchers = await taskWatcherRepository.findTaskWatchers(taskId);
      const task = await taskRepository.findById(taskId);
      const taskKey = task?.taskKey || 'Task';

      const notifications = watchers
        .map((w) => (w.user._id ? w.user._id.toString() : w.user.toString()))
        .filter((uId) => uId !== uploadedByUserId)
        .map((recipientId) => ({
          recipient: recipientId,
          actor: uploadedByUserId,
          workspace: workspaceId,
          type: NotificationType.FILE_UPLOADED,
          entityType: NotificationEntityType.FILE,
          entityId: fileId,
          title: `File Attached to [${taskKey}]`,
          message: `${originalName} was attached to task ${taskKey}`,
          metadata: { taskId, fileId, taskKey },
        }));

      await notificationService.createBatchNotifications(notifications);
    } catch (err: any) {
      logger.error(`❌ [NotificationSubscriber] Error on FILE_UPLOADED: ${err.message}`);
    }
  });
}
