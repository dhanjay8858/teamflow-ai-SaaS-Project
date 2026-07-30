import { Document, Types } from 'mongoose';

export interface IComment {
  _id: Types.ObjectId;
  task: Types.ObjectId;
  parentComment: Types.ObjectId | null;
  author: Types.ObjectId;
  markdown: string;
  mentionedUsers: Types.ObjectId[];
  attachments: Types.ObjectId[];
  isEdited: boolean;
  editedAt: Date | null;
  deletedAt: Date | null;
  replyCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICommentDocument extends Omit<IComment, '_id'>, Document {
  _id: Types.ObjectId;
}

export interface ICommentReaction {
  _id: Types.ObjectId;
  comment: Types.ObjectId;
  user: Types.ObjectId;
  emoji: string;
  createdAt: Date;
}

export interface ICommentReactionDocument extends Omit<ICommentReaction, '_id'>, Document {
  _id: Types.ObjectId;
}

// Populated versions for API responses
export interface ICommentWithReactions extends ICommentDocument {
  reactions?: ICommentReactionDocument[];
  replies?: ICommentDocument[];
}

export interface CreateCommentInput {
  taskId: string;
  markdown: string;
  attachmentIds?: string[];
}

export interface CreateReplyInput {
  parentCommentId: string;
  taskId: string;
  markdown: string;
  attachmentIds?: string[];
}

export interface UpdateCommentInput {
  markdown: string;
  attachmentIds?: string[];
}
