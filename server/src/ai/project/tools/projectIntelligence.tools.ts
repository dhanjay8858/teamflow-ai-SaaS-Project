import { projectRepository } from '../../../repositories/project.repository.js';
import { taskRepository } from '../../../repositories/task.repository.js';
import { activityRepository } from '../../../repositories/activity.repository.js';
import { fileRepository } from '../../../repositories/file.repository.js';
import { hybridRetriever } from '../../retrievers/hybrid.retriever.js';

export async function getProjectContextTool(projectId: string, workspaceId: string) {
  const project = await projectRepository.findById(projectId);
  if (!project) return null;

  const [tasks, activities, files, hybrid] = await Promise.all([
    taskRepository.findProjectTasks(projectId),
    activityRepository.findTimeline({ workspaceId, limit: 20 }),
    fileRepository.findByProjectId(projectId),
    hybridRetriever.search(workspaceId, project.name, 10, projectId),
  ]);

  const taskSummary = tasks.map((t) => {
    const assigneeObj = t.assignee as unknown as { name?: string };
    return `Task #${t.taskKey} [${t.status}] (${t.priority}): "${t.title}" (Assignee: ${assigneeObj?.name || 'Unassigned'})`;
  }).join('\n');

  return {
    project: {
      id: project._id.toString(),
      name: project.name,
      slug: project.slug,
      status: project.status,
      description: project.description,
    },
    tasksCount: tasks.length,
    taskSummary,
    activitiesCount: activities.length,
    filesCount: files.length,
    hybridContextBlock: hybrid.contextBlock,
  };
}
