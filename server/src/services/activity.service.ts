import { Types } from 'mongoose';
import { activityRepository, ActivityRepository } from '../repositories/activity.repository.js';
import { IActivityDocument, DomainEventType, ActivityEntityType, ActivityFilterQuery } from '../types/activity.types.js';

export interface PaginatedActivitiesResponse {
  activities: IActivityDocument[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export class ActivityService {
  constructor(private repo: ActivityRepository = activityRepository) {}

  public async recordActivity(payload: {
    organizationId?: string | Types.ObjectId | null;
    workspaceId?: string | Types.ObjectId | null;
    userId: string | Types.ObjectId;
    eventType: DomainEventType;
    entityType: ActivityEntityType;
    entityId: string;
    title: string;
    description?: string;
    metadata?: Record<string, unknown>;
  }): Promise<IActivityDocument> {
    return this.repo.create({
      organization: payload.organizationId ? (payload.organizationId as any) : null,
      workspace: payload.workspaceId ? (payload.workspaceId as any) : null,
      user: payload.userId as any,
      eventType: payload.eventType,
      entityType: payload.entityType,
      entityId: payload.entityId,
      title: payload.title,
      description: payload.description || '',
      metadata: payload.metadata || {},
    });
  }

  public async getWorkspaceTimeline(
    workspaceId: string,
    filter: Omit<ActivityFilterQuery, 'workspaceId'> = {}
  ): Promise<PaginatedActivitiesResponse> {
    const query: ActivityFilterQuery = { ...filter, workspaceId };
    const page = filter.page || 1;
    const limit = filter.limit || 20;

    const [activities, total] = await Promise.all([
      this.repo.findTimeline(query),
      this.repo.countTimeline(query),
    ]);

    return {
      activities,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  public async getOrganizationTimeline(
    organizationId: string,
    filter: Omit<ActivityFilterQuery, 'organizationId'> = {}
  ): Promise<PaginatedActivitiesResponse> {
    const query: ActivityFilterQuery = { ...filter, organizationId };
    const page = filter.page || 1;
    const limit = filter.limit || 20;

    const [activities, total] = await Promise.all([
      this.repo.findTimeline(query),
      this.repo.countTimeline(query),
    ]);

    return {
      activities,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }
}

export const activityService = new ActivityService();
