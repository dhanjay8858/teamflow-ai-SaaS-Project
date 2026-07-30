import { projectRepository } from '../../repositories/project.repository.js';
import { workspaceRepository } from '../../repositories/workspace.repository.js';
import { IProjectDocument } from '../../types/project.types.js';

export async function searchProjects(workspaceId: string, query?: string, limit = 10) {
  const projects: IProjectDocument[] = await projectRepository.findWorkspaceProjects(workspaceId);
  let filtered = projects;
  if (query) {
    const q = query.toLowerCase();
    filtered = filtered.filter(
      (p) => p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q)
    );
  }
  return filtered.slice(0, limit).map((p) => ({
    id: p._id.toString(),
    name: p.name,
    slug: p.slug,
    status: p.status,
    description: p.description,
  }));
}

export async function getProject(projectId: string) {
  const project = await projectRepository.findById(projectId);
  if (!project) return null;
  return {
    id: project._id.toString(),
    name: project.name,
    slug: project.slug,
    description: project.description,
    status: project.status,
    visibility: project.visibility,
    createdAt: project.createdAt,
  };
}

export async function getWorkspace(workspaceId: string) {
  const workspace = await workspaceRepository.findById(workspaceId);
  if (!workspace) return null;
  return {
    id: workspace._id.toString(),
    name: workspace.name,
    slug: workspace.slug,
    description: workspace.description,
    createdAt: workspace.createdAt,
  };
}
