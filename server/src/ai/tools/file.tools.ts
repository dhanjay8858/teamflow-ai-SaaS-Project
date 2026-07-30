import { fileRepository } from '../../repositories/file.repository.js';
import { IFileDocument } from '../../models/file.model.js';

export async function searchFiles(workspaceId: string, query?: string, limit = 10) {
  const files: IFileDocument[] = await fileRepository.findByWorkspaceId(workspaceId, limit);
  let filtered = files;
  if (query) {
    const q = query.toLowerCase();
    filtered = filtered.filter(
      (f) => f.displayName.toLowerCase().includes(q) || f.originalName.toLowerCase().includes(q)
    );
  }
  return filtered.map((f) => ({
    id: f._id.toString(),
    displayName: f.displayName,
    originalName: f.originalName,
    mimeType: f.mimeType,
    size: f.size,
    url: f.url,
    createdAt: f.createdAt,
  }));
}
