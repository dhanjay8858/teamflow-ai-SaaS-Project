import { PROJECT_INTELLIGENCE_PROMPTS } from '../prompts/projectIntelligence.prompts.js';

export type ProjectAiAction =
  | 'PROJECT_HEALTH'
  | 'SPRINT_PLANNING'
  | 'RELEASE_READINESS'
  | 'TEAM_WORKLOAD'
  | 'EXECUTIVE_REPORT'
  | 'STANDUP_GENERATION';

export interface ProjectExecutionPlan {
  action: ProjectAiAction;
  projectId: string;
  workspaceId: string;
  reportType?: string;
  systemInstruction: string;
  promptTemplate: (projectName: string, context: string) => string;
}

export class ProjectPlanner {
  public createPlan(
    action: ProjectAiAction,
    projectId: string,
    workspaceId: string,
    reportType = 'Weekly'
  ): ProjectExecutionPlan {
    let promptTemplate = PROJECT_INTELLIGENCE_PROMPTS.PROJECT_HEALTH;

    switch (action) {
      case 'PROJECT_HEALTH':
        promptTemplate = PROJECT_INTELLIGENCE_PROMPTS.PROJECT_HEALTH;
        break;

      case 'SPRINT_PLANNING':
        promptTemplate = PROJECT_INTELLIGENCE_PROMPTS.SPRINT_PLANNING;
        break;

      case 'RELEASE_READINESS':
        promptTemplate = PROJECT_INTELLIGENCE_PROMPTS.RELEASE_READINESS;
        break;

      case 'TEAM_WORKLOAD':
        promptTemplate = PROJECT_INTELLIGENCE_PROMPTS.TEAM_WORKLOAD;
        break;

      case 'EXECUTIVE_REPORT':
        promptTemplate = (name, ctx) =>
          PROJECT_INTELLIGENCE_PROMPTS.EXECUTIVE_REPORT(name, reportType, ctx);
        break;

      case 'STANDUP_GENERATION':
        promptTemplate = PROJECT_INTELLIGENCE_PROMPTS.STANDUP_GENERATION;
        break;

      default:
        promptTemplate = PROJECT_INTELLIGENCE_PROMPTS.PROJECT_HEALTH;
    }

    return {
      action,
      projectId,
      workspaceId,
      reportType,
      systemInstruction: `You are an executive AI Project & Sprint Intelligence Advisor executing action: ${action}`,
      promptTemplate,
    };
  }
}

export const projectPlanner = new ProjectPlanner();
export const sprintPlanner = projectPlanner;
export const riskPlanner = projectPlanner;
export const reportingPlanner = projectPlanner;
