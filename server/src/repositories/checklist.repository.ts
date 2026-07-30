import { ChecklistItemModel, IChecklistItemDocument } from '../models/checklist.model.js';
import { Types } from 'mongoose';

export class ChecklistRepository {
  public async create(data: Partial<IChecklistItemDocument>): Promise<IChecklistItemDocument> {
    return ChecklistItemModel.create(data);
  }

  public async findById(id: string | Types.ObjectId): Promise<IChecklistItemDocument | null> {
    return ChecklistItemModel.findById(id).exec();
  }

  public async findTaskChecklist(taskId: string | Types.ObjectId): Promise<IChecklistItemDocument[]> {
    return ChecklistItemModel.find({ task: taskId }).sort({ position: 1, createdAt: 1 }).exec();
  }

  public async getMaxPosition(taskId: string | Types.ObjectId): Promise<number> {
    const last = await ChecklistItemModel.findOne({ task: taskId }).sort({ position: -1 }).exec();
    return last ? last.position : 0;
  }

  public async update(id: string | Types.ObjectId, data: Partial<IChecklistItemDocument>): Promise<IChecklistItemDocument | null> {
    return ChecklistItemModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  public async delete(id: string | Types.ObjectId): Promise<IChecklistItemDocument | null> {
    return ChecklistItemModel.findByIdAndDelete(id).exec();
  }
}

export const checklistRepository = new ChecklistRepository();
