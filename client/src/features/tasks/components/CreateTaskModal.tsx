import React, { useState } from 'react';
import { useTasks } from '../hooks/useTasks';
import { useMemberships } from '../../memberships/hooks/useMemberships';
import { useWorkspaceStore } from '../../../stores/workspace.store';
import { useTaskUiStore } from '../../../stores/taskUi.store';
import { TaskStatus, TaskPriority } from '../../../types/task';
import { X, CheckSquare, AlertCircle, RefreshCw, Tag } from 'lucide-react';

interface CreateTaskModalProps {
  boardId: string;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ boardId }) => {
  const { currentWorkspace } = useWorkspaceStore();
  const { isCreateModalOpen, createModalDefaultBoardId, closeCreateModal } = useTaskUiStore();
  const { createTask, isCreating, createError } = useTasks();

  const { useWorkspaceMembers } = useMemberships();
  const { data: wsMembersData } = useWorkspaceMembers(currentWorkspace?._id);
  const workspaceMembers = wsMembersData?.data?.members || [];

  const [title, setTitle] = useState('');
  const [descriptionPreview, setDescriptionPreview] = useState('');
  const [status, setStatus] = useState<TaskStatus>(TaskStatus.TODO);
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [assigneeId, setAssigneeId] = useState('');
  const [labelInput, setLabelInput] = useState('');
  const [labels, setLabels] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState('');
  const [clientError, setClientError] = useState<string | null>(null);

  if (!isCreateModalOpen) return null;

  const activeBoardId = createModalDefaultBoardId || boardId;

  const handleAddLabel = () => {
    if (!labelInput.trim()) return;
    if (labels.length >= 10) {
      setClientError('Maximum 10 labels allowed');
      return;
    }
    const clean = labelInput.trim().slice(0, 30);
    if (!labels.includes(clean)) {
      setLabels([...labels, clean]);
    }
    setLabelInput('');
  };

  const handleRemoveLabel = (lbl: string) => {
    setLabels(labels.filter((l) => l !== lbl));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientError(null);

    if (!title.trim()) {
      setClientError('Task title is required');
      return;
    }

    if (!activeBoardId) {
      setClientError('No target board column selected');
      return;
    }

    try {
      await createTask({
        boardId: activeBoardId,
        title: title.trim(),
        descriptionPreview: descriptionPreview.trim(),
        status,
        priority,
        assigneeId: assigneeId || undefined,
        labels,
        dueDate: dueDate || undefined,
      });
      closeCreateModal();
      setTitle('');
      setDescriptionPreview('');
      setLabels([]);
    } catch {
      // Handled by createError
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0e0e12] border border-zinc-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5 relative">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <CheckSquare className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Create New Task</h3>
              <p className="text-xs text-zinc-400">Add a new task item to your project board</p>
            </div>
          </div>
          <button onClick={closeCreateModal} className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {(clientError || createError) && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>{clientError || createError?.message || 'Failed to create task'}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-medium text-zinc-300">Task Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Implement OAuth2 Refresh Token Strategy"
              className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-medium text-zinc-300">Description / Summary</label>
            <textarea
              rows={3}
              value={descriptionPreview}
              onChange={(e) => setDescriptionPreview(e.target.value)}
              placeholder="Brief summary of requirements or acceptance criteria..."
              className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-medium text-zinc-300">Status Stage</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value={TaskStatus.BACKLOG}>BACKLOG</option>
                <option value={TaskStatus.TODO}>TODO</option>
                <option value={TaskStatus.IN_PROGRESS}>IN_PROGRESS</option>
                <option value={TaskStatus.IN_REVIEW}>IN_REVIEW</option>
                <option value={TaskStatus.DONE}>DONE</option>
                <option value={TaskStatus.CANCELLED}>CANCELLED</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-medium text-zinc-300">Priority Level</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value={TaskPriority.LOW}>LOW</option>
                <option value={TaskPriority.MEDIUM}>MEDIUM</option>
                <option value={TaskPriority.HIGH}>HIGH</option>
                <option value={TaskPriority.URGENT}>URGENT</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-medium text-zinc-300">Assignee</label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="">Unassigned</option>
                {workspaceMembers.map((wm) => (
                  <option key={wm.user._id} value={wm.user._id}>
                    {wm.user.name} ({wm.user.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-medium text-zinc-300">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Labels Input */}
          <div className="space-y-2">
            <label className="font-medium text-zinc-300">Labels (Max 10)</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={labelInput}
                onChange={(e) => setLabelInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddLabel())}
                placeholder="Type label and press Add"
                className="flex-1 bg-zinc-950/80 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddLabel}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium transition-colors"
              >
                Add Label
              </button>
            </div>

            {labels.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {labels.map((lbl) => (
                  <span key={lbl} className="px-2 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-[10px] text-indigo-400 flex items-center gap-1">
                    <Tag className="h-2.5 w-2.5" />
                    <span>{lbl}</span>
                    <button type="button" onClick={() => handleRemoveLabel(lbl)} className="hover:text-rose-400 ml-1">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={closeCreateModal}
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {isCreating ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : null}
              <span>Create Task</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
