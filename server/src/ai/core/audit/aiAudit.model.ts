import mongoose, { Schema, Document } from 'mongoose';

export interface IAIAuditLog extends Document {
  userId: string;
  workspaceId: string;
  planner: string;
  provider: string;
  promptVersion: string;
  toolChain: string[];
  retrievers: string[];
  latencyMs: number;
  tokenUsage: {
    prompt: number;
    completion: number;
    total: number;
  };
  estimatedCost: number;
  fallbackOccurred: boolean;
  citationsCount: number;
  requestId?: string;
  createdAt: Date;
}

const AIAuditLogSchema = new Schema<IAIAuditLog>(
  {
    userId: { type: String, required: true, index: true },
    workspaceId: { type: String, required: true, index: true },
    planner: { type: String, required: true },
    provider: { type: String, required: true },
    promptVersion: { type: String, default: '1.0.0' },
    toolChain: { type: [String], default: [] },
    retrievers: { type: [String], default: [] },
    latencyMs: { type: Number, required: true },
    tokenUsage: {
      prompt: { type: Number, default: 0 },
      completion: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    estimatedCost: { type: Number, default: 0 },
    fallbackOccurred: { type: Boolean, default: false },
    citationsCount: { type: Number, default: 0 },
    requestId: { type: String, index: true },
  },
  { timestamps: true }
);

AIAuditLogSchema.index({ workspaceId: 1, createdAt: -1 });

export const AIAuditLogModel = mongoose.model<IAIAuditLog>('AIAuditLog', AIAuditLogSchema);
