import { searchNotifications } from '../tools/notification.tools.js';

export class NotificationRetriever {
  public async retrieve(userId: string): Promise<string> {
    const notifications = await searchNotifications(userId, 5);
    if (notifications.length === 0) return 'No recent notifications';
    return `Recent Notifications (${notifications.length}): ` + notifications.map((n) => `${n.title}: ${n.message}`).join(' | ');
  }
}

export const notificationRetriever = new NotificationRetriever();
