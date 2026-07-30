import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TaskService } from '../../src/services/task.service.js';

vi.mock('../../src/events/domainEventBus.js', () => ({
  domainEventBus: { publish: vi.fn() },
}));

vi.mock('../../src/utils/metrics.js', () => ({
  tasksCounter: { inc: vi.fn() },
}));

const validUserId = '65c9876543210fedcba54321';
const validBoardId = '65c1234567890abcdef12345';
const validProjId = '65c999998888777766665555';
const validWsId = '65c111112222333344445555';

const mockBoard = {
  _id: { toString: () => validBoardId },
  project: { _id: { toString: () => validProjId }, toString: () => validProjId },
  isArchived: false,
};

const mockProject = {
  _id: { toString: () => validProjId },
  workspace: { _id: { toString: () => validWsId }, toString: () => validWsId },
  slug: 'ALPHA',
  isArchived: false,
};

const mockTask = {
  _id: { toString: () => '65c000000000000000000001' },
  taskKey: 'ALPHA-1',
  title: 'Build Auth API',
  status: 'TODO',
  priority: 'HIGH',
  isArchived: false,
};

describe('TaskService Unit Tests', () => {
  let mockTaskRepo: any;
  let mockBoardRepo: any;
  let mockProjectRepo: any;
  let mockProjMemberRepo: any;
  let mockWsMemberRepo: any;
  let mockWatcherRepo: any;
  let mockHistoryRepo: any;
  let taskService: TaskService;

  beforeEach(() => {
    vi.clearAllMocks();
    mockTaskRepo = {
      create: vi.fn(),
      findById: vi.fn(),
      getNextTaskNumberInProject: vi.fn(),
      getMaxPositionInBoard: vi.fn().mockResolvedValue(0),
      getHighestPositionInColumn: vi.fn().mockResolvedValue(0),
      update: vi.fn(),
    };
    mockBoardRepo = { findById: vi.fn() };
    mockProjectRepo = { findById: vi.fn() };
    mockProjMemberRepo = { findByProjectAndUser: vi.fn() };
    mockWsMemberRepo = { findByUserAndWorkspace: vi.fn() };
    mockWatcherRepo = { watch: vi.fn().mockResolvedValue({}) };
    mockHistoryRepo = { create: vi.fn().mockResolvedValue({}) };

    taskService = new TaskService(
      mockTaskRepo as any,
      mockBoardRepo as any,
      mockProjectRepo as any,
      mockProjMemberRepo as any,
      mockWsMemberRepo as any,
      {} as any, {} as any, {} as any, mockWatcherRepo as any, mockHistoryRepo as any, {} as any
    );
  });

  describe('createTask', () => {
    it('should create a task with generated taskKey when target board exists', async () => {
      mockBoardRepo.findById.mockResolvedValue(mockBoard);
      mockProjectRepo.findById.mockResolvedValue(mockProject);
      mockWsMemberRepo.findByUserAndWorkspace.mockResolvedValue({ role: 'MEMBER' });
      mockProjMemberRepo.findByProjectAndUser.mockResolvedValue({ role: 'CONTRIBUTOR' });
      mockTaskRepo.getNextTaskNumberInProject.mockResolvedValue(1);
      mockTaskRepo.getMaxPositionInBoard.mockResolvedValue(0);
      mockTaskRepo.create.mockResolvedValue(mockTask);
      mockTaskRepo.findById.mockResolvedValue(mockTask);

      const task = await taskService.createTask(validUserId, {
        boardId: validBoardId,
        title: 'Build Auth API',
      });

      expect(task).toEqual(mockTask);
      expect(mockTaskRepo.create).toHaveBeenCalledOnce();
    });

    it('should throw 404 if target board is not found', async () => {
      mockBoardRepo.findById.mockResolvedValue(null);

      await expect(
        taskService.createTask(validUserId, {
          boardId: validBoardId,
          title: 'Orphan Task',
        })
      ).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe('parseMentions', () => {
    it('should extract user handles from markdown content', async () => {
      const mentions = await taskService.parseMentions('CC: @john_doe and @jane-smith please check');
      expect(mentions).toEqual(['john_doe', 'jane-smith']);
    });

    it('should return empty array when no mentions are present', async () => {
      const mentions = await taskService.parseMentions('Just regular plain text');
      expect(mentions).toEqual([]);
    });
  });
});
