import { TaskHistoryModel, ITaskHistoryDocument } from '../models/taskHistory.model.js';
import { Types } from 'mongoose';

export class TaskHistoryRepository {
  public async create(data: Partial<ITaskHistoryDocument>): Promise<ITaskHistoryDocument> {
    return TaskHistoryModel.create(data);
  }

  public async findTaskHistory(taskId: string | Types.ObjectId, limit = 50): Promise<ITaskHistoryDocument[]> {
    return TaskHistoryModel.find({ task: taskId })
      .populate('user', 'name username email avatar')
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }
}

export const taskHistoryRepository = new TaskHistoryRepository();
