import { GraphState, IntentType, CitationItem } from '../types/graph.types.js';
import { providerManager } from '../providers/provider.manager.js';
import {
  workspaceRetriever,
  taskRetriever,
  projectRetriever,
  commentRetriever,
  fileRetriever,
  activityRetriever,
  notificationRetriever,
} from '../retrievers/index.js';
import { searchTasks } from '../tools/task.tools.js';
import { searchProjects } from '../tools/project.tools.js';
import { searchFiles } from '../tools/file.tools.js';
import { hybridRetriever } from '../retrievers/hybrid.retriever.js';
import { SYSTEM_PROMPT, SEARCH_PROMPT } from '../prompts/templates.js';
import { logger } from '../../utils/logger.js';

export class WorkflowGraph {
  // Node 1: Input Initialization
  private async nodeInput(state: GraphState): Promise<Partial<GraphState>> {
    logger.debug(`🧠 [LangGraph] Node: Input processing: "${state.input}"`);
    return {
      stepHistory: [...state.stepHistory, 'INPUT_INITIALIZED'],
    };
  }

  // Node 2: Intent Detection
  private async nodeIntentDetection(state: GraphState): Promise<Partial<GraphState>> {
    const text = state.input.toLowerCase();
    let intent = IntentType.GENERAL_QUERY;

    if (text.includes('task') || text.includes('todo') || text.includes('bug') || text.includes('overdue') || text.includes('blocked')) {
      intent = IntentType.SEARCH_TASKS;
    } else if (text.includes('project') || text.includes('roadmap')) {
      intent = IntentType.SEARCH_PROJECTS;
    } else if (text.includes('comment') || text.includes('discussion')) {
      intent = IntentType.SEARCH_COMMENTS;
    } else if (text.includes('file') || text.includes('attachment') || text.includes('doc')) {
      intent = IntentType.SEARCH_FILES;
    } else if (text.includes('activity') || text.includes('log') || text.includes('changed') || text.includes('today')) {
      intent = IntentType.SEARCH_ACTIVITIES;
    } else if (text.includes('notification') || text.includes('alert')) {
      intent = IntentType.SEARCH_NOTIFICATIONS;
    } else if (text.includes('summary') || text.includes('summarize')) {
      intent = IntentType.SUMMARIZE;
    }

    logger.debug(`🧠 [LangGraph] Node: Intent Detected -> ${intent}`);
    return {
      intent,
      stepHistory: [...state.stepHistory, `INTENT_DETECTED:${intent}`],
    };
  }

  // Node 3: Context Retrieval (Parallel Execution)
  private async nodeContextRetrieval(state: GraphState): Promise<Partial<GraphState>> {
    const { workspaceId, taskId, projectId, userId } = state.context;
    const retrieved: string[] = [];
    const citations: CitationItem[] = [];

    if (!workspaceId) {
      return {
        context: { ...state.context, retrievedContext: ['No active workspace context'] },
        stepHistory: [...state.stepHistory, 'CONTEXT_RETRIEVED:EMPTY'],
      };
    }

    // Parallel retriever execution
    const [wsInfo, taskInfo, projInfo, fileInfo, actInfo, notifInfo] = await Promise.all([
      workspaceRetriever.retrieve(workspaceId),
      taskRetriever.retrieve(taskId, workspaceId),
      projectRetriever.retrieve(projectId, workspaceId),
      fileRetriever.retrieve(workspaceId),
      activityRetriever.retrieve(workspaceId),
      notificationRetriever.retrieve(userId),
    ]);

    retrieved.push(wsInfo);

    if (state.intent === IntentType.SEARCH_TASKS || state.intent === IntentType.SUMMARIZE || state.intent === IntentType.GENERAL_QUERY) {
      retrieved.push(taskInfo);
    }
    if (state.intent === IntentType.SEARCH_PROJECTS || state.intent === IntentType.SUMMARIZE || state.intent === IntentType.GENERAL_QUERY) {
      retrieved.push(projInfo);
    }
    if (state.intent === IntentType.SEARCH_FILES || state.intent === IntentType.SUMMARIZE) {
      retrieved.push(fileInfo);
    }
    if (state.intent === IntentType.SEARCH_ACTIVITIES || state.intent === IntentType.SUMMARIZE) {
      retrieved.push(actInfo);
    }
    if (state.intent === IntentType.SEARCH_NOTIFICATIONS) {
      retrieved.push(notifInfo);
    }
    if (state.intent === IntentType.SEARCH_COMMENTS && taskId) {
      const commentInfo = await commentRetriever.retrieve(taskId);
      retrieved.push(commentInfo);
    }

    // Hybrid RAG Search (Vector Search + Repository Search + Re-ranking)
    const hybridData = await hybridRetriever.search(
      workspaceId,
      state.input,
      10,
      projectId,
      taskId
    );

    if (hybridData.contextBlock) {
      retrieved.push(hybridData.contextBlock);
    }
    if (hybridData.citations && hybridData.citations.length > 0) {
      citations.push(...hybridData.citations);
    }

    logger.debug(`🧠 [LangGraph] Node: Parallel Context Retrieved (${retrieved.length} blocks, ${citations.length} citations)`);
    return {
      context: {
        ...state.context,
        retrievedContext: retrieved,
        citations,
      },
      stepHistory: [...state.stepHistory, 'CONTEXT_RETRIEVED_PARALLEL'],
    };
  }

