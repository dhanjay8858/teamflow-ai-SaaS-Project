import React, { useState } from 'react';
import { Paperclip, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { useFiles } from '../hooks/useFiles';
import { FileCard } from './FileCard';
import { FileUploadZone } from './FileUploadZone';
import { UploadFileParams } from '../../../types/file';

interface AttachmentListProps {
  taskId: string;
  workspaceId: string;
  projectId?: string;
}

export const AttachmentList: React.FC<AttachmentListProps> = ({
  taskId,
  workspaceId,
  projectId,
}) => {
  const { useTaskFiles } = useFiles();
  const { data, isLoading } = useTaskFiles(taskId);
  const [expanded, setExpanded] = useState(true);

  const files = data?.data?.files || [];
  const activeFiles = files.filter((f) => !f.isDeleted);

  const uploadParams: UploadFileParams = { workspaceId, projectId, taskId };

  return (
    <div className="space-y-2">
      {/* Header */}
      <button
        className="flex items-center justify-between w-full text-left"
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-2">
          <Paperclip className="h-4 w-4 text-zinc-400" />
          <span className="text-xs font-bold text-white">Attachments</span>
          {activeFiles.length > 0 && (
            <span className="inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-zinc-800 text-[10px] font-mono text-zinc-400">
              {activeFiles.length}
            </span>
          )}
        </div>
        {expanded
          ? <ChevronUp className="h-3.5 w-3.5 text-zinc-500" />
          : <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
        }
      </button>

      {expanded && (
        <div className="space-y-3">
          {/* Upload Zone */}
          <FileUploadZone params={uploadParams} />

          {/* Files */}
          {isLoading ? (
            <div className="flex items-center gap-2 text-xs text-zinc-500 py-2">
              <Loader2 size={14} className="animate-spin" />
              <span>Loading attachments…</span>
            </div>
          ) : activeFiles.length === 0 ? (
            <p className="text-xs text-zinc-600 italic">No files attached yet.</p>
          ) : (
            <div className="space-y-1.5">
              {activeFiles.map((file) => (
                <FileCard
                  key={file._id}
                  file={file}
                  taskId={taskId}
                  projectId={projectId}
                  workspaceId={workspaceId}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
