import { BoardModel } from '../models/board.model.js';
import { IBoardDocument } from '../types/board.types.js';
import { Types } from 'mongoose';

export class BoardRepository {
  public async create(data: Partial<IBoardDocument>): Promise<IBoardDocument> {
    return BoardModel.create(data);
  }

  public async findById(id: string | Types.ObjectId): Promise<IBoardDocument | null> {
    return BoardModel.findById(id)
      .populate('project', 'name slug workspace')
      .populate('createdBy', 'name username email avatar')
      .exec();
  }

  public async findByProjectAndSlug(projectId: string | Types.ObjectId, slug: string): Promise<IBoardDocument | null> {
    return BoardModel.findOne({ project: projectId, slug: slug.toLowerCase() }).exec();
  }

  public async findProjectBoards(projectId: string | Types.ObjectId, includeArchived = false): Promise<IBoardDocument[]> {
    const filter: Record<string, unknown> = { project: projectId };
    if (!includeArchived) {
      filter.isArchived = false;
    }
    return BoardModel.find(filter)
      .populate('createdBy', 'name username email avatar')
      .sort({ position: 1, createdAt: 1 })
      .exec();
  }

  public async getMaxPosition(projectId: string | Types.ObjectId): Promise<number> {
    const lastBoard = await BoardModel.findOne({ project: projectId }).sort({ position: -1 }).exec();
    return lastBoard ? lastBoard.position : 0;
  }

  public async update(id: string | Types.ObjectId, data: Partial<IBoardDocument>): Promise<IBoardDocument | null> {
    return BoardModel.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec();
  }

  public async archive(id: string | Types.ObjectId): Promise<IBoardDocument | null> {
    return BoardModel.findByIdAndUpdate(id, { isArchived: true }, { new: true }).exec();
  }

  public async restore(id: string | Types.ObjectId): Promise<IBoardDocument | null> {
    return BoardModel.findByIdAndUpdate(id, { isArchived: false }, { new: true }).exec();
  }

  public async updatePosition(id: string | Types.ObjectId, position: number): Promise<IBoardDocument | null> {
    return BoardModel.findByIdAndUpdate(id, { position }, { new: true }).exec();
  }
}

export const boardRepository = new BoardRepository();
