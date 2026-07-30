import client from 'prom-client';

// Enable default metrics collection (CPU, Memory, Event Loop, GC, Node.js runtime)
client.collectDefaultMetrics({ prefix: 'teamflow_' });

export const register = client.register;

// ── HTTP Metrics ───────────────────────────────────────────────────────────────
export const httpRequestsTotal = new client.Counter({
  name: 'teamflow_http_requests_total',
  help: 'Total number of HTTP requests processed',
  labelNames: ['method', 'path', 'status'],
});

export const httpRequestDurationHistogram = new client.Histogram({
  name: 'teamflow_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'path', 'status'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2.5, 5, 10],
});

// ── Socket Metrics ─────────────────────────────────────────────────────────────
export const activeSocketGauge = new client.Gauge({
  name: 'teamflow_active_socket_connections',
  help: 'Number of active Socket.IO client connections',
});

// ── AI Provider Metrics ────────────────────────────────────────────────────────
export const aiProviderRequestsTotal = new client.Counter({
  name: 'teamflow_ai_provider_requests_total',
  help: 'Total number of AI provider requests by provider and status',
  labelNames: ['provider', 'status'],  // status: success | fallback | error
});

export const aiRequestDurationHistogram = new client.Histogram({
  name: 'teamflow_ai_request_duration_seconds',
  help: 'Duration of AI provider requests in seconds',
  labelNames: ['provider'],
  buckets: [0.5, 1, 2, 5, 10, 15, 20, 30],
});

// ── Agent Execution Metrics ────────────────────────────────────────────────────
export const agentExecutionsTotal = new client.Counter({
  name: 'teamflow_agent_executions_total',
  help: 'Total number of AI agent executions',
  labelNames: ['agentId', 'status'],   // status: completed | failed | pending_approval
});

export const agentExecutionDurationHistogram = new client.Histogram({
  name: 'teamflow_agent_execution_duration_seconds',
  help: 'Duration of AI agent goal executions in seconds',
  labelNames: ['agentId'],
  buckets: [1, 5, 10, 20, 30, 60, 120],
});

// ── Embedding & Vector Metrics ─────────────────────────────────────────────────
export const embeddingRetrievalHistogram = new client.Histogram({
  name: 'teamflow_embedding_retrieval_seconds',
  help: 'Duration of embedding retrieval operations (vector search) in seconds',
  labelNames: ['provider'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2],
});

// ── Business Operations Metrics ────────────────────────────────────────────────
export const uploadsCounter = new client.Counter({
  name: 'teamflow_uploads_total',
  help: 'Total number of files uploaded',
});

export const commentsCounter = new client.Counter({
  name: 'teamflow_comments_created_total',
  help: 'Total number of task comments created',
});

export const tasksCounter = new client.Counter({
  name: 'teamflow_tasks_created_total',
  help: 'Total number of tasks created',
});

export const projectsCounter = new client.Counter({
  name: 'teamflow_projects_created_total',
  help: 'Total number of projects created',
});

