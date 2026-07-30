import { Types } from 'mongoose';
import { taskRepository, TaskRepository } from '../repositories/task.repository.js';
import { boardRepository, BoardRepository } from '../repositories/board.repository.js';
import { projectRepository, ProjectRepository } from '../repositories/project.repository.js';
import { projectMemberRepository, ProjectMemberRepository } from '../repositories/projectMember.repository.js';
import { membershipRepository, MembershipRepository } from '../repositories/membership.repository.js';
import { userRepository, UserRepository } from '../repositories/user.repository.js';
import { checklistRepository, ChecklistRepository } from '../repositories/checklist.repository.js';
import { dependencyRepository, DependencyRepository } from '../repositories/dependency.repository.js';
import { taskWatcherRepository, TaskWatcherRepository } from '../repositories/taskWatcher.repository.js';
import { taskHistoryRepository, TaskHistoryRepository } from '../repositories/taskHistory.repository.js';
import { recentlyViewedRepository, RecentlyViewedRepository } from '../repositories/recentlyViewed.repository.js';
import { ITaskDocument, TaskStatus, TaskPriority, CreateTaskInput, UpdateTaskInput } from '../types/task.types.js';
import { IChecklistItemDocument } from '../models/checklist.model.js';
import { ITaskDependencyDocument } from '../models/taskDependency.model.js';
import { ITaskWatcherDocument } from '../models/taskWatcher.model.js';
import { ITaskHistoryDocument } from '../models/taskHistory.model.js';
import { IRecentlyViewedTaskDocument } from '../models/recentlyViewedTask.model.js';
import { AppError } from '../utils/appError.js';
import { domainEventBus } from '../events/domainEventBus.js';
import { DomainEventType } from '../types/activity.types.js';
import { tasksCounter } from '../utils/metrics.js';

export class TaskService {
  constructor(
    private taskRepo: TaskRepository = taskRepository,
    private boardRepo: BoardRepository = boardRepository,
    private projectRepo: ProjectRepository = projectRepository,
    private projMemberRepo: ProjectMemberRepository = projectMemberRepository,
    private wsMemberRepo: MembershipRepository = membershipRepository,
    private userRepo: UserRepository = userRepository,
    private checklistRepo: ChecklistRepository = checklistRepository,
    private depRepo: DependencyRepository = dependencyRepository,
    private watcherRepo: TaskWatcherRepository = taskWatcherRepository,
    private historyRepo: TaskHistoryRepository = taskHistoryRepository,
    private recentsRepo: RecentlyViewedRepository = recentlyViewedRepository
  ) {}

  private getProjectPrefix(slug: string): string {
    const clean = slug.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    return clean.slice(0, 5) || 'TASK';
  }

  public async parseMentions(content?: string): Promise<string[]> {
    if (!content) return [];
    const matches = content.match(/@([a-zA-Z0-9_-]+)/g);
    if (!matches) return [];

    const usernames = Array.from(new Set(matches.map((m) => m.slice(1))));
    return usernames;
  }

