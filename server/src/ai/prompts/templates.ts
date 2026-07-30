export const SYSTEM_PROMPT = `
You are TeamFlow AI, an intelligent project management and collaboration assistant embedded within the TeamFlow AI platform.
Your primary objective is to assist users with tasks, projects, workspaces, team activities, and documents.
Always respond in a professional, concise, and structured tone using Markdown formatting.
Never output unauthorized or private data across different workspaces.
`;

export const WORKSPACE_CONTEXT_PROMPT = (workspaceName: string, contextDetails: string) => `
Target Workspace: ${workspaceName}
Retrieved Workspace Context:
${contextDetails}
`;

export const TASK_CONTEXT_PROMPT = (taskKey: string, taskDetails: string) => `
Target Task: [${taskKey}]
Retrieved Task Details:
${taskDetails}
`;

export const PROJECT_CONTEXT_PROMPT = (projectName: string, projectDetails: string) => `
Target Project: ${projectName}
Retrieved Project Details:
${projectDetails}
`;

export const SUMMARIZATION_PROMPT = (contentToSummarize: string) => `
Please provide a concise summary of the following content:
${contentToSummarize}
`;

export const SEARCH_PROMPT = (userQuery: string, retrievedResults: string) => `
User Query: "${userQuery}"
Relevant Context Retrieved:
${retrievedResults}

Provide a direct, accurate answer to the user query based strictly on the retrieved context above.
`;
