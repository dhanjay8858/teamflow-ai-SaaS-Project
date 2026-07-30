import { notificationRepository } from '../../repositories/notification.repository.js';

export async function searchNotifications(userId: string, limit = 10) {
  const result = await notificationRepository.findByRecipient(userId, limit);
  return result.notifications.map((n) => ({
    id: n._id.toString(),
    type: n.type,
    title: n.title,
    message: n.message,
    isRead: n.isRead,
    createdAt: n.createdAt,
  }));
}
