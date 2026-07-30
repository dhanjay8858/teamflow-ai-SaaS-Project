import { FileItem } from './file';

export interface CommentAuthor {
  _id: string;
  name: string;
  username: string;
  avatar?: string | null;
}

export interface Comment {
  _id: string;
  task: string;
  parentComment: string | null;
  author: CommentAuthor;
  markdown: string;
  mentionedUsers: CommentAuthor[];
  attachments: FileItem[];
  isEdited: boolean;
  editedAt: string | null;
  deletedAt: string | null;
  replyCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CommentReaction {
  _id: string;
  comment: string;
  user: CommentAuthor;
  emoji: string;
  createdAt: string;
}

/** Groups reactions by emoji → users who reacted */
export interface ReactionGroup {
  emoji: string;
  count: number;
  users: CommentAuthor[];
  hasReacted: boolean;
}

export interface TaskCommentsResult {
  comments: Comment[];
  total: number;
  replies: Record<string, Comment[]>;
  reactions: CommentReaction[];
}

export interface CreateCommentPayload {
  taskId: string;
  markdown: string;
  attachmentIds?: string[];
}

export interface CreateReplyPayload {
  taskId: string;
  markdown: string;
  attachmentIds?: string[];
}

export interface UpdateCommentPayload {
  markdown: string;
  attachmentIds?: string[];
}

export const ALLOWED_EMOJIS = [
  '👍','👎','❤️','😄','😕','🎉','🚀','👀','🙏','💯',
  '😂','😮','😢','😡','💪','✅','❌','🔥','💡','⚡',
] as const;