  public async createTask(userId: string, input: CreateTaskInput): Promise<ITaskDocument> {
    const board = await this.boardRepo.findById(input.boardId);
    if (!board || board.isArchived) {
      throw AppError.notFound('Target board not found');
    }

    const projectId = board.project._id ? board.project._id.toString() : board.project.toString();
    const project = await this.projectRepo.findById(projectId);
    if (!project || project.isArchived) {
      throw AppError.notFound('Project not found');
    }

    const workspaceId = project.workspace._id ? project.workspace._id.toString() : project.workspace.toString();

    // Verification: Requester must be at least a workspace member
    const wsMembership = await this.wsMemberRepo.findByUserAndWorkspace(userId, workspaceId);
    if (!wsMembership) throw AppError.forbidden('You are not a member of this workspace');

    // Subtask depth rule
    let parentTaskObjectId: Types.ObjectId | null = null;
    if (input.parentTaskId) {
      const parentTask = await this.taskRepo.findById(input.parentTaskId);
      if (!parentTask) throw AppError.notFound('Parent task not found');
      if (parentTask.parentTask) {
        throw AppError.badRequest('Subtasks cannot have subtasks (maximum 1 level nesting allowed)');
      }
      parentTaskObjectId = parentTask._id;
    }

    // Assignee Validation
    let assigneeObjectId: Types.ObjectId | null = null;
    if (input.assigneeId) {
      const projMember = await this.projMemberRepo.findByProjectAndUser(projectId, input.assigneeId);
      if (!projMember) {
        throw AppError.forbidden('Assignee must be a member of the project');
      }
      assigneeObjectId = new Types.ObjectId(input.assigneeId);
    }

    const taskNumber = await this.taskRepo.getNextTaskNumberInProject(projectId);
    const prefix = this.getProjectPrefix(project.slug);
    const taskKey = `${prefix}-${taskNumber}`;

    const maxPosition = await this.taskRepo.getMaxPositionInBoard(board._id);
    const userObjectId = new Types.ObjectId(userId);

    const task = await this.taskRepo.create({
      taskKey,
      taskNumber,
      board: board._id,
      project: project._id,
      workspace: new Types.ObjectId(workspaceId),
      title: input.title,
      descriptionPreview: input.descriptionPreview || '',
      description: input.description || input.descriptionPreview || '',
      status: input.status || TaskStatus.TODO,
      priority: input.priority || TaskPriority.MEDIUM,
      position: maxPosition + 1,
      assignee: assigneeObjectId,
      reporter: userObjectId,
      labels: input.labels || [],
      startDate: input.startDate ? new Date(input.startDate) : null,
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
      estimateMinutes: input.estimateMinutes || 0,
      parentTask: parentTaskObjectId,
      createdBy: userObjectId,
    });

    // Auto-watch: Reporter automatically watches task
    await this.watcherRepo.watch(task._id, userId);

    // Auto-watch: Assignee automatically watches task
    if (assigneeObjectId) {
      await this.watcherRepo.watch(task._id, assigneeObjectId.toString());
    }

    // Record initial Task History
    await this.historyRepo.create({
      task: task._id,
      user: userObjectId,
      eventType: 'TASK_CREATED',
      newValue: task.title,
    });

    // Parse Mentions
    const mentions = await this.parseMentions(task.description);
    if (mentions.length > 0) {
      domainEventBus.publish(DomainEventType.MENTIONS_PARSED, {
        taskId: task._id.toString(),
        mentionedUsernames: mentions,
        parsedByUserId: userId,
      });
    }

    if (parentTaskObjectId) {
      await this.taskRepo.update(parentTaskObjectId, { $inc: { subtaskCount: 1 } } as any);
      domainEventBus.publish(DomainEventType.SUBTASK_CREATED, {
        subtaskId: task._id.toString(),
        parentTaskId: parentTaskObjectId.toString(),
        createdByUserId: userId,
      });
    }

    tasksCounter.inc();

    domainEventBus.publish(DomainEventType.TASK_CREATED, {
      taskId: task._id.toString(),
      taskKey: task.taskKey,
      projectId,
      workspaceId,
      title: task.title,
      createdByUserId: userId,
    });

    return (await this.taskRepo.findById(task._id))!;
  }

  public async getBoardTasks(userId: string, boardId: string, includeArchived = false): Promise<ITaskDocument[]> {
    const board = await this.boardRepo.findById(boardId);
    if (!board) throw AppError.notFound('Board not found');

    const projectId = board.project._id ? board.project._id.toString() : board.project.toString();
    const project = await this.projectRepo.findById(projectId);
    if (!project) throw AppError.notFound('Project not found');

    const wsMembership = await this.wsMemberRepo.findByUserAndWorkspace(userId, project.workspace._id.toString());
    if (!wsMembership) throw AppError.forbidden('Access denied');

    return this.taskRepo.findBoardTasks(boardId, includeArchived);
  }

