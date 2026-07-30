import React, { useState } from 'react';
import {
  FileText,
  Image,
  Film,
  File,
  Trash2,
  Download,
  Edit2,
  Check,
  X,
  RefreshCw,
} from 'lucide-react';
import { FileItem } from '../../../types/file';
import { useFiles } from '../hooks/useFiles';

interface FileCardProps {
  file: FileItem;
  taskId?: string;
  projectId?: string;
  workspaceId?: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return <Image size={18} className="text-blue-400" />;
  if (mimeType.startsWith('video/')) return <Film size={18} className="text-purple-400" />;
  if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text'))
    return <FileText size={18} className="text-rose-400" />;
  return <File size={18} className="text-zinc-400" />;
}

export const FileCard: React.FC<FileCardProps> = ({
  file,
  taskId,
  projectId,
  workspaceId,
}) => {
  const { renameFileMutation, deleteFileMutation, restoreFileMutation } = useFiles();
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(file.displayName);

  const handleRenameSubmit = async () => {
    if (!renameValue.trim() || renameValue.trim() === file.displayName) {
      setIsRenaming(false);
      setRenameValue(file.displayName);
      return;
    }
    try {
      await renameFileMutation.mutateAsync({
        fileId: file._id,
        displayName: renameValue.trim(),
        taskId,
        projectId,
        workspaceId,
      });
      setIsRenaming(false);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Rename failed');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${file.displayName}"?`)) return;
    try {
      await deleteFileMutation.mutateAsync({ fileId: file._id, taskId, projectId, workspaceId });
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Delete failed');
    }
  };

  const handleRestore = async () => {
    try {
      await restoreFileMutation.mutateAsync({ fileId: file._id, taskId, projectId, workspaceId });
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Restore failed');
    }
  };

  return (
    <div
      className={`group flex items-center gap-2.5 p-2.5 rounded-lg border transition-all
        ${file.isDeleted
          ? 'bg-zinc-950/30 border-zinc-800/50 opacity-60'
          : 'bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700'
        }
      `}
    >
      {/* Preview or Icon */}
      <div className="h-10 w-10 rounded-md overflow-hidden bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
        {file.thumbnailUrl ? (
          <img
            src={file.thumbnailUrl}
            alt={file.displayName}
            className="h-full w-full object-cover"
          />
        ) : (
          getFileIcon(file.mimeType)
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        {isRenaming ? (
          <div className="flex items-center gap-1">
            <input
              className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-2 py-0.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRenameSubmit();
                if (e.key === 'Escape') {
                  setIsRenaming(false);
                  setRenameValue(file.displayName);
                }
              }}
              autoFocus
              aria-label="Rename file"
            />
            <button
              onClick={handleRenameSubmit}
              disabled={renameFileMutation.isPending}
              className="p-1 rounded text-emerald-400 hover:bg-emerald-500/10"
              aria-label="Confirm rename"
            >
              <Check size={11} />
            </button>
            <button
              onClick={() => { setIsRenaming(false); setRenameValue(file.displayName); }}
              className="p-1 rounded text-zinc-400 hover:bg-zinc-700"
              aria-label="Cancel rename"
            >
              <X size={11} />
            </button>
          </div>
        ) : (
          <p className="text-xs font-medium text-zinc-200 truncate" title={file.displayName}>
            {file.displayName}
          </p>
        )}
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] font-mono text-zinc-600 uppercase">{file.extension}</span>
          <span className="text-[10px] text-zinc-600">{formatBytes(file.size)}</span>
          {file.uploadedBy && (
            <span className="text-[10px] text-zinc-600 truncate">by {file.uploadedBy.name}</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        {!file.isDeleted ? (
          <>
            <a
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              download={file.displayName}
              className="p-1.5 rounded text-zinc-500 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
              aria-label="Download file"
            >
              <Download size={13} />
            </a>
            <button
              onClick={() => setIsRenaming(true)}
              className="p-1.5 rounded text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
              aria-label="Rename file"
            >
              <Edit2 size={13} />
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteFileMutation.isPending}
              className="p-1.5 rounded text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              aria-label="Delete file"
            >
              <Trash2 size={13} />
            </button>
          </>
        ) : (
          <button
            onClick={handleRestore}
            disabled={restoreFileMutation.isPending}
            className="p-1.5 rounded text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
            aria-label="Restore file"
          >
            <RefreshCw size={13} />
          </button>
        )}
      </div>
    </div>
  );
};
