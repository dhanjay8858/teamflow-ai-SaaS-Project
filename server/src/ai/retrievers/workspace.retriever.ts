import { getWorkspace } from '../tools/project.tools.js';

export class WorkspaceRetriever {
  public async retrieve(workspaceId: string): Promise<string> {
    const ws = await getWorkspace(workspaceId);
    if (!ws) return 'Workspace not found';
    return `Workspace: [${ws.name}] (Slug: ${ws.slug}) - ${ws.description || 'No description'}`;
  }
}

export const workspaceRetriever = new WorkspaceRetriever();
