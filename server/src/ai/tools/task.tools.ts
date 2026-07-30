import { taskRepository } from '../../repositories/task.repository.js';
import { ITaskDocument } from '../../types/task.types.js';

export async function searchTasks(workspaceId: string, query?: string, limit = 10) {
  // Use findProjectTasks or search by workspace
  const tasks: ITaskDocument[] = await taskRepository.findProjectTasks(workspaceId);
  let filtered = tasks;
  if (query) {
    const q = query.toLowerCase();
    filtered = filtered.filter(
      (t) => t.title.toLowerCase().includes(q) || t.taskKey.toLowerCase().includes(q)
    );
  }
  return filtered.slice(0, limit).map((t) => ({
    id: t._id.toString(),
    taskKey: t.taskKey,
    title: t.title,
    status: t.status,
    priority: t.priority,
    descriptionPreview: t.descriptionPreview,
    dueDate: t.dueDate,
  }));
}

export async function getTask(taskId: string) {
  const task = await taskRepository.findById(taskId);
  if (!task) return null;
  return {
    id: task._id.toString(),
    taskKey: task.taskKey,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    labels: task.labels,
    dueDate: task.dueDate,
    createdAt: task.createdAt,
  };
}
