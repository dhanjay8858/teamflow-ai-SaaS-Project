import { getProject, searchProjects } from '../tools/project.tools.js';

export class ProjectRetriever {
  public async retrieve(projectId?: string, workspaceId?: string): Promise<string> {
    if (projectId) {
      const proj = await getProject(projectId);
      if (!proj) return 'Project not found';
      return `Project [${proj.name}] (${proj.slug}): Status=${proj.status}, Desc="${proj.description || ''}"`;
    }
    if (workspaceId) {
      const projects = await searchProjects(workspaceId, undefined, 5);
      return `Projects summary (${projects.length}): ` + projects.map((p: { name: string; slug: string }) => `${p.name} (${p.slug})`).join('; ');
    }
    return 'No project context available';
  }
}

export const projectRetriever = new ProjectRetriever();
