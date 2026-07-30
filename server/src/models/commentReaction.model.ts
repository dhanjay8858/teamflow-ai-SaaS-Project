import { Schema, model } from 'mongoose';
import { ICommentReactionDocument } from '../types/comment.types.js';

const commentReactionSchema = new Schema<ICommentReactionDocument>(
  {
    comment: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
      required: [true, 'Comment reference is required'],
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    emoji: {
      type: String,
      required: [true, 'Emoji is required'],
      trim: true,
      maxlength: [10, 'Emoji value is too long'],
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Enforce one reaction per (comment, user, emoji) triple
commentReactionSchema.index({ comment: 1, user: 1, emoji: 1 }, { unique: true });
commentReactionSchema.index({ comment: 1 });

export const CommentReactionModel = model<ICommentReactionDocument>('CommentReaction', commentReactionSchema);
