import { searchActivities } from '../tools/activity.tools.js';

export class ActivityRetriever {
  public async retrieve(workspaceId: string): Promise<string> {
    const activities = await searchActivities(workspaceId, 5);
    if (activities.length === 0) return 'No recent activities';
    return `Recent Activities (${activities.length}): ` + activities.map((a: { title: string; description?: string }) => `${a.title}: ${a.description || ''}`).join(' | ');
  }
}

export const activityRetriever = new ActivityRetriever();
