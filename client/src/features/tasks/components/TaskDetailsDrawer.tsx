import React, { useState, useEffect } from 'react';
import { useTaskUiStore } from '../../../stores/taskUi.store';
import { useTasks } from '../hooks/useTasks';
import { useMemberships } from '../../memberships/hooks/useMemberships';
import { useWorkspaceStore } from '../../../stores/workspace.store';
import { TaskStatus, TaskPriority } from '../../../types/task';
import { Board } from '../../../types/board';
import { ChecklistWidget } from './ChecklistWidget';
import { SubtasksWidget } from './SubtasksWidget';
import { DependenciesWidget } from './DependenciesWidget';
import { TimeTrackingWidget } from './TimeTrackingWidget';
import { WatchersWidget } from './WatchersWidget';
import { TaskHistoryPanel } from './TaskHistoryPanel';
import { AttachmentList } from '../../files/components/AttachmentList';
import { CommentsPanel } from '../../comments/components/CommentsPanel';
import { TaskAiAssistant } from './TaskAiAssistant';
import { X, User as UserIcon, Tag, Archive, Edit3, Save } from 'lucide-react';

interface TaskDetailsDrawerProps {
  boards: Board[];
}

export const TaskDetailsDrawer: React.FC<TaskDetailsDrawerProps> = ({ boards }) => {
  const { currentWorkspace } = useWorkspaceStore();
  const { selectedTask, isDrawerOpen, closeDrawer } = useTaskUiStore();
  const { changeStatus, changePriority, assignTask, moveTask, updateLabels, archiveTask, updateTask } = useTasks();

  const { useWorkspaceMembers } = useMemberships();
  const { data: wsMembersData } = useWorkspaceMembers(currentWorkspace?._id);
  const workspaceMembers = wsMembersData?.data?.members || [];

  const [labelInput, setLabelInput] = useState('');
  const [labels, setLabels] = useState<string[]>([]);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [markdownDesc, setMarkdownDesc] = useState('');

  useEffect(() => {
    if (selectedTask) {
      setLabels(selectedTask.labels || []);
      setMarkdownDesc(selectedTask.description || selectedTask.descriptionPreview || '');
    }
  }, [selectedTask]);

  if (!isDrawerOpen || !selectedTask) return null;

  const handleSaveDescription = async () => {
    try {
      await updateTask({
        taskId: selectedTask._id,
        payload: { description: markdownDesc, descriptionPreview: markdownDesc.slice(0, 300) },
      });
      setIsEditingDesc(false);
    } catch (err: any) {
      alert(err.message || 'Failed to save description');
    }
  };

  const handleStatusChange = async (newStatus: TaskStatus) => {
    try {
      await changeStatus({ taskId: selectedTask._id, status: newStatus });
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handlePriorityChange = async (newPriority: TaskPriority) => {
    try {
      await changePriority({ taskId: selectedTask._id, priority: newPriority });
    } catch (err: any) {
      alert(err.message || 'Failed to update priority');
    }
  };

  const handleAssigneeChange = async (assigneeId: string) => {
    try {
      await assignTask({ taskId: selectedTask._id, assigneeId: assigneeId || null });
    } catch (err: any) {
      alert(err.message || 'Failed to assign user');
    }
  };

  const handleMoveBoard = async (targetBoardId: string) => {
    try {
      await moveTask({ taskId: selectedTask._id, targetBoardId });
    } catch (err: any) {
      alert(err.message || 'Failed to move board');
    }
  };

  const handleAddLabel = async () => {
    if (!labelInput.trim() || labels.length >= 10) return;
    const clean = labelInput.trim().slice(0, 30);
    if (!labels.includes(clean)) {
      const updated = [...labels, clean];
      setLabels(updated);
      await updateLabels({ taskId: selectedTask._id, labels: updated });
    }
    setLabelInput('');
  };

  const handleRemoveLabel = async (lbl: string) => {
    const updated = labels.filter((l) => l !== lbl);
    setLabels(updated);
    await updateLabels({ taskId: selectedTask._id, labels: updated });
  };

  const handleArchive = async () => {
    if (window.confirm(`Are you sure you want to archive task ${selectedTask.taskKey}?`)) {
      try {
        await archiveTask(selectedTask._id);
        closeDrawer();
      } catch (err: any) {
        alert(err.message || 'Failed to archive task');
      }
    }
  };

  const projectId = selectedTask.project._id || (selectedTask.project as any);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeDrawer} />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg bg-[#0e0e12] border-l border-zinc-800 shadow-2xl p-6 flex flex-col justify-between overflow-y-auto space-y-6">
          {/* Header */}
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-bold text-indigo-400">{selectedTask.taskKey}</span>
                <span className="text-xs text-zinc-500 font-mono">ID: {selectedTask._id}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleArchive}
                  className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Archive Task"
                >
                  <Archive className="h-4 w-4" />
                </button>
                <button onClick={closeDrawer} className="p-1 rounded-lg text-zinc-400 hover:text-white transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Watchers Widget */}
            <WatchersWidget taskId={selectedTask._id} />

            {/* Task Title */}
            <h2 className="text-xl font-bold text-white leading-snug">{selectedTask.title}</h2>

            {/* AI Task Assistant Widget */}
            <TaskAiAssistant
              taskId={selectedTask._id}
              workspaceId={currentWorkspace?._id || ''}
              onApplyDescription={(newDesc) => {
                setMarkdownDesc(newDesc);
                handleSaveDescription();
              }}
            />

            {/* Markdown Description Section */}
            <div className="space-y-2 p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-300">Markdown Description</span>
                {isEditingDesc ? (
                  <button
                    onClick={handleSaveDescription}
                    className="text-[11px] text-emerald-400 font-medium hover:underline flex items-center gap-1"
                  >
                    <Save className="h-3 w-3" /> Save
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditingDesc(true)}
                    className="text-[11px] text-indigo-400 font-medium hover:underline flex items-center gap-1"
                  >
                    <Edit3 className="h-3 w-3" /> Edit
                  </button>
                )}
              </div>

              {isEditingDesc ? (
                <textarea
                  rows={4}
                  value={markdownDesc}
                  onChange={(e) => setMarkdownDesc(e.target.value)}
                  placeholder="Enter raw Markdown formatting..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              ) : (
                <div className="text-xs text-zinc-300 whitespace-pre-wrap font-sans leading-relaxed">
                  {markdownDesc || 'No description provided. Click Edit to add Markdown.'}
                </div>
              )}
            </div>

            {/* Properties Grid */}
            <div className="space-y-3 text-xs p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 font-medium">Status</span>
                <select
                  value={selectedTask.status}
                  onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-indigo-400 font-semibold focus:outline-none cursor-pointer"
                >
                  <option value={TaskStatus.BACKLOG}>BACKLOG</option>
                  <option value={TaskStatus.TODO}>TODO</option>
                  <option value={TaskStatus.IN_PROGRESS}>IN_PROGRESS</option>
                  <option value={TaskStatus.IN_REVIEW}>IN_REVIEW</option>
                  <option value={TaskStatus.DONE}>DONE</option>
                  <option value={TaskStatus.CANCELLED}>CANCELLED</option>
                </select>
              </div>

              {/* Priority */}
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 font-medium">Priority</span>
                <select
                  value={selectedTask.priority}
                  onChange={(e) => handlePriorityChange(e.target.value as TaskPriority)}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-purple-400 font-semibold focus:outline-none cursor-pointer"
                >
                  <option value={TaskPriority.LOW}>LOW</option>
                  <option value={TaskPriority.MEDIUM}>MEDIUM</option>
                  <option value={TaskPriority.HIGH}>HIGH</option>
                  <option value={TaskPriority.URGENT}>URGENT</option>
                </select>
              </div>

              {/* Assignee */}
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 font-medium">Assignee</span>
                <select
                  value={selectedTask.assignee?._id || ''}
                  onChange={(e) => handleAssigneeChange(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-white focus:outline-none cursor-pointer"
                >
                  <option value="">Unassigned</option>
                  {workspaceMembers.map((wm) => (
                    <option key={wm.user._id} value={wm.user._id}>
                      {wm.user.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Board Move Selector */}
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 font-medium">Kanban Board</span>
                <select
                  value={selectedTask.board._id || (selectedTask.board as any)}
                  onChange={(e) => handleMoveBoard(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-sky-400 font-medium focus:outline-none cursor-pointer"
                >
                  {boards.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reporter */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-zinc-500 font-medium">Reporter</span>
                <span className="text-zinc-300 font-medium flex items-center gap-1.5">
                  <UserIcon className="h-3.5 w-3.5 text-zinc-500" />
                  {selectedTask.reporter.name}
                </span>
              </div>
            </div>

            {/* Time Tracking Widget */}
            <TimeTrackingWidget
              taskId={selectedTask._id}
              estimateMinutes={selectedTask.estimateMinutes || 0}
              spentMinutes={selectedTask.spentMinutes || 0}
            />

            {/* Checklist Widget */}
            <ChecklistWidget taskId={selectedTask._id} />

            {/* Subtasks Widget (Only for root tasks) */}
            {!selectedTask.parentTask && (
              <SubtasksWidget
                parentTaskId={selectedTask._id}
                projectId={projectId}
                boardId={selectedTask.board._id || (selectedTask.board as any)}
              />
            )}

            {/* Dependencies Widget */}
            <DependenciesWidget taskId={selectedTask._id} projectId={projectId} />

            {/* Attachments Widget */}
            {currentWorkspace?._id && (
              <div className="pt-2 border-t border-zinc-800/80">
                <AttachmentList
                  taskId={selectedTask._id}
                  workspaceId={currentWorkspace._id}
                  projectId={projectId}
                />
              </div>
            )}

            {/* Task Change History Panel */}
            <TaskHistoryPanel taskId={selectedTask._id} />

            {/* Comments */}
            <div className="pt-2 border-t border-zinc-800/80">
              <CommentsPanel taskId={selectedTask._id} />
            </div>

            {/* Labels Section */}
            <div className="pt-2 border-t border-zinc-800/80 space-y-2">
              <label className="text-xs font-medium text-zinc-400">Labels</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={labelInput}
                  onChange={(e) => setLabelInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddLabel())}
                  placeholder="Add label..."
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1 text-xs text-white focus:outline-none"
                />
                <button
                  onClick={handleAddLabel}
                  className="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-white font-medium"
                >
                  Add
                </button>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                {labels.map((lbl) => (
                  <span key={lbl} className="px-2 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-[10px] text-indigo-400 flex items-center gap-1">
                    <Tag className="h-2.5 w-2.5" />
                    <span>{lbl}</span>
                    <button onClick={() => handleRemoveLabel(lbl)} className="hover:text-rose-400 ml-1">×</button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="pt-4 border-t border-zinc-800/80 text-[11px] text-zinc-500 flex items-center justify-between">
            <span>Created {new Date(selectedTask.createdAt).toLocaleDateString()}</span>
            <button onClick={closeDrawer} className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-medium">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