  public async getProjectTasks(userId: string, projectId: string, includeArchived = false): Promise<ITaskDocument[]> {
    const project = await this.projectRepo.findById(projectId);
    if (!project) throw AppError.notFound('Project not found');

    const wsMembership = await this.wsMemberRepo.findByUserAndWorkspace(userId, project.workspace._id.toString());
    if (!wsMembership) throw AppError.forbidden('Access denied');

    return this.taskRepo.findProjectTasks(projectId, includeArchived);
  }

  public async getTaskById(userId: string, taskId: string): Promise<ITaskDocument> {
    const task = await this.taskRepo.findById(taskId);
    if (!task) throw AppError.notFound('Task not found');

    const wsMembership = await this.wsMemberRepo.findByUserAndWorkspace(userId, task.workspace.toString());
    if (!wsMembership) throw AppError.forbidden('Access denied');

    // Auto-record recently viewed task
    await this.recentsRepo.recordView(userId, taskId);
    domainEventBus.publish(DomainEventType.TASK_VIEWED, { taskId, userId });

    return task;
  }

  public async updateTask(userId: string, taskId: string, input: UpdateTaskInput): Promise<ITaskDocument> {
    const task = await this.taskRepo.findById(taskId);
    if (!task) throw AppError.notFound('Task not found');

    let assigneeObjectId = task.assignee ? (task.assignee as any)._id || task.assignee : null;
    if (input.assigneeId !== undefined) {
      if (input.assigneeId === null) {
        assigneeObjectId = null;
      } else {
        const projMember = await this.projMemberRepo.findByProjectAndUser(task.project.toString(), input.assigneeId);
        if (!projMember) {
          throw AppError.forbidden('Assignee must be a member of the project');
        }
        assigneeObjectId = new Types.ObjectId(input.assigneeId);
      }
    }

    const updated = await this.taskRepo.update(taskId, {
      ...(input.title && { title: input.title }),
      ...(input.descriptionPreview !== undefined && { descriptionPreview: input.descriptionPreview }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.status && { status: input.status }),
      ...(input.priority && { priority: input.priority }),
      ...(input.assigneeId !== undefined && { assignee: assigneeObjectId }),
      ...(input.labels && { labels: input.labels }),
      ...(input.startDate !== undefined && { startDate: input.startDate ? new Date(input.startDate) : null }),
      ...(input.dueDate !== undefined && { dueDate: input.dueDate ? new Date(input.dueDate) : null }),
      ...(input.estimateMinutes !== undefined && { estimateMinutes: input.estimateMinutes }),
      ...(input.spentMinutes !== undefined && { spentMinutes: input.spentMinutes }),
    });

    if (!updated) throw AppError.internal('Failed to update task');

    // Parse Mentions in updated description
    if (input.description) {
      const mentions = await this.parseMentions(input.description);
      if (mentions.length > 0) {
        domainEventBus.publish(DomainEventType.MENTIONS_PARSED, {
          taskId,
          mentionedUsernames: mentions,
          parsedByUserId: userId,
        });
      }
    }

    domainEventBus.publish(DomainEventType.TASK_UPDATED, {
      taskId,
      taskKey: task.taskKey,
      updatedByUserId: userId,
    });

    return updated;
  }

  public async moveTask(
    userId: string,
    payload: { taskId: string; targetBoardId: string; newPosition?: number; status?: TaskStatus }
  ): Promise<ITaskDocument> {
    const task = await this.taskRepo.findById(payload.taskId);
    if (!task) throw AppError.notFound('Task not found');

    const targetBoard = await this.boardRepo.findById(payload.targetBoardId);
    if (!targetBoard || targetBoard.isArchived) throw AppError.notFound('Target board not found');

    const newPosition = payload.newPosition ?? ((await this.taskRepo.getMaxPositionInBoard(targetBoard._id)) + 1);

    const updated = await this.taskRepo.updatePositionAndBoard(task._id, targetBoard._id, newPosition, payload.status);
    if (!updated) throw AppError.internal('Failed to move task');

    // Log Task History
    await this.historyRepo.create({
      task: task._id,
      user: new Types.ObjectId(userId),
      eventType: 'TASK_MOVED',
      field: 'board',
      oldValue: task.board._id.toString(),
      newValue: targetBoard._id.toString(),
      metadata: { targetBoardName: targetBoard.name },
    });

    domainEventBus.publish(DomainEventType.TASK_MOVED, {
      taskId: task._id.toString(),
      taskKey: task.taskKey,
      fromBoardId: task.board._id.toString(),
      toBoardId: targetBoard._id.toString(),
      movedByUserId: userId,
    });

    return updated;
  }

