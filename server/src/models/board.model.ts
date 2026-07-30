import { Schema, model } from 'mongoose';
import { IBoardDocument } from '../types/board.types.js';

const boardSchema = new Schema<IBoardDocument>(
  {
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project reference is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Board name is required'],
      trim: true,
      minlength: [2, 'Board name must be at least 2 characters long'],
      maxlength: [50, 'Board name cannot exceed 50 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Board slug is required'],
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      maxlength: [300, 'Description cannot exceed 300 characters'],
    },
    color: {
      type: String,
      default: '#6366f1',
    },
    position: {
      type: Number,
      required: true,
      default: 1,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index enforcing unique board slug per project
boardSchema.index({ project: 1, slug: 1 }, { unique: true });
boardSchema.index({ project: 1, position: 1 });

export const BoardModel = model<IBoardDocument>('Board', boardSchema);
