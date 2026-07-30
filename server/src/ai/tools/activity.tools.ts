import { activityRepository } from '../../repositories/activity.repository.js';
import { IActivityDocument } from '../../types/activity.types.js';

export async function searchActivities(workspaceId: string, limit = 10) {
  const activities: IActivityDocument[] = await activityRepository.findTimeline({
    workspaceId,
    limit,
  });
  return activities.map((a) => ({
    id: a._id.toString(),
    eventType: a.eventType,
    title: a.title,
    description: a.description,
    createdAt: a.createdAt,
  }));
}
