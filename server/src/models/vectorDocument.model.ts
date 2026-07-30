import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IVectorDocument extends Document {
  chunkId: string;
  workspace: Types.ObjectId | string;
  project?: Types.ObjectId | string | null;
  task?: Types.ObjectId | string | null;
  entityType: 'TASK' | 'PROJECT' | 'COMMENT' | 'FILE' | 'ACTIVITY' | 'WORKSPACE' | 'NOTIFICATION';
  entityId: string;
  chunkIndex: number;
  chunkText: string;
  embedding: number[];
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const VectorDocumentSchema = new Schema<IVectorDocument>(
  {
    chunkId: { type: String, required: true, unique: true, index: true },
    workspace: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    project: { type: Schema.Types.ObjectId, ref: 'Project', default: null, index: true },
    task: { type: Schema.Types.ObjectId, ref: 'Task', default: null, index: true },
    entityType: {
      type: String,
      enum: ['TASK', 'PROJECT', 'COMMENT', 'FILE', 'ACTIVITY', 'WORKSPACE', 'NOTIFICATION'],
      required: true,
      index: true,
    },
    entityId: { type: String, required: true, index: true },
    chunkIndex: { type: Number, required: true, default: 0 },
    chunkText: { type: String, required: true },
    embedding: { type: [Number], required: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

VectorDocumentSchema.index({ workspace: 1, entityType: 1 });
VectorDocumentSchema.index({ workspace: 1, entityId: 1 });

export const VectorDocumentModel = mongoose.model<IVectorDocument>(
  'VectorDocument',
  VectorDocumentSchema
);
