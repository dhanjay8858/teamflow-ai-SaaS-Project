import { getTask, searchTasks } from '../tools/task.tools.js';

export class TaskRetriever {
  public async retrieve(taskId?: string, workspaceId?: string): Promise<string> {
    if (taskId) {
      const task = await getTask(taskId);
      if (!task) return 'Task not found';
      return `Task [${task.taskKey}] "${task.title}": Status=${task.status}, Priority=${task.priority}, Desc="${task.description || ''}"`;
    }
    if (workspaceId) {
      const tasks = await searchTasks(workspaceId, undefined, 5);
      return `Tasks summary (${tasks.length}): ` + tasks.map((t: { taskKey: string; title: string; status: string }) => `[${t.taskKey}] ${t.title} (${t.status})`).join('; ');
    }
    return 'No task context available';
  }
}

export const taskRetriever = new TaskRetriever();
