import { TASK_ASSISTANT_PROMPTS } from '../prompts/taskAssistant.prompts.js';

export type TaskActionType =
  | 'IMPROVE_DESCRIPTION'
  | 'GENERATE_SUBTASKS'
  | 'GENERATE_ACCEPTANCE_CRITERIA'
  | 'ESTIMATE_COMPLEXITY'
  | 'ANALYZE_RISKS'
  | 'FIND_DUPLICATES'
  | 'SUGGEST_DEPENDENCIES'
  | 'SUMMARIZE_DISCUSSION'
  | 'GENERATE_TEST_CASES';

export interface TaskExecutionPlan {
  action: TaskActionType;
  taskId: string;
  workspaceId: string;
  requiredRetrievers: string[];
  requiredTools: string[];
  systemInstruction: string;
  promptTemplate: (title: string, desc: string, context: string) => string;
}

export class TaskPlanner {
  public createPlan(
    action: TaskActionType,
    taskId: string,
    workspaceId: string
  ): TaskExecutionPlan {
    let requiredRetrievers: string[] = [];
    let requiredTools: string[] = [];
    let promptTemplate = TASK_ASSISTANT_PROMPTS.IMPROVE_DESCRIPTION;

    switch (action) {
      case 'IMPROVE_DESCRIPTION':
        requiredRetrievers = ['WorkspaceRetriever', 'ProjectRetriever'];
        requiredTools = ['getTaskContextTool'];
        promptTemplate = TASK_ASSISTANT_PROMPTS.IMPROVE_DESCRIPTION;
        break;

      case 'GENERATE_SUBTASKS':
        requiredRetrievers = ['TaskRetriever', 'ProjectRetriever'];
        requiredTools = ['getTaskContextTool'];
        promptTemplate = TASK_ASSISTANT_PROMPTS.GENERATE_SUBTASKS;
        break;

      case 'GENERATE_ACCEPTANCE_CRITERIA':
        requiredRetrievers = ['TaskRetriever'];
        requiredTools = ['getTaskContextTool'];
        promptTemplate = TASK_ASSISTANT_PROMPTS.GENERATE_ACCEPTANCE_CRITERIA;
        break;

      case 'ESTIMATE_COMPLEXITY':
        requiredRetrievers = ['TaskRetriever', 'ProjectRetriever'];
        requiredTools = ['getTaskContextTool', 'findDuplicateTasksTool'];
        promptTemplate = TASK_ASSISTANT_PROMPTS.ESTIMATE_COMPLEXITY;
        break;

      case 'ANALYZE_RISKS':
        requiredRetrievers = ['TaskRetriever', 'FileRetriever', 'ActivityRetriever'];
        requiredTools = ['getTaskContextTool'];
        promptTemplate = TASK_ASSISTANT_PROMPTS.ANALYZE_RISKS;
        break;

      case 'FIND_DUPLICATES':
        requiredRetrievers = ['TaskRetriever'];
        requiredTools = ['findDuplicateTasksTool'];
        promptTemplate = TASK_ASSISTANT_PROMPTS.FIND_DUPLICATES;
        break;

      case 'SUGGEST_DEPENDENCIES':
        requiredRetrievers = ['TaskRetriever', 'ProjectRetriever'];
        requiredTools = ['getTaskContextTool'];
        promptTemplate = TASK_ASSISTANT_PROMPTS.SUGGEST_DEPENDENCIES;
        break;

      case 'SUMMARIZE_DISCUSSION':
        requiredRetrievers = ['CommentRetriever', 'ActivityRetriever'];
        requiredTools = ['summarizeDiscussionTool'];
        promptTemplate = (title, _, context) => TASK_ASSISTANT_PROMPTS.SUMMARIZE_DISCUSSION(title, context);
        break;

      case 'GENERATE_TEST_CASES':
        requiredRetrievers = ['TaskRetriever'];
        requiredTools = ['getTaskContextTool'];
        promptTemplate = TASK_ASSISTANT_PROMPTS.GENERATE_TEST_CASES;
        break;

      default:
        requiredRetrievers = ['TaskRetriever'];
        requiredTools = ['getTaskContextTool'];
        promptTemplate = TASK_ASSISTANT_PROMPTS.IMPROVE_DESCRIPTION;
    }

    return {
      action,
      taskId,
      workspaceId,
      requiredRetrievers,
      requiredTools,
      systemInstruction: `You are an expert AI Task Assistant for TeamFlow AI executing action: ${action}`,
      promptTemplate,
    };
  }
}

export const taskPlanner = new TaskPlanner();
