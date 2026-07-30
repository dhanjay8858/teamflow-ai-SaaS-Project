import { Types } from 'mongoose';
import { CommentReactionModel } from '../models/commentReaction.model.js';
import { ICommentReactionDocument } from '../types/comment.types.js';

export class CommentReactionRepository {
  public async findByCommentId(commentId: string | Types.ObjectId): Promise<ICommentReactionDocument[]> {
    return CommentReactionModel.find({ comment: commentId })
      .populate('user', 'name username avatar')
      .exec();
  }

  public async findOne(
    commentId: string | Types.ObjectId,
    userId: string | Types.ObjectId,
    emoji: string
  ): Promise<ICommentReactionDocument | null> {
    return CommentReactionModel.findOne({ comment: commentId, user: userId, emoji }).exec();
  }

  public async create(data: {
    comment: Types.ObjectId | string;
    user: Types.ObjectId | string;
    emoji: string;
  }): Promise<ICommentReactionDocument> {
    return CommentReactionModel.create(data);
  }

  public async remove(
    commentId: string | Types.ObjectId,
    userId: string | Types.ObjectId,
    emoji: string
  ): Promise<void> {
    await CommentReactionModel.findOneAndDelete({ comment: commentId, user: userId, emoji }).exec();
  }

  /** Bulk-fetch reactions for an array of comment IDs (avoids N+1) */
  public async findByCommentIds(commentIds: Array<string | Types.ObjectId>): Promise<ICommentReactionDocument[]> {
    return CommentReactionModel.find({ comment: { $in: commentIds } })
      .populate('user', 'name username avatar')
      .exec();
  }
}

export const commentReactionRepository = new CommentReactionRepository();
