import { ActivityModel } from '../models/activity.model.js';
import { IActivityDocument, ActivityFilterQuery } from '../types/activity.types.js';
import { Types } from 'mongoose';

export class ActivityRepository {
  public async create(data: Partial<IActivityDocument>): Promise<IActivityDocument> {
    return ActivityModel.create(data);
  }

  public async findTimeline(query: ActivityFilterQuery): Promise<IActivityDocument[]> {
    const filter: Record<string, unknown> = {};

    if (query.workspaceId) filter.workspace = query.workspaceId;
    if (query.organizationId) filter.organization = query.organizationId;
    if (query.userId) filter.user = query.userId;
    if (query.eventType) filter.eventType = query.eventType;
    if (query.entityType) filter.entityType = query.entityType;

    if (query.startDate || query.endDate) {
      filter.createdAt = {};
      if (query.startDate) (filter.createdAt as Record<string, Date>).$gte = query.startDate;
      if (query.endDate) (filter.createdAt as Record<string, Date>).$lte = query.endDate;
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    return ActivityModel.find(filter)
      .populate('user', 'name username email avatar')
      .populate('workspace', 'name slug icon')
      .populate('organization', 'name slug logo')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  public async countTimeline(query: ActivityFilterQuery): Promise<number> {
    const filter: Record<string, unknown> = {};

    if (query.workspaceId) filter.workspace = query.workspaceId;
    if (query.organizationId) filter.organization = query.organizationId;
    if (query.userId) filter.user = query.userId;
    if (query.eventType) filter.eventType = query.eventType;
    if (query.entityType) filter.entityType = query.entityType;

    if (query.startDate || query.endDate) {
      filter.createdAt = {};
      if (query.startDate) (filter.createdAt as Record<string, Date>).$gte = query.startDate;
      if (query.endDate) (filter.createdAt as Record<string, Date>).$lte = query.endDate;
    }

    return ActivityModel.countDocuments(filter).exec();
  }
}

export const activityRepository = new ActivityRepository();
