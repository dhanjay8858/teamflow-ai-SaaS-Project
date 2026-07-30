import { Document, Types } from 'mongoose';

export interface IBoard {
  _id: Types.ObjectId;
  project: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  position: number;
  isDefault: boolean;
  isArchived: boolean;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBoardDocument extends Omit<IBoard, '_id'>, Document {
  _id: Types.ObjectId;
}

export interface ReorderBoardItem {
  boardId: string;
  position: number;
}