  public async assignTask(userId: string, taskId: string, assigneeId: string | null): Promise<ITaskDocument> {
    const task = await this.taskRepo.findById(taskId);
    if (!task) throw AppError.notFound('Task not found');

    let assigneeObjectId: Types.ObjectId | null = null;
    if (assigneeId) {
      const projMember = await this.projMemberRepo.findByProjectAndUser(task.project.toString(), assigneeId);
      if (!projMember) {
        throw AppError.forbidden('Assignee must be a member of the project');
      }
      assigneeObjectId = new Types.ObjectId(assigneeId);
      // Auto-watch: Assignee automatically watches task
      await this.watcherRepo.watch(taskId, assigneeId);
    }

    const updated = await this.taskRepo.update(taskId, { assignee: assigneeObjectId });
    if (!updated) throw AppError.internal('Failed to assign task');

    // Log Task History
    await this.historyRepo.create({
      task: task._id,
      user: new Types.ObjectId(userId),
      eventType: 'TASK_ASSIGNED',
      field: 'assignee',
      oldValue: task.assignee ? (task.assignee as any)._id || task.assignee : null,
      newValue: assigneeId,
    });

    domainEventBus.publish(DomainEventType.TASK_ASSIGNED, {
      taskId,
      taskKey: task.taskKey,
      assigneeId,
      assignedByUserId: userId,
    });

    return updated;
  }

  public async changeStatus(userId: string, taskId: string, status: TaskStatus): Promise<ITaskDocument> {
    const task = await this.taskRepo.findById(taskId);
    if (!task) throw AppError.notFound('Task not found');

    const updated = await this.taskRepo.update(taskId, { status });
    if (!updated) throw AppError.internal('Failed to change status');

    // Log Task History
    await this.historyRepo.create({
      task: task._id,
      user: new Types.ObjectId(userId),
      eventType: 'STATUS_CHANGED',
      field: 'status',
      oldValue: task.status,
      newValue: status,
    });

    domainEventBus.publish(DomainEventType.TASK_STATUS_CHANGED, {
      taskId,
      taskKey: task.taskKey,
      newStatus: status,
      changedByUserId: userId,
    });

    return updated;
  }

  public async changePriority(userId: string, taskId: string, priority: TaskPriority): Promise<ITaskDocument> {
    const task = await this.taskRepo.findById(taskId);
    if (!task) throw AppError.notFound('Task not found');

    const updated = await this.taskRepo.update(taskId, { priority });
    if (!updated) throw AppError.internal('Failed to change priority');

    // Log Task History
    await this.historyRepo.create({
      task: task._id,
      user: new Types.ObjectId(userId),
      eventType: 'PRIORITY_CHANGED',
      field: 'priority',
      oldValue: task.priority,
      newValue: priority,
    });

    domainEventBus.publish(DomainEventType.TASK_PRIORITY_CHANGED, {
      taskId,
      taskKey: task.taskKey,
      newPriority: priority,
      changedByUserId: userId,
    });

    return updated;
  }

