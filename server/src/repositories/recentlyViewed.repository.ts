import { RecentlyViewedTaskModel, IRecentlyViewedTaskDocument } from '../models/recentlyViewedTask.model.js';
import { Types } from 'mongoose';

export class RecentlyViewedRepository {
  public async recordView(userId: string | Types.ObjectId, taskId: string | Types.ObjectId): Promise<IRecentlyViewedTaskDocument> {
    const entry = await RecentlyViewedTaskModel.findOneAndUpdate(
      { user: userId, task: taskId },
      { lastViewedAt: new Date() },
      { upsert: true, new: true }
    ).exec();

    // Cap to latest 50 tasks per user
    const userEntries = await RecentlyViewedTaskModel.find({ user: userId })
      .sort({ lastViewedAt: -1 })
      .select('_id')
      .exec();

    if (userEntries.length > 50) {
      const idsToDelete = userEntries.slice(50).map((e) => e._id);
      await RecentlyViewedTaskModel.deleteMany({ _id: { $in: idsToDelete } }).exec();
    }

    return entry;
  }

  public async findUserRecents(userId: string | Types.ObjectId, limit = 20): Promise<IRecentlyViewedTaskDocument[]> {
    return RecentlyViewedTaskModel.find({ user: userId })
      .populate({
        path: 'task',
        select: 'taskKey title status priority project board assignee',
        populate: [
          { path: 'project', select: 'name slug' },
          { path: 'board', select: 'name slug color' },
        ],
      })
      .sort({ lastViewedAt: -1 })
      .limit(limit)
      .exec();
  }
}

export const recentlyViewedRepository = new RecentlyViewedRepository();
