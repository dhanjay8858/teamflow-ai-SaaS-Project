import { Types } from 'mongoose';
import { NotificationModel } from '../models/notification.model.js';
import {
  INotificationDocument,
  CreateNotificationInput,
  CursorPaginatedNotifications,
} from '../types/notification.types.js';

const ACTOR_SELECT = 'name username avatar';

export class NotificationRepository {
  public async create(data: CreateNotificationInput): Promise<INotificationDocument> {
    const notification = await NotificationModel.create(data);
    return NotificationModel.findById(notification._id)
      .populate('actor', ACTOR_SELECT)
      .exec() as Promise<INotificationDocument>;
  }

  public async createMany(dataArray: CreateNotificationInput[]): Promise<INotificationDocument[]> {
    if (!dataArray || dataArray.length === 0) return [];
    const inserted = await NotificationModel.insertMany(dataArray);
    const ids = inserted.map((doc) => doc._id);
    return NotificationModel.find({ _id: { $in: ids } })
      .populate('actor', ACTOR_SELECT)
      .sort({ createdAt: -1 })
      .exec();
  }

  public async findByRecipient(
    recipientId: string | Types.ObjectId,
    limit = 20,
    cursor?: string
  ): Promise<CursorPaginatedNotifications> {
    const filter: Record<string, unknown> = {
      recipient: new Types.ObjectId(recipientId.toString()),
    };

    if (cursor) {
      filter._id = { $lt: new Types.ObjectId(cursor) };
    }

    const items = await NotificationModel.find(filter)
      .populate('actor', ACTOR_SELECT)
      .sort({ _id: -1 })
      .limit(limit + 1)
      .exec();

    const hasMore = items.length > limit;
    const notifications = hasMore ? items.slice(0, limit) : items;
    const nextCursor = hasMore && notifications.length > 0
      ? notifications[notifications.length - 1]._id.toString()
      : null;

    return {
      notifications,
      nextCursor,
      hasMore,
    };
  }

  public async unreadCount(recipientId: string | Types.ObjectId): Promise<number> {
    return NotificationModel.countDocuments({
      recipient: new Types.ObjectId(recipientId.toString()),
      isRead: false,
    }).exec();
  }

  public async markRead(
    id: string | Types.ObjectId,
    recipientId: string | Types.ObjectId
  ): Promise<INotificationDocument | null> {
    return NotificationModel.findOneAndUpdate(
      { _id: id, recipient: recipientId },
      { isRead: true, readAt: new Date() },
      { new: true }
    )
      .populate('actor', ACTOR_SELECT)
      .exec();
  }

  public async markAllRead(recipientId: string | Types.ObjectId): Promise<number> {
    const result = await NotificationModel.updateMany(
      { recipient: recipientId, isRead: false },
      { isRead: true, readAt: new Date() }
    ).exec();
    return result.modifiedCount;
  }

  public async delete(
    id: string | Types.ObjectId,
    recipientId: string | Types.ObjectId
  ): Promise<boolean> {
    const result = await NotificationModel.deleteOne({
      _id: id,
      recipient: recipientId,
    }).exec();
    return result.deletedCount > 0;
  }
}

export const notificationRepository = new NotificationRepository();
