import { taskRepository } from '../../repositories/task.repository.js';
import { commentRepository } from '../../repositories/comment.repository.js';
import { projectRepository } from '../../repositories/project.repository.js';
import { fileRepository } from '../../repositories/file.repository.js';
import { hybridRetriever } from '../retrievers/hybrid.retriever.js';

export async function createTaskTool(data: Parameters<typeof taskRepository.create>[0]) {
  return taskRepository.create(data);
}

export async function updateTaskTool(taskId: string, data: Parameters<typeof taskRepository.update>[1]) {
  return taskRepository.update(taskId, data);
}

export async function findDuplicateTasksTool(workspaceId: string, title: string, description?: string) {
  const query = `${title} ${description || ''}`;
  const hybrid = await hybridRetriever.search(workspaceId, query, 5);
  return hybrid.results.filter((r) => r.entityType === 'TASK');
}

export async function summarizeDiscussionTool(taskId: string) {
  const comments = await commentRepository.findTaskComments(taskId, 1, 50);
  if (comments.length === 0) return 'No comments or discussions found on this task.';
  return comments
    .map((c) => {
      const authorObj = c.author as unknown as { name?: string };
      return `${authorObj?.name || 'User'}: ${c.markdown}`;
    })
    .join('\n');
}

export async function getTaskContextTool(taskId: string) {
  const task = await taskRepository.findById(taskId);
  if (!task) return null;

  const [comments, files] = await Promise.all([
    commentRepository.findTaskComments(taskId, 1, 20),
    fileRepository.findByTaskId(taskId),
  ]);

  return {
    task: {
      id: task._id.toString(),
      taskKey: task.taskKey,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      workspaceId: task.workspace.toString(),
      projectId: task.project ? task.project.toString() : undefined,
    },
    commentsCount: comments.length,
    filesCount: files.length,
  };
}
