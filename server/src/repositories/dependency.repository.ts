import { TaskDependencyModel, ITaskDependencyDocument } from '../models/taskDependency.model.js';
import { Types } from 'mongoose';

export class DependencyRepository {
  public async create(data: Partial<ITaskDependencyDocument>): Promise<ITaskDependencyDocument> {
    return TaskDependencyModel.create(data);
  }

  public async findById(id: string | Types.ObjectId): Promise<ITaskDependencyDocument | null> {
    return TaskDependencyModel.findById(id).exec();
  }

  public async findTaskDependencies(taskId: string | Types.ObjectId): Promise<ITaskDependencyDocument[]> {
    return TaskDependencyModel.find({ task: taskId })
      .populate({
        path: 'dependsOn',
        select: 'taskKey title status priority assignee',
        populate: { path: 'assignee', select: 'name username avatar' },
      })
      .exec();
  }

  public async findPair(taskId: string | Types.ObjectId, dependsOnId: string | Types.ObjectId): Promise<ITaskDependencyDocument | null> {
    return TaskDependencyModel.findOne({ task: taskId, dependsOn: dependsOnId }).exec();
  }

  public async checkCircularDependency(taskId: string, targetDependsOnId: string): Promise<boolean> {
    if (taskId === targetDependsOnId) return true;

    // BFS or recursive check: see if targetDependsOnId transitively depends on taskId
    const visited = new Set<string>();
    const queue: string[] = [targetDependsOnId];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current === taskId) return true;
      if (visited.has(current)) continue;
      visited.add(current);

      const deps = await TaskDependencyModel.find({ task: current }).exec();
      for (const d of deps) {
        queue.push(d.dependsOn.toString());
      }
    }

    return false;
  }

  public async delete(id: string | Types.ObjectId): Promise<ITaskDependencyDocument | null> {
    return TaskDependencyModel.findByIdAndDelete(id).exec();
  }
}

export const dependencyRepository = new DependencyRepository();