  public async updateLabels(userId: string, taskId: string, labels: string[]): Promise<ITaskDocument> {
    const task = await this.taskRepo.findById(taskId);
    if (!task) throw AppError.notFound('Task not found');

    if (labels.length > 10) throw AppError.badRequest('Maximum 10 labels allowed per task');

    const updated = await this.taskRepo.update(taskId, { labels });
    if (!updated) throw AppError.internal('Failed to update labels');

    domainEventBus.publish(DomainEventType.TASK_LABELS_UPDATED, {
      taskId,
      taskKey: task.taskKey,
      labelsCount: labels.length,
      updatedByUserId: userId,
    });

    return updated;
  }

  public async archiveTask(userId: string, taskId: string): Promise<void> {
    const task = await this.taskRepo.findById(taskId);
    if (!task) throw AppError.notFound('Task not found');

    await this.taskRepo.archive(taskId);

    domainEventBus.publish(DomainEventType.TASK_ARCHIVED, {
      taskId,
      taskKey: task.taskKey,
      archivedByUserId: userId,
    });
  }

  public async searchTasks(
    userId: string,
    projectId: string,
    query: string,
    filters?: { status?: TaskStatus; priority?: TaskPriority; assigneeId?: string }
  ): Promise<ITaskDocument[]> {
    const project = await this.projectRepo.findById(projectId);
    if (!project) throw AppError.notFound('Project not found');

    const wsMembership = await this.wsMemberRepo.findByUserAndWorkspace(userId, project.workspace._id.toString());
    if (!wsMembership) throw AppError.forbidden('Access denied');

    return this.taskRepo.searchTasks(projectId, query, filters);
  }

  // --- RICH TASK FEATURES METHODS ---

  // Checklist
  public async getTaskChecklist(userId: string, taskId: string): Promise<IChecklistItemDocument[]> {
    await this.getTaskById(userId, taskId);
    return this.checklistRepo.findTaskChecklist(taskId);
  }

  public async createChecklistItem(userId: string, taskId: string, text: string): Promise<IChecklistItemDocument> {
    const task = await this.getTaskById(userId, taskId);
    const maxPos = await this.checklistRepo.getMaxPosition(taskId);

    const item = await this.checklistRepo.create({
      task: task._id,
      text: text.trim(),
      completed: false,
      position: maxPos + 1,
      createdBy: new Types.ObjectId(userId),
    });

    domainEventBus.publish(DomainEventType.CHECKLIST_CREATED, {
      checklistItemId: item._id.toString(),
      taskId,
      createdByUserId: userId,
    });

    return item;
  }

  public async updateChecklistItem(
    userId: string,
    itemId: string,
    data: { text?: string; completed?: boolean }
  ): Promise<IChecklistItemDocument> {
    const item = await this.checklistRepo.findById(itemId);
    if (!item) throw AppError.notFound('Checklist item not found');

    const updated = await this.checklistRepo.update(itemId, data);
    if (!updated) throw AppError.internal('Failed to update checklist item');

    const isCompletedToggle = data.completed !== undefined;
    domainEventBus.publish(
      isCompletedToggle && data.completed ? DomainEventType.CHECKLIST_COMPLETED : DomainEventType.CHECKLIST_UPDATED,
      { checklistItemId: itemId, taskId: item.task.toString(), updatedByUserId: userId }
    );

    return updated;
  }

  public async deleteChecklistItem(userId: string, itemId: string): Promise<void> {
    const item = await this.checklistRepo.findById(itemId);
    if (!item) throw AppError.notFound('Checklist item not found');

    await this.checklistRepo.delete(itemId);
  }

  // Dependencies
  public async getTaskDependencies(userId: string, taskId: string): Promise<ITaskDependencyDocument[]> {
    await this.getTaskById(userId, taskId);
    return this.depRepo.findTaskDependencies(taskId);
  }