  // Node 4: Tool Selection
  private async nodeToolSelection(state: GraphState): Promise<Partial<GraphState>> {
    const selectedTools: string[] = [];
    switch (state.intent) {
      case IntentType.SEARCH_TASKS:
        selectedTools.push('searchTasks', 'getTask');
        break;
      case IntentType.SEARCH_PROJECTS:
        selectedTools.push('searchProjects', 'getProject');
        break;
      case IntentType.SEARCH_COMMENTS:
        selectedTools.push('searchComments');
        break;
      case IntentType.SEARCH_FILES:
        selectedTools.push('searchFiles');
        break;
      case IntentType.SEARCH_ACTIVITIES:
        selectedTools.push('searchActivities');
        break;
      case IntentType.SEARCH_NOTIFICATIONS:
        selectedTools.push('searchNotifications');
        break;
      default:
        selectedTools.push('getWorkspace', 'searchTasks', 'searchProjects');
    }

    logger.debug(`🧠 [LangGraph] Node: Tools Selected -> [${selectedTools.join(', ')}]`);
    return {
      selectedTools,
      stepHistory: [...state.stepHistory, `TOOLS_SELECTED:${selectedTools.join(',')}`],
    };
  }

  // Node 5: LLM Generation
  private async nodeLLMGeneration(state: GraphState): Promise<Partial<GraphState>> {
    const contextBlock = state.context.retrievedContext.join('\n\n');
    const prompt = SEARCH_PROMPT(state.input, contextBlock || 'No additional context retrieved');

    const output = await providerManager.generate({
      prompt,
      options: {
        systemPrompt: SYSTEM_PROMPT,
      },
    });

    logger.debug(`🧠 [LangGraph] Node: LLM Generation Completed (${output.totalTokens} tokens, via ${output.provider})`);
    return {
      generationText: output.text,
      tokensUsed: {
        prompt: output.promptTokens,
        completion: output.completionTokens,
        total: output.totalTokens,
      },
      stepHistory: [...state.stepHistory, `LLM_GENERATED:${output.provider}`],
    };
  }

  // Node 6: Response Formatting
  private async nodeResponse(state: GraphState): Promise<Partial<GraphState>> {
    const finalResponse = state.generationText || 'Request processed successfully.';
    logger.debug(`🧠 [LangGraph] Node: Response Formatted`);
    return {
      finalResponse,
      stepHistory: [...state.stepHistory, 'RESPONSE_READY'],
    };
  }

  // Execute full graph workflow sequentially
  public async execute(initialInput: string, contextData: GraphState['context']): Promise<GraphState> {
    let state: GraphState = {
      input: initialInput,
      intent: IntentType.UNKNOWN,
      context: contextData,
      selectedTools: [],
      toolResults: {},
      generationText: '',
      finalResponse: '',
      stepHistory: [],
      tokensUsed: { prompt: 0, completion: 0, total: 0 },
    };

    state = { ...state, ...(await this.nodeInput(state)) };
    state = { ...state, ...(await this.nodeIntentDetection(state)) };
    state = { ...state, ...(await this.nodeContextRetrieval(state)) };
    state = { ...state, ...(await this.nodeToolSelection(state)) };
    state = { ...state, ...(await this.nodeLLMGeneration(state)) };
    state = { ...state, ...(await this.nodeResponse(state)) };

    return state;
  }
}

export const workflowGraph = new WorkflowGraph();
