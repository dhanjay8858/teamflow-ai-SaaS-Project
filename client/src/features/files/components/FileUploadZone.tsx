import React, { useCallback, useRef, useState } from 'react';
import { Upload, X, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useFiles } from '../hooks/useFiles';
import { UploadFileParams } from '../../../types/file';

interface UploadStatus {
  fileName: string;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

interface FileUploadZoneProps {
  params: UploadFileParams;
  onSuccess?: () => void;
  maxFileSizeMB?: number;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  params,
  onSuccess,
  maxFileSizeMB = 50,
}) => {
  const { uploadFileMutation } = useFiles();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploads, setUploads] = useState<UploadStatus[]>([]);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const fileArray = Array.from(files);

      for (const file of fileArray) {
        if (file.size > maxFileSizeMB * 1024 * 1024) {
          setUploads((prev) => [
            ...prev,
            { fileName: file.name, status: 'error', error: `File exceeds ${maxFileSizeMB}MB limit` },
          ]);
          continue;
        }

        setUploads((prev) => [...prev, { fileName: file.name, status: 'uploading' }]);

        try {
          await uploadFileMutation.mutateAsync({ file, params });
          setUploads((prev) =>
            prev.map((u) => (u.fileName === file.name && u.status === 'uploading' ? { ...u, status: 'success' } : u))
          );
          onSuccess?.();
        } catch (err: any) {
          const errorMsg = err?.response?.data?.message || err?.message || 'Upload failed';
          setUploads((prev) =>
            prev.map((u) => (u.fileName === file.name && u.status === 'uploading' ? { ...u, status: 'error', error: errorMsg } : u))
          );
        }
      }

      // Auto-clear successful uploads after 3s
      setTimeout(() => {
        setUploads((prev) => prev.filter((u) => u.status !== 'success'));
      }, 3000);
    },
    [uploadFileMutation, params, maxFileSizeMB, onSuccess]
  );

  const onDragEnter = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-2">
      {/* Drop Zone */}
      <div
        className={`
          flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed cursor-pointer
          transition-all duration-200 text-center select-none
          ${isDragging
            ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
            : 'border-zinc-700 bg-zinc-950/50 text-zinc-500 hover:border-zinc-500 hover:bg-zinc-900/60 hover:text-zinc-400'
          }
        `}
        onDragEnter={onDragEnter}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
        aria-label="Upload file drop zone"
      >
        <Upload size={20} />
        <div className="text-xs space-y-0.5">
          <p className="font-medium text-zinc-300">Drop files or click to upload</p>
          <p className="text-zinc-600">Images, PDFs, videos, documents — up to {maxFileSizeMB}MB</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => handleFiles(e.target.files)}
          aria-hidden="true"
        />
      </div>

      {/* Upload Status */}
      {uploads.length > 0 && (
        <ul className="space-y-1.5" aria-live="polite">
          {uploads.map((upload, i) => (
            <li
              key={`${upload.fileName}-${i}`}
              className={`
                flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-xs
                ${upload.status === 'success' ? 'bg-emerald-500/10 border-emerald-600/30 text-emerald-300' : ''}
                ${upload.status === 'error' ? 'bg-rose-500/10 border-rose-600/30 text-rose-300' : ''}
                ${upload.status === 'uploading' ? 'bg-zinc-900 border-zinc-800 text-zinc-300' : ''}
              `}
            >
              <div className="flex items-center gap-2 min-w-0">
                {upload.status === 'uploading' && <Loader2 size={13} className="animate-spin text-indigo-400 shrink-0" />}
                {upload.status === 'success' && <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />}
                {upload.status === 'error' && <AlertCircle size={13} className="text-rose-400 shrink-0" />}
                <div className="min-w-0">
                  <p className="truncate font-medium">{upload.fileName}</p>
                  {upload.error && <p className="text-rose-400 text-[10px]">{upload.error}</p>}
                </div>
              </div>
              {upload.status !== 'uploading' && (
                <button
                  onClick={() => setUploads((prev) => prev.filter((_, idx) => idx !== i))}
                  className="p-0.5 rounded hover:bg-white/10 text-zinc-400 hover:text-white shrink-0"
                  aria-label="Dismiss"
                >
                  <X size={11} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
