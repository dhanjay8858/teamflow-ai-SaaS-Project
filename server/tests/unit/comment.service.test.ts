import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CommentService } from '../../src/services/comment.service.js';

vi.mock('../../src/events/domainEventBus.js', () => ({
  domainEventBus: { publish: vi.fn() },
}));

vi.mock('../../src/utils/metrics.js', () => ({
  commentsCounter: { inc: vi.fn() },
}));

const validTaskId = '65c1234567890abcdef12345';
const validUserId = '65c9876543210fedcba54321';
const validWsId = '65c111112222333344445555';
const validProjId = '65c999998888777766665555';

const mockTask = {
  _id: { toString: () => validTaskId },
  workspace: { _id: { toString: () => validWsId }, toString: () => validWsId },
  project: { _id: { toString: () => validProjId }, toString: () => validProjId },
  isArchived: false,
};

const mockComment = {
  _id: { toString: () => '65c000000000000000000001' },
  task: { toString: () => validTaskId },
  markdown: 'Looks good!',
  author: { toString: () => validUserId },
};

describe('CommentService Unit Tests', () => {
  let mockCommentRepo: any;
  let mockReactionRepo: any;
  let mockWsMemberRepo: any;
  let mockTaskRepo: any;
  let mockProjMemberRepo: any;
  let commentService: CommentService;

  beforeEach(() => {
    vi.clearAllMocks();
    mockCommentRepo = {
      create: vi.fn(),
      findTaskComments: vi.fn(),
      countTaskComments: vi.fn(),
      findReplies: vi.fn(),
    };
    mockReactionRepo = { findByCommentIds: vi.fn() };
    mockWsMemberRepo = { findByUserAndWorkspace: vi.fn() };
    mockTaskRepo = { findById: vi.fn() };
    mockProjMemberRepo = { findByProjectAndUser: vi.fn() };

    commentService = new CommentService(
      mockCommentRepo as any,
      mockReactionRepo as any,
      mockWsMemberRepo as any,
      mockTaskRepo as any,
      mockProjMemberRepo as any,
      {} as any, {} as any
    );
  });

  describe('createComment', () => {
    it('should create a comment with markdown content when user is project member', async () => {
      mockTaskRepo.findById.mockResolvedValue(mockTask);
      mockWsMemberRepo.findByUserAndWorkspace.mockResolvedValue({ role: 'MEMBER' });
      mockProjMemberRepo.findByProjectAndUser.mockResolvedValue({ role: 'CONTRIBUTOR' });
      mockCommentRepo.create.mockResolvedValue(mockComment);

      const comment = await commentService.createComment(validUserId, {
        taskId: validTaskId,
        markdown: 'Looks good!',
      });

      expect(comment).toEqual(mockComment);
      expect(mockCommentRepo.create).toHaveBeenCalledOnce();
    });

    it('should throw 404 if task does not exist', async () => {
      mockTaskRepo.findById.mockResolvedValue(null);

      await expect(
        commentService.createComment(validUserId, {
          taskId: validTaskId,
          markdown: 'Hello',
        })
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    it('should throw 403 if user is not in the workspace', async () => {
      mockTaskRepo.findById.mockResolvedValue(mockTask);
      mockWsMemberRepo.findByUserAndWorkspace.mockResolvedValue(null);

      await expect(
        commentService.createComment(validUserId, {
          taskId: validTaskId,
          markdown: 'Hello',
        })
      ).rejects.toMatchObject({ statusCode: 403 });
    });
  });
});
