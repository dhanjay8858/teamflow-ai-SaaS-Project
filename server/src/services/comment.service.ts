import { Types } from 'mongoose';
import {
  commentRepository,
  CommentRepository,
} from '../repositories/comment.repository.js';
import {
  commentReactionRepository,
  CommentReactionRepository,
} from '../repositories/commentReaction.repository.js';
import { membershipRepository, MembershipRepository } from '../repositories/membership.repository.js';
import { taskRepository, TaskRepository } from '../repositories/task.repository.js';
import { projectMemberRepository, ProjectMemberRepository } from '../repositories/projectMember.repository.js';
import { fileRepository, FileRepository } from '../repositories/file.repository.js';
import { userRepository, UserRepository } from '../repositories/user.repository.js';
import { ICommentDocument, ICommentReactionDocument, CreateCommentInput, CreateReplyInput, UpdateCommentInput } from '../types/comment.types.js';
import { ProjectMemberRole } from '../types/project.types.js';
import { AppError } from '../utils/appError.js';
import { domainEventBus } from '../events/domainEventBus.js';
import { DomainEventType } from '../types/activity.types.js';
import { commentsCounter } from '../utils/metrics.js';

/** Allowed emojis to avoid arbitrary Unicode injection */
const ALLOWED_EMOJIS = new Set([
  '👍','👎','❤️','😄','😕','🎉','🚀','👀','🙏','💯',
  '😂','😮','😢','😡','💪','✅','❌','🔥','💡','⚡',
]);

export class CommentService {
  constructor(
    private commentRepo: CommentRepository = commentRepository,
    private reactionRepo: CommentReactionRepository = commentReactionRepository,
    private wsMemberRepo: MembershipRepository = membershipRepository,
    private taskRepo: TaskRepository = taskRepository,
    private projMemberRepo: ProjectMemberRepository = projectMemberRepository,
    private fileRepo: FileRepository = fileRepository,
    private userRepo: UserRepository = userRepository
  ) {}

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private async getTaskAndVerifyWorkspace(taskId: string, userId: string) {
    const task = await this.taskRepo.findById(taskId);
    if (!task || task.isArchived) throw AppError.notFound('Task not found');

    const workspaceId = task.workspace._id
      ? task.workspace._id.toString()
      : task.workspace.toString();

    const membership = await this.wsMemberRepo.findByUserAndWorkspace(userId, workspaceId);
    if (!membership) throw AppError.forbidden('You are not a member of this workspace');

    return { task, workspaceId };
  }

  private async verifyProjectContributor(projectId: string, userId: string): Promise<void> {
    const projectMember = await this.projMemberRepo.findByProjectAndUser(projectId, userId);
    if (!projectMember) {
      throw AppError.forbidden('You must be a project member to post comments');
    }
    if (projectMember.role === ProjectMemberRole.VIEWER) {
      throw AppError.forbidden('Viewers cannot create comments');
    }
  }

  private async resolveAndValidateAttachments(
    attachmentIds: string[] | undefined,
    taskId: string,
    workspaceId: string
  ): Promise<Types.ObjectId[]> {
    if (!attachmentIds || attachmentIds.length === 0) return [];

    const resolvedIds: Types.ObjectId[] = [];
    for (const fileId of attachmentIds) {
      const file = await this.fileRepo.findById(fileId);
      if (!file) throw AppError.notFound(`Attachment ${fileId} not found`);
      if (file.workspace.toString() !== workspaceId) {
        throw AppError.forbidden(`Attachment ${fileId} does not belong to this workspace`);
      }
      // Verify the file is associated with the same task or project (loose check)
      const fileTaskId = file.task?._id ? file.task._id.toString() : file.task?.toString();
      if (fileTaskId && fileTaskId !== taskId) {
        throw AppError.forbidden(`Attachment ${fileId} belongs to a different task`);
      }
      resolvedIds.push(new Types.ObjectId(fileId));
    }
    return resolvedIds;
  }

  private parseMentionUsernames(markdown: string): string[] {
    const matches = markdown.match(/@([a-zA-Z0-9_-]+)/g);
    if (!matches) return [];
    return Array.from(new Set(matches.map((m) => m.slice(1))));
  }

