import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationService } from '../../src/services/notification.service.js';

vi.mock('../../src/events/domainEventBus.js', () => ({
  domainEventBus: { publish: vi.fn() },
}));

vi.mock('../../src/socket/socket.server.js', () => ({
  SocketServer: {
    getInstance: vi.fn().mockReturnValue({ emitToUser: vi.fn() }),
  },
}));

vi.mock('../../src/utils/logger.js', () => ({
  logger: { error: vi.fn() },
}));

const mockNotification = {
  _id: { toString: () => 'notif-123' },
  recipient: { toString: () => 'user-456' },
  actor: { toString: () => 'user-123' },
  type: 'TASK_ASSIGNED',
  title: 'Task Assigned',
  message: 'ALPHA-1 assigned to you',
};

describe('NotificationService Unit Tests', () => {
  let mockNotifRepo: any;
  let notificationService: NotificationService;

  beforeEach(() => {
    vi.clearAllMocks();
    mockNotifRepo = {
      create: vi.fn(),
      unreadCount: vi.fn().mockResolvedValue(1),
    };
    notificationService = new NotificationService(mockNotifRepo as any);
  });

  describe('createNotification', () => {
    it('should create a notification for a user and emit socket event', async () => {
      mockNotifRepo.create.mockResolvedValue(mockNotification);

      const notif = await notificationService.createNotification({
        recipient: 'user-456' as any,
        actor: 'user-123' as any,
        type: 'TASK_ASSIGNED' as any,
        title: 'Task Assigned',
        message: 'ALPHA-1 assigned to you',
      });

      expect(notif).toEqual(mockNotification);
      expect(mockNotifRepo.create).toHaveBeenCalledOnce();
    });

    it('should return null to prevent self-notification when actor equals recipient', async () => {
      const notif = await notificationService.createNotification({
        recipient: 'user-123' as any,
        actor: 'user-123' as any, // Same user!
        type: 'TASK_ASSIGNED' as any,
        title: 'Self Action',
        message: 'You did this to yourself',
      });

      expect(notif).toBeNull();
      expect(mockNotifRepo.create).not.toHaveBeenCalled();
    });
  });
});
