import { TaskWatcherModel, ITaskWatcherDocument } from '../models/taskWatcher.model.js';
import { Types } from 'mongoose';

export class TaskWatcherRepository {
  public async watch(taskId: string | Types.ObjectId, userId: string | Types.ObjectId): Promise<ITaskWatcherDocument> {
    return TaskWatcherModel.findOneAndUpdate(
      { task: taskId, user: userId },
      { task: taskId, user: userId },
      { upsert: true, new: true }
    ).exec();
  }

  public async unwatch(taskId: string | Types.ObjectId, userId: string | Types.ObjectId): Promise<void> {
    await TaskWatcherModel.findOneAndDelete({ task: taskId, user: userId }).exec();
  }

  public async isWatching(taskId: string | Types.ObjectId, userId: string | Types.ObjectId): Promise<boolean> {
    const found = await TaskWatcherModel.findOne({ task: taskId, user: userId }).exec();
    return !!found;
  }

  public async findTaskWatchers(taskId: string | Types.ObjectId): Promise<ITaskWatcherDocument[]> {
    return TaskWatcherModel.find({ task: taskId })
      .populate('user', 'name username email avatar')
      .sort({ createdAt: 1 })
      .exec();
  }
}

export const taskWatcherRepository = new TaskWatcherRepository();
