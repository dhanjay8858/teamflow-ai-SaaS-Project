import mongoose, { Schema, Document } from 'mongoose';

export interface IAgentMemory extends Document {
  agentId: string;
  workspaceId: string;
  projectId?: string;
  goal: string;
  plan: string;
  output: string;
  reflectionSummary?: string;
  confidenceScore?: number;
  createdAt: Date;
}

const AgentMemorySchema = new Schema<IAgentMemory>(
  {
    agentId: { type: String, required: true, index: true },
    workspaceId: { type: String, required: true, index: true },
    projectId: { type: String, index: true },
    goal: { type: String, required: true },
    plan: { type: String, required: true },
    output: { type: String, required: true },
    reflectionSummary: { type: String },
    confidenceScore: { type: Number, default: 0.9 },
  },
  { timestamps: true }
);

AgentMemorySchema.index({ workspaceId: 1, agentId: 1, createdAt: -1 });

export const AgentMemoryModel = mongoose.model<IAgentMemory>('AgentMemory', AgentMemorySchema);