  private async resolveMentionedUsers(markdown: string): Promise<Types.ObjectId[]> {
    const usernames = this.parseMentionUsernames(markdown);
    if (usernames.length === 0) return [];

    const resolvedIds: Types.ObjectId[] = [];
    for (const username of usernames) {
      const user = await this.userRepo.findByUsername(username);
      if (user) resolvedIds.push(user._id);
    }
    return resolvedIds;
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  public async getTaskComments(
    userId: string,
    taskId: string,
    page = 1,
    limit = 50
  ): Promise<{ comments: ICommentDocument[]; total: number; replies: Record<string, ICommentDocument[]>; reactions: ICommentReactionDocument[] }> {
    const { task } = await this.getTaskAndVerifyWorkspace(taskId, userId);

    const [comments, total] = await Promise.all([
      this.commentRepo.findTaskComments(taskId, page, limit),
      this.commentRepo.countTaskComments(taskId),
    ]);

    // Batch-fetch replies for all top-level comments (avoids N+1)
    const topLevelIds = comments.map((c) => c._id);
    const allRepliesFlat = topLevelIds.length
      ? await Promise.all(topLevelIds.map((id) => this.commentRepo.findReplies(id)))
      : [];

    const repliesMap: Record<string, ICommentDocument[]> = {};
    topLevelIds.forEach((id, idx) => {
      repliesMap[id.toString()] = allRepliesFlat[idx] || [];
    });

    // Batch-fetch reactions (avoids N+1)
    const allCommentIds = [
      ...topLevelIds,
      ...allRepliesFlat.flat().map((r) => r._id),
    ];
    const reactions = allCommentIds.length
      ? await this.reactionRepo.findByCommentIds(allCommentIds)
      : [];

    void task; // silence unused warning
    return { comments, total, replies: repliesMap, reactions };
  }

  public async createComment(userId: string, input: CreateCommentInput): Promise<ICommentDocument> {
    const { task, workspaceId } = await this.getTaskAndVerifyWorkspace(input.taskId, userId);

    const projectId = task.project._id ? task.project._id.toString() : task.project.toString();
    await this.verifyProjectContributor(projectId, userId);

    const attachments = await this.resolveAndValidateAttachments(
      input.attachmentIds,
      input.taskId,
      workspaceId
    );
    const mentionedUsers = await this.resolveMentionedUsers(input.markdown);

    const comment = await this.commentRepo.create({
      task: new Types.ObjectId(input.taskId),
      parentComment: null,
      author: new Types.ObjectId(userId),
      markdown: input.markdown.trim(),
      mentionedUsers,
      attachments,
      isEdited: false,
      editedAt: null,
      deletedAt: null,
      replyCount: 0,
    });

    commentsCounter.inc();

    domainEventBus.publish(DomainEventType.COMMENT_CREATED, {
      commentId: comment._id.toString(),
      taskId: input.taskId,
      workspaceId,
      projectId,
      authorUserId: userId,
      mentionedUserIds: mentionedUsers.map((id) => id.toString()),
    });

    if (mentionedUsers.length > 0) {
      const usernames = this.parseMentionUsernames(input.markdown);
      domainEventBus.publish(DomainEventType.MENTIONS_PARSED, {
        taskId: input.taskId,
        commentId: comment._id.toString(),
        mentionedUsernames: usernames,
        parsedByUserId: userId,
      });
    }

    return comment;
  }

  public async createReply(userId: string, input: CreateReplyInput): Promise<ICommentDocument> {
    const parentComment = await this.commentRepo.findById(input.parentCommentId);
    if (!parentComment) throw AppError.notFound('Parent comment not found');
    if (parentComment.deletedAt) throw AppError.badRequest('Cannot reply to a deleted comment');

    // Enforce maximum reply depth of 2 (Comment → Reply only, no Reply → Reply)
    if (parentComment.parentComment !== null) {
      throw AppError.badRequest('Replies cannot be nested more than one level deep');
    }

    const { task, workspaceId } = await this.getTaskAndVerifyWorkspace(input.taskId, userId);
    const projectId = task.project._id ? task.project._id.toString() : task.project.toString();
    await this.verifyProjectContributor(projectId, userId);

    const attachments = await this.resolveAndValidateAttachments(
      input.attachmentIds,
      input.taskId,
      workspaceId
    );
    const mentionedUsers = await this.resolveMentionedUsers(input.markdown);

    const reply = await this.commentRepo.create({
      task: new Types.ObjectId(input.taskId),
      parentComment: new Types.ObjectId(input.parentCommentId),
      author: new Types.ObjectId(userId),
      markdown: input.markdown.trim(),
      mentionedUsers,
      attachments,
      isEdited: false,
      editedAt: null,
      deletedAt: null,
      replyCount: 0,
    });

    // Update denormalized reply count on parent
    await this.commentRepo.incrementReplyCount(input.parentCommentId, 1);
    commentsCounter.inc();

    domainEventBus.publish(DomainEventType.COMMENT_REPLIED, {
      replyId: reply._id.toString(),
      parentCommentId: input.parentCommentId,
      taskId: input.taskId,
      workspaceId,
      projectId,
      authorUserId: userId,
      mentionedUserIds: mentionedUsers.map((id) => id.toString()),
    });

    return reply;
  }

  public async updateComment(
    userId: string,
    commentId: string,
    input: UpdateCommentInput
  ): Promise<ICommentDocument> {
    const comment = await this.commentRepo.findById(commentId);
    if (!comment) throw AppError.notFound('Comment not found');
    if (comment.deletedAt) throw AppError.badRequest('Cannot edit a deleted comment');

    const authorId = comment.author._id ? comment.author._id.toString() : comment.author.toString();
    if (authorId !== userId) {
      throw AppError.forbidden('Only the comment author can edit this comment');
    }

    const { workspaceId } = await this.getTaskAndVerifyWorkspace(comment.task.toString(), userId);

    const attachments = await this.resolveAndValidateAttachments(
      input.attachmentIds,
      comment.task.toString(),
      workspaceId
    );
    const mentionedUsers = await this.resolveMentionedUsers(input.markdown);

    const updated = await this.commentRepo.update(commentId, {
      markdown: input.markdown.trim(),
      mentionedUsers,
      attachments,
      isEdited: true,
      editedAt: new Date(),
    });

    if (!updated) throw AppError.internal('Failed to update comment');

    domainEventBus.publish(DomainEventType.COMMENT_UPDATED, {
      commentId,
      taskId: comment.task.toString(),
      workspaceId,
      updatedByUserId: userId,
    });

    return updated;
  }

  public async deleteComment(userId: string, commentId: string): Promise<void> {
    const comment = await this.commentRepo.findById(commentId);
    if (!comment) throw AppError.notFound('Comment not found');
    if (comment.deletedAt) throw AppError.badRequest('Comment is already deleted');

    const { task, workspaceId } = await this.getTaskAndVerifyWorkspace(comment.task.toString(), userId);

    const authorId = comment.author._id ? comment.author._id.toString() : comment.author.toString();
    const projectId = task.project._id ? task.project._id.toString() : task.project.toString();

    // Author OR Project Manager/Owner can delete
    if (authorId !== userId) {
      const projMember = await this.projMemberRepo.findByProjectAndUser(projectId, userId);
      const canDelete =
        projMember &&
        (projMember.role === ProjectMemberRole.MANAGER || projMember.role === ProjectMemberRole.OWNER);
      if (!canDelete) {
        throw AppError.forbidden('Only the author or a project manager can delete this comment');
      }
    }

    await this.commentRepo.softDelete(commentId);

    domainEventBus.publish(DomainEventType.COMMENT_DELETED, {
      commentId,
      taskId: comment.task.toString(),
      workspaceId,
      deletedByUserId: userId,
    });
  }

  public async restoreComment(userId: string, commentId: string, originalMarkdown: string): Promise<ICommentDocument> {
    const comment = await this.commentRepo.findById(commentId);
    if (!comment) throw AppError.notFound('Comment not found');
    if (!comment.deletedAt) throw AppError.badRequest('Comment is not deleted');

    const authorId = comment.author._id ? comment.author._id.toString() : comment.author.toString();
    if (authorId !== userId) {
      throw AppError.forbidden('Only the original author can restore this comment');
    }

    const { workspaceId } = await this.getTaskAndVerifyWorkspace(comment.task.toString(), userId);

    const restored = await this.commentRepo.restore(commentId, originalMarkdown);
    if (!restored) throw AppError.internal('Failed to restore comment');

    domainEventBus.publish(DomainEventType.COMMENT_RESTORED, {
      commentId,
      taskId: comment.task.toString(),
      workspaceId,
      restoredByUserId: userId,
    });

    return restored;
  }

  public async addReaction(
    userId: string,
    commentId: string,
    emoji: string
  ): Promise<ICommentReactionDocument> {
    if (!ALLOWED_EMOJIS.has(emoji)) {
      throw AppError.badRequest(`Emoji "${emoji}" is not allowed`);
    }

    const comment = await this.commentRepo.findById(commentId);
    if (!comment) throw AppError.notFound('Comment not found');

    await this.getTaskAndVerifyWorkspace(comment.task.toString(), userId);

    const existing = await this.reactionRepo.findOne(commentId, userId, emoji);
    if (existing) throw AppError.conflict('You have already reacted with this emoji');

    const reaction = await this.reactionRepo.create({
      comment: new Types.ObjectId(commentId),
      user: new Types.ObjectId(userId),
      emoji,
    });

    domainEventBus.publish(DomainEventType.COMMENT_REACTION_ADDED, {
      commentId,
      reactionId: reaction._id.toString(),
      emoji,
      userId,
      taskId: comment.task.toString(),
    });

    return reaction;
  }

  public async removeReaction(userId: string, commentId: string, emoji: string): Promise<void> {
    const comment = await this.commentRepo.findById(commentId);
    if (!comment) throw AppError.notFound('Comment not found');

    await this.getTaskAndVerifyWorkspace(comment.task.toString(), userId);

    const existing = await this.reactionRepo.findOne(commentId, userId, emoji);
    if (!existing) throw AppError.notFound('Reaction not found');

    await this.reactionRepo.remove(commentId, userId, emoji);

    domainEventBus.publish(DomainEventType.COMMENT_REACTION_REMOVED, {
      commentId,
      emoji,
      userId,
      taskId: comment.task.toString(),
    });
  }

  public async getCommentReactions(userId: string, commentId: string): Promise<ICommentReactionDocument[]> {
    const comment = await this.commentRepo.findById(commentId);
    if (!comment) throw AppError.notFound('Comment not found');
    await this.getTaskAndVerifyWorkspace(comment.task.toString(), userId);
    return this.reactionRepo.findByCommentId(commentId);
  }
}

export const commentService = new CommentService();
