export interface FileUploader {
  _id: string;
  name: string;
  username: string;
  avatar?: string | null;
}

export interface FileItem {
  _id: string;
  workspace: string;
  project: string | null;
  task: string | null;
  uploadedBy: FileUploader;
  originalName: string;
  displayName: string;
  mimeType: string;
  extension: string;
  size: number;
  cloudinaryPublicId: string;
  url: string;
  thumbnailUrl: string | null;
  width: number | null;
  height: number | null;
  duration: number | null;
  version: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export type FileContextTarget = 'workspace' | 'project' | 'task';

export interface UploadFileParams {
  workspaceId: string;
  projectId?: string;
  taskId?: string;
}
