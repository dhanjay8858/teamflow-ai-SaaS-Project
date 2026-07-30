import { searchFiles } from '../tools/file.tools.js';

export class FileRetriever {
  public async retrieve(workspaceId: string): Promise<string> {
    const files = await searchFiles(workspaceId, undefined, 5);
    if (files.length === 0) return 'No files found in this workspace';
    return `Files (${files.length}): ` + files.map((f: { displayName: string; mimeType: string }) => `${f.displayName} (${f.mimeType})`).join(', ');
  }
}

export const fileRetriever = new FileRetriever();
