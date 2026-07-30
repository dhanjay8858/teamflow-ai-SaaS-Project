import { Schema, model, Document, Types } from 'mongoose';

export interface IFile {
  _id: Types.ObjectId;
  workspace: Types.ObjectId;
  project?: Types.ObjectId | null;
  task?: Types.ObjectId | null;
  uploadedBy: Types.ObjectId;
  originalName: string;
  displayName: string;
  mimeType: string;
  extension: string;
  size: number;
  cloudinaryPublicId: string;
  url: string;
  thumbnailUrl?: string | null;
  width?: number | null;
  height?: number | null;
  duration?: number | null;
  version: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFileDocument extends Omit<IFile, '_id'>, Document {
  _id: Types.ObjectId;
}

const fileSchema = new Schema<IFileDocument>(
  {
    workspace: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: [true, 'Workspace is required'],
      index: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
      index: true,
    },
    task: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      default: null,
      index: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    originalName: {
      type: String,
      required: [true, 'Original file name is required'],
      trim: true,
    },
    displayName: {
      type: String,
      required: [true, 'Display name is required'],
      trim: true,
      maxlength: [255, 'Display name cannot exceed 255 characters'],
    },
    mimeType: {
      type: String,
      required: [true, 'MIME type is required'],
      index: true,
    },
    extension: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    size: {
      type: Number,
      required: [true, 'File size is required'],
      min: 0,
    },
    cloudinaryPublicId: {
      type: String,
      required: [true, 'Cloudinary public ID is required'],
    },
    url: {
      type: String,
      required: [true, 'File URL is required'],
    },
    thumbnailUrl: {
      type: String,
      default: null,
    },
    width: {
      type: Number,
      default: null,
    },
    height: {
      type: Number,
      default: null,
    },
    duration: {
      type: Number,
      default: null,
    },
    version: {
      type: Number,
      default: 1,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

fileSchema.index({ workspace: 1, createdAt: -1 });
fileSchema.index({ task: 1, createdAt: -1 });
fileSchema.index({ project: 1, createdAt: -1 });

export const FileModel = model<IFileDocument>('File', fileSchema);
