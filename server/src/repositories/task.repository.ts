import { TaskModel } from '../models/task.model.js';
import { ITaskDocument, TaskStatus, TaskPriority } from '../types/task.types.js';
import { Types } from 'mongoose';

export class TaskRepository {
  public async create(data: Partial<ITaskDocument>): Promise<ITaskDocument> {
    return TaskModel.create(data);
  }

  public async findById(id: string | Types.ObjectId): Promise<ITaskDocument | null> {
    return TaskModel.findById(id)
      .populate('board', 'name slug color')
      .populate('project', 'name slug workspace')
      .populate('assignee', 'name username email avatar')
      .populate('reporter', 'name username email avatar')
      .populate('createdBy', 'name username email avatar')
      .exec();
  }

  public async findByProjectAndTaskNumber(
    projectId: string | Types.ObjectId,
    taskNumber: number
  ): Promise<ITaskDocument | null> {
    return TaskModel.findOne({ project: projectId, taskNumber }).exec();
  }

  public async findBoardTasks(boardId: string | Types.ObjectId, includeArchived = false): Promise<ITaskDocument[]> {
    const filter: Record<string, unknown> = { board: boardId };
    if (!includeArchived) {
      filter.isArchived = false;
    }
    return TaskModel.find(filter)
      .populate('assignee', 'name username email avatar')
      .populate('reporter', 'name username email avatar')
      .sort({ position: 1, createdAt: 1 })
      .exec();
  }

  public async findProjectTasks(
    projectId: string | Types.ObjectId,
    includeArchived = false
  ): Promise<ITaskDocument[]> {
    const filter: Record<string, unknown> = { project: projectId };
    if (!includeArchived) {
      filter.isArchived = false;
    }
    return TaskModel.find(filter)
      .populate('board', 'name slug color')
      .populate('assignee', 'name username email avatar')
      .sort({ updatedAt: -1 })
      .exec();
  }

  public async getMaxPositionInBoard(boardId: string | Types.ObjectId): Promise<number> {
    const lastTask = await TaskModel.findOne({ board: boardId }).sort({ position: -1 }).exec();
    return lastTask ? lastTask.position : 0;
  }

  public async getNextTaskNumberInProject(projectId: string | Types.ObjectId): Promise<number> {
    const lastTask = await TaskModel.findOne({ project: projectId }).sort({ taskNumber: -1 }).exec();
    return lastTask ? lastTask.taskNumber + 1 : 1;
  }

  public async update(id: string | Types.ObjectId, data: Partial<ITaskDocument>): Promise<ITaskDocument | null> {
    return TaskModel.findByIdAndUpdate(id, data, { new: true, runValidators: true })
      .populate('board', 'name slug color')
      .populate('assignee', 'name username email avatar')
      .populate('reporter', 'name username email avatar')
      .exec();
  }

  public async archive(id: string | Types.ObjectId): Promise<ITaskDocument | null> {
    return TaskModel.findByIdAndUpdate(id, { isArchived: true }, { new: true }).exec();
  }

  public async restore(id: string | Types.ObjectId): Promise<ITaskDocument | null> {
    return TaskModel.findByIdAndUpdate(id, { isArchived: false }, { new: true }).exec();
  }

  public async updatePositionAndBoard(
    id: string | Types.ObjectId,
    targetBoardId: string | Types.ObjectId,
    position: number,
    status?: TaskStatus
  ): Promise<ITaskDocument | null> {
    const updateData: Record<string, unknown> = { board: targetBoardId, position };
    if (status) {
      updateData.status = status;
    }
    return TaskModel.findByIdAndUpdate(id, updateData, { new: true })
      .populate('board', 'name slug color')
      .populate('assignee', 'name username email avatar')
      .exec();
  }

  public async searchTasks(
    projectId: string | Types.ObjectId,
    query: string,
    filters?: { status?: TaskStatus; priority?: TaskPriority; assigneeId?: string }
  ): Promise<ITaskDocument[]> {
    const searchFilter: Record<string, unknown> = {
      project: projectId,
      isArchived: false,
    };

    if (filters?.status) searchFilter.status = filters.status;
    if (filters?.priority) searchFilter.priority = filters.priority;
    if (filters?.assigneeId) searchFilter.assignee = filters.assigneeId;

    if (query && query.trim()) {
      const regex = new RegExp(query.trim(), 'i');
      searchFilter.$or = [{ title: regex }, { taskKey: regex }, { labels: regex }];
    }

    return TaskModel.find(searchFilter)
      .populate('board', 'name slug color')
      .populate('assignee', 'name username email avatar')
      .sort({ updatedAt: -1 })
      .limit(50)
      .exec();
  }
}

export const taskRepository = new TaskRepository();
