import { Schema, model, Document, Types } from 'mongoose';

export interface IChecklistItem {
  _id: Types.ObjectId;
  task: Types.ObjectId;
  text: string;
  completed: boolean;
  position: number;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IChecklistItemDocument extends Omit<IChecklistItem, '_id'>, Document {
  _id: Types.ObjectId;
}

const checklistItemSchema = new Schema<IChecklistItemDocument>(
  {
    task: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      required: [true, 'Task reference is required'],
      index: true,
    },
    text: {
      type: String,
      required: [true, 'Checklist item text is required'],
      trim: true,
      minlength: [1, 'Text cannot be empty'],
      maxlength: [300, 'Text cannot exceed 300 characters'],
    },
    completed: {
      type: Boolean,
      default: false,
    },
    position: {
      type: Number,
      required: true,
      default: 1,
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

checklistItemSchema.index({ task: 1, position: 1 });

export const ChecklistItemModel = model<IChecklistItemDocument>('ChecklistItem', checklistItemSchema);
