import { Types } from 'mongoose';
import { CommentModel } from '../models/comment.model.js';
import { ICommentDocument } from '../types/comment.types.js';

const AUTHOR_SELECT = 'name username avatar';
const FILE_SELECT = 'displayName url thumbnailUrl mimeType size extension';

export class CommentRepository {
  /** Find a comment by ID regardless of deletion state */
  public async findById(id: string | Types.ObjectId): Promise<ICommentDocument | null> {
    return CommentModel.findById(id)
      .populate('author', AUTHOR_SELECT)
      .populate('mentionedUsers', AUTHOR_SELECT)
      .populate('attachments', FILE_SELECT)
      .exec();
  }

  /**
   * List top-level comments for a task (parentComment is null),
   * with pagination support. Deleted comments are included but
   * markdown is masked by the service layer.
   */
  public async findTaskComments(
    taskId: string | Types.ObjectId,
    page = 1,
    limit = 50
  ): Promise<ICommentDocument[]> {
    const skip = (page - 1) * limit;
    return CommentModel.find({ task: taskId, parentComment: null })
      .populate('author', AUTHOR_SELECT)
      .populate('mentionedUsers', AUTHOR_SELECT)
      .populate('attachments', FILE_SELECT)
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  public async countTaskComments(taskId: string | Types.ObjectId): Promise<number> {
    return CommentModel.countDocuments({ task: taskId, parentComment: null }).exec();
  }

  /** List all direct replies to a parent comment */
  public async findReplies(parentCommentId: string | Types.ObjectId): Promise<ICommentDocument[]> {
    return CommentModel.find({ parentComment: parentCommentId })
      .populate('author', AUTHOR_SELECT)
      .populate('mentionedUsers', AUTHOR_SELECT)
      .populate('attachments', FILE_SELECT)
      .sort({ createdAt: 1 })
      .exec();
  }

  public async create(data: Partial<ICommentDocument>): Promise<ICommentDocument> {
    return CommentModel.create(data);
  }

  public async update(
    id: string | Types.ObjectId,
    data: Partial<ICommentDocument>
  ): Promise<ICommentDocument | null> {
    return CommentModel.findByIdAndUpdate(id, data, { new: true, runValidators: true })
      .populate('author', AUTHOR_SELECT)
      .populate('mentionedUsers', AUTHOR_SELECT)
      .populate('attachments', FILE_SELECT)
      .exec();
  }

  public async softDelete(id: string | Types.ObjectId): Promise<ICommentDocument | null> {
    return CommentModel.findByIdAndUpdate(
      id,
      { deletedAt: new Date(), markdown: '_Comment deleted_', mentionedUsers: [], attachments: [] },
      { new: true }
    ).exec();
  }

  public async restore(id: string | Types.ObjectId, originalMarkdown: string): Promise<ICommentDocument | null> {
    return CommentModel.findByIdAndUpdate(
      id,
      { deletedAt: null, markdown: originalMarkdown },
      { new: true }
    ).exec();
  }

  /** Increment or decrement the denormalized replyCount on the parent comment */
  public async incrementReplyCount(parentId: string | Types.ObjectId, delta: 1 | -1): Promise<void> {
    await CommentModel.findByIdAndUpdate(parentId, { $inc: { replyCount: delta } }).exec();
  }
}

export const commentRepository = new CommentRepository();
