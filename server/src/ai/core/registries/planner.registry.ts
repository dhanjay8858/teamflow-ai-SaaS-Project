import { taskPlanner } from '../../planner/task.planner.js';
import { projectPlanner } from '../../project/planners/project.planner.js';
import { PlannerNotFoundError } from '../error/aiError.js';

export interface PlannerMetadata {
  name: string;
  category: 'TASK' | 'PROJECT' | 'WORKSPACE';
  description: string;
  instance: any;
}

export class PlannerRegistry {
  private static instance: PlannerRegistry;
  private planners = new Map<string, PlannerMetadata>();

  private constructor() {
    this.seedDefaultPlanners();
  }

  public static getInstance(): PlannerRegistry {
    if (!PlannerRegistry.instance) {
      PlannerRegistry.instance = new PlannerRegistry();
    }
    return PlannerRegistry.instance;
  }

  public register(meta: PlannerMetadata): void {
    this.planners.set(meta.name, meta);
  }

  public get(name: string): PlannerMetadata {
    const planner = this.planners.get(name);
    if (!planner) {
      throw new PlannerNotFoundError(name);
    }
    return planner;
  }

  public list(): PlannerMetadata[] {
    return Array.from(this.planners.values());
  }

  private seedDefaultPlanners(): void {
    this.register({
      name: 'TaskPlanner',
      category: 'TASK',
      description: 'Planner for task subtasks, estimation, risks, criteria, and test cases',
      instance: taskPlanner,
    });

    this.register({
      name: 'ProjectPlanner',
      category: 'PROJECT',
      description: 'Planner for project health scoring, release readiness, and executive reports',
      instance: projectPlanner,
    });

    this.register({
      name: 'SprintPlanner',
      category: 'PROJECT',
      description: 'Planner for 2-week sprint backlog recommendations',
      instance: projectPlanner,
    });

    this.register({
      name: 'RiskPlanner',
      category: 'PROJECT',
      description: 'Planner for technical and release risk assessment',
      instance: projectPlanner,
    });

    this.register({
      name: 'ReportingPlanner',
      category: 'PROJECT',
      description: 'Planner for Executive Reports and daily standup generation',
      instance: projectPlanner,
    });
  }
}

export const plannerRegistry = PlannerRegistry.getInstance();