  public async createDependency(userId: string, taskId: string, dependsOnId: string): Promise<ITaskDependencyDocument> {
    const task = await this.getTaskById(userId, taskId);
    const dependsOnTask = await this.getTaskById(userId, dependsOnId);

    if (task._id.toString() === dependsOnTask._id.toString()) {
      throw AppError.badRequest('A task cannot depend on itself');
    }

    const existingPair = await this.depRepo.findPair(taskId, dependsOnId);
    if (existingPair) {
      throw AppError.conflict('Dependency relationship already exists');
    }

    const isCircular = await this.depRepo.checkCircularDependency(taskId, dependsOnId);
    if (isCircular) {
      throw AppError.badRequest('Cannot add dependency: Circular dependency detected!');
    }

    const dep = await this.depRepo.create({
      task: task._id,
      dependsOn: dependsOnTask._id,
      createdBy: new Types.ObjectId(userId),
    });

    await this.taskRepo.update(taskId, { $inc: { dependencyCount: 1 } } as any);

    domainEventBus.publish(DomainEventType.DEPENDENCY_CREATED, {
      dependencyId: dep._id.toString(),
      taskId,
      dependsOnId,
      createdByUserId: userId,
    });

    return (await this.depRepo.findTaskDependencies(taskId)).find((d) => d._id.toString() === dep._id.toString())!;
  }

  public async deleteDependency(userId: string, dependencyId: string): Promise<void> {
    const dep = await this.depRepo.findById(dependencyId);
    if (!dep) throw AppError.notFound('Dependency relationship not found');

    await this.depRepo.delete(dependencyId);
    await this.taskRepo.update(dep.task.toString(), { $inc: { dependencyCount: -1 } } as any);

    domainEventBus.publish(DomainEventType.DEPENDENCY_REMOVED, {
      dependencyId,
      taskId: dep.task.toString(),
      removedByUserId: userId,
    });
  }

  // Time Tracking
  public async updateTimeTracking(
    userId: string,
    taskId: string,
    estimateMinutes?: number,
    spentMinutes?: number
  ): Promise<ITaskDocument> {
    const task = await this.getTaskById(userId, taskId);

    const updateData: Partial<ITaskDocument> = {};
    if (estimateMinutes !== undefined) updateData.estimateMinutes = estimateMinutes;
    if (spentMinutes !== undefined) updateData.spentMinutes = spentMinutes;

    const updated = await this.taskRepo.update(taskId, updateData);
    if (!updated) throw AppError.internal('Failed to update time tracking');

    domainEventBus.publish(DomainEventType.TIME_UPDATED, {
      taskId,
      estimateMinutes: updated.estimateMinutes,
      spentMinutes: updated.spentMinutes,
      updatedByUserId: userId,
    });

    return updated;
  }

  // --- TASK COLLABORATION METHODS (Phase 06C) ---

  // 1. Watchers Methods
  public async watchTask(userId: string, taskId: string): Promise<ITaskWatcherDocument> {
    await this.getTaskById(userId, taskId);
    const watcher = await this.watcherRepo.watch(taskId, userId);

    domainEventBus.publish(DomainEventType.TASK_WATCHED, { taskId, userId });
    return watcher;
  }

  public async unwatchTask(userId: string, taskId: string): Promise<void> {
    await this.getTaskById(userId, taskId);
    await this.watcherRepo.unwatch(taskId, userId);

    domainEventBus.publish(DomainEventType.TASK_UNWATCHED, { taskId, userId });
  }

  public async getTaskWatchers(userId: string, taskId: string): Promise<{ isWatching: boolean; watchers: ITaskWatcherDocument[] }> {
    await this.getTaskById(userId, taskId);
    const watchers = await this.watcherRepo.findTaskWatchers(taskId);
    const isWatching = await this.watcherRepo.isWatching(taskId, userId);
    return { isWatching, watchers };
  }

  // 2. Task History Method
  public async getTaskHistory(userId: string, taskId: string): Promise<ITaskHistoryDocument[]> {
    await this.getTaskById(userId, taskId);
    return this.historyRepo.findTaskHistory(taskId);
  }

  // 3. Recently Viewed Methods
  public async getRecentlyViewed(userId: string): Promise<IRecentlyViewedTaskDocument[]> {
    return this.recentsRepo.findUserRecents(userId);
  }
}

export const taskService = new TaskService();
