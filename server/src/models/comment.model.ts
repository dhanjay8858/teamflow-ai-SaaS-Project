import { Schema, model } from 'mongoose';
import { ICommentDocument } from '../types/comment.types.js';

const commentSchema = new Schema<ICommentDocument>(
  {
    task: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      required: [true, 'Task reference is required'],
    },
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
    },
    markdown: {
      type: String,
      required: [true, 'Comment body is required'],
      maxlength: [50000, 'Comment cannot exceed 50,000 characters'],
    },
    mentionedUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    attachments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'File',
      },
    ],
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
      default: null,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    replyCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Performance indexes
commentSchema.index({ task: 1, parentComment: 1, createdAt: 1 });
commentSchema.index({ task: 1, deletedAt: 1, createdAt: -1 });
commentSchema.index({ author: 1, createdAt: -1 });

export const CommentModel = model<ICommentDocument>('Comment', commentSchema);
