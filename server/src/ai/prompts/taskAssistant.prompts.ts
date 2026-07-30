export const TASK_ASSISTANT_PROMPTS = {
  IMPROVE_DESCRIPTION: (title: string, description: string, context: string) => `
You are a Principal Technical Project Manager.
Task Title: "${title}"
Current Description:
"${description || 'No description provided.'}"

Workspace Context:
${context}

Instruction:
Rewrite and improve the task description to be clear, professional, structured, and unambiguous.
Use Markdown headers, bullet points, context, and clear objectives.
Do not hallucinate facts.
`,

  GENERATE_SUBTASKS: (title: string, description: string, context: string) => `
You are a Senior Software Architect.
Task Title: "${title}"
Task Description:
"${description}"

Workspace Context:
${context}

Instruction:
Decompose this task into 3-6 actionable subtasks.
Format output as a Markdown list of clear subtask titles with brief execution details.
`,

  GENERATE_ACCEPTANCE_CRITERIA: (title: string, description: string) => `
You are a Lead QA Engineer.
Task Title: "${title}"
Task Description: "${description}"

Instruction:
Generate professional acceptance criteria using the Given / When / Then format.
Provide 3-5 criteria using Markdown checklist format (\`- [ ] **Given** ... **When** ... **Then** ...\`).
`,

  ESTIMATE_COMPLEXITY: (title: string, description: string, context: string) => `
You are an Agile Lead Estimator.
Task Title: "${title}"
Task Description: "${description}"

Context:
${context}

Instruction:
Estimate the complexity and effort for this task.
Return JSON with the following schema:
{
  "tShirtSize": "XS" | "S" | "M" | "L" | "XL",
  "estimatedHours": number,
  "confidence": "HIGH" | "MEDIUM" | "LOW",
  "reasoning": "string",
  "keyConsiderations": ["string"]
}
`,

  ANALYZE_RISKS: (title: string, description: string, context: string) => `
You are a Principal Security & Risk Engineer.
Task Title: "${title}"
Task Description: "${description}"

Context:
${context}

Instruction:
Analyze potential technical, security, migration, and performance risks.
Return Markdown report structured as:
- **Risk Level**: (LOW / MEDIUM / HIGH / CRITICAL)
- **Identified Risks**: (List of specific risks)
- **Mitigation Strategy**: (Step-by-step mitigations)
- **Recommended Reviewers**: (Backend, QA, DevOps, Security)
`,

  FIND_DUPLICATES: (title: string, description: string, context: string) => `
Task Title: "${title}"
Task Description: "${description}"

Existing Tasks in Workspace:
${context}

Instruction:
Analyze if this task duplicates any existing tasks.
Return Markdown summarizing potential duplicate matches, similarity percentages, and recommendations.
`,

  SUGGEST_DEPENDENCIES: (title: string, description: string, context: string) => `
Task Title: "${title}"
Task Description: "${description}"

Workspace Tasks & Architecture Context:
${context}

Instruction:
Identify logical dependencies:
- **Blocking Tasks**: Tasks that must be completed BEFORE this task.
- **Blocked By**: Tasks that CANNOT start until this task is done.
- **Circular Risk**: Any circular dependency risks.
`,

  SUMMARIZE_DISCUSSION: (taskTitle: string, commentsContext: string) => `
Task Title: "${taskTitle}"

Comment Thread & Discussion History:
${commentsContext || 'No comments found.'}

Instruction:
Summarize the discussion thread.
Provide:
- **Decision Summary**: Key conclusions reached.
- **Action Items**: Assigned or proposed actions.
- **Open Questions**: Unresolved issues needing clarification.
`,

  GENERATE_TEST_CASES: (title: string, description: string) => `
You are a Software Test Automation Engineer.
Task Title: "${title}"
Task Description: "${description}"

Instruction:
Generate comprehensive test cases.
Include:
1. **Positive Test Cases**
2. **Negative Test Cases**
3. **Edge Cases**
4. **Security & Performance Test Considerations**
`,
};
