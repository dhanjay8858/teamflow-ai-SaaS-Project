import {
  notificationRepository,
  NotificationRepository,
} from '../repositories/notification.repository.js';
import { SocketServer } from '../socket/socket.server.js';
import {
  INotificationDocument,
  CreateNotificationInput,
  CursorPaginatedNotifications,
} from '../types/notification.types.js';
import { AppError } from '../utils/appError.js';
import { domainEventBus } from '../events/domainEventBus.js';
import { DomainEventType } from '../types/activity.types.js';
import { logger } from '../utils/logger.js';

export class NotificationService {
  constructor(private notificationRepo: NotificationRepository = notificationRepository) {}

  private emitSocketEvent(userId: string, eventName: string, data: unknown): void {
    const socketServer = SocketServer.getInstance();
    if (socketServer) {
      socketServer.emitToUser(userId, eventName, data);
    }
  }

  private async notifyUnreadCountChanged(userId: string): Promise<void> {
    const unreadCount = await this.notificationRepo.unreadCount(userId);
    this.emitSocketEvent(userId, 'UNREAD_COUNT_UPDATED', { unreadCount });
    domainEventBus.publish(DomainEventType.UNREAD_COUNT_UPDATED, { userId, unreadCount });
  }

  public async createNotification(input: CreateNotificationInput): Promise<INotificationDocument | null> {
    // Avoid self-notification
    if (input.recipient.toString() === input.actor.toString()) {
      return null;
    }

    try {
      const notification = await this.notificationRepo.create(input);
      const recipientId = notification.recipient.toString();

      // Real-time socket emission
      this.emitSocketEvent(recipientId, 'NOTIFICATION_CREATED', { notification });
      await this.notifyUnreadCountChanged(recipientId);

      domainEventBus.publish(DomainEventType.NOTIFICATION_CREATED, {
        notificationId: notification._id.toString(),
        recipientId,
        actorId: input.actor.toString(),
        type: notification.type,
      });

      return notification;
    } catch (err: any) {
      logger.error(`❌ [NotificationService] Failed to create notification: ${err.message}`);
      return null;
    }
  }

  public async createBatchNotifications(inputArray: CreateNotificationInput[]): Promise<INotificationDocument[]> {
    // Filter out self-notifications
    const validInputs = inputArray.filter(
      (inp) => inp.recipient.toString() !== inp.actor.toString()
    );
    if (validInputs.length === 0) return [];

    try {
      const notifications = await this.notificationRepo.createMany(validInputs);

      // Emit sockets to each recipient & update unread counts
      const recipientIds = new Set<string>();
      for (const notif of notifications) {
        const rId = notif.recipient.toString();
        recipientIds.add(rId);
        this.emitSocketEvent(rId, 'NOTIFICATION_CREATED', { notification: notif });
      }

      for (const rId of recipientIds) {
        void this.notifyUnreadCountChanged(rId);
      }

      return notifications;
    } catch (err: any) {
      logger.error(`❌ [NotificationService] Failed batch create notifications: ${err.message}`);
      return [];
    }
  }

  public async getNotifications(
    userId: string,
    limit = 20,
    cursor?: string
  ): Promise<CursorPaginatedNotifications> {
    return this.notificationRepo.findByRecipient(userId, limit, cursor);
  }

  public async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepo.unreadCount(userId);
  }

  public async markRead(userId: string, notificationId: string): Promise<INotificationDocument> {
    const updated = await this.notificationRepo.markRead(notificationId, userId);
    if (!updated) {
      throw AppError.notFound('Notification not found or access denied');
    }

    this.emitSocketEvent(userId, 'NOTIFICATION_READ', { notificationId });
    await this.notifyUnreadCountChanged(userId);

    domainEventBus.publish(DomainEventType.NOTIFICATION_READ, {
      notificationId,
      userId,
    });

    return updated;
  }

  public async markAllRead(userId: string): Promise<{ modifiedCount: number }> {
    const modifiedCount = await this.notificationRepo.markAllRead(userId);

    this.emitSocketEvent(userId, 'NOTIFICATION_READ_ALL', { modifiedCount });
    await this.notifyUnreadCountChanged(userId);

    return { modifiedCount };
  }

  public async deleteNotification(userId: string, notificationId: string): Promise<void> {
    const deleted = await this.notificationRepo.delete(notificationId, userId);
    if (!deleted) {
      throw AppError.notFound('Notification not found or access denied');
    }

    this.emitSocketEvent(userId, 'NOTIFICATION_DELETED', { notificationId });
    await this.notifyUnreadCountChanged(userId);

    domainEventBus.publish(DomainEventType.NOTIFICATION_DELETED, {
      notificationId,
      userId,
    });
  }
}

export const notificationService = new NotificationService();
