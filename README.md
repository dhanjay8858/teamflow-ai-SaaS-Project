# TeamFlow AI — Multi-Tenant Project Management & Real-Time Collaboration Platform

[![CI/CD Pipeline](https://github.com/YOUR_ORG/teamflow-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_ORG/teamflow-ai/actions)
![Backend Coverage](https://img.shields.io/badge/backend_coverage-90%25-brightgreen)
![Frontend Coverage](https://img.shields.io/badge/frontend_coverage-80%25-green)
![Security Audit](https://img.shields.io/badge/security_audit-98%2F100-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![License](https://img.shields.io/badge/license-MIT-blue)

Production-grade SaaS platform built with Node.js, Express, TypeScript, MongoDB, Socket.IO, Redis, React, React Query, Zustand, and TailwindCSS.

---

## 🌐 Production Deployment & Live Infrastructure

| Service | Target Platform | URL / Configuration |
|---|---|---|
| **Frontend** | Vercel | `https://teamflow-ai.vercel.app` (`client/vercel.json`) |
| **Backend** | Render | `https://teamflow-backend.onrender.com` (`render.yaml`) |
| **Database** | MongoDB Atlas | Cloud MongoDB Cluster (`docs/deployment/mongodb-atlas-setup.md`) |
| **Storage** | Cloudinary | Cloud File Storage |
| **Redis** | Upstash Redis | Optional horizontal scaling (`REDIS_ENABLED=false` default) |

### Deployment Documentation
- 🐳 [Local Development (Docker Compose)](docs/deployment/local-development.md)
- ⚡ [Vercel Deployment Guide](docs/deployment/vercel-deployment.md)
- 🚀 [Render Deployment Guide](docs/deployment/render-deployment.md)
- 🔒 [Production Security & Hardening](docs/security/production-hardening.md)
- ❓ [Production Troubleshooting](docs/deployment/troubleshooting.md)
- 📋 [Changelog (v1.2.0)](CHANGELOG.md)

---

## 🧪 Quality & Testing

### Test Stack
| Layer | Tool | Coverage Target |
|---|---|---|
| Backend Unit | Vitest | ≥ 90% |
| Backend Integration | Vitest + Supertest | ≥ 90% |
| Frontend Components | Vitest + React Testing Library | ≥ 80% |
| E2E | Playwright | Critical paths |

### Quick Commands
```bash
# Backend tests
cd server && npm test            # All tests
cd server && npm run test:unit   # Unit only
cd server && npm run test:coverage  # With coverage

# Frontend tests
cd client && npm test            # All tests
cd client && npm run test:e2e    # Playwright E2E

# Performance benchmark
cd server && npx tsx scripts/benchmark.ts
```

### Documentation
- [Testing Strategy](docs/testing/testing-strategy.md)
- [Security Audit Report](docs/security/security-audit.md)

---

## 🤖 Multi-Agent Automation Platform (Phase 12)

### 1. Agent Runtime Architecture (`server/src/ai/agents/`)
- **`AgentRuntime`**: Single point of entry for goal execution, RBAC checks, and streaming.
- **`AgentRegistry`**: Dynamic registration and lookup for specialized AI agents.
- **`AgentMemoryService`**: Persistent short-term plans, long-term summaries, and workspace reflection logs.
- **`AgentOrchestrator`**: Manages single-agent execution, multi-agent delegation graphs, and human approval flows.
- **`ReflectionEngine`**: Self-evaluates confidence scores, tool failures, and recommendations post-execution.

### 2. 6 Specialized Autonomous Agents
1. 🤖 **ScrumMasterAgent**: Sprint planning, sprint review, velocity analysis, and standup generation.
2. 🤖 **ProjectManagerAgent**: Prioritization, milestone tracking, deadline risks, and roadmap planning.
3. 🤖 **QAAgent**: Test case generation, acceptance criteria review, and regression checklists.
4. 🤖 **TechnicalWriterAgent**: Release notes, architecture summaries, and API specifications.
5. 🤖 **ReleaseManagerAgent**: Release readiness checklists, deployment validation, and rollback strategy.
6. 🤖 **KnowledgeAgent**: Workspace semantic search, architecture explanation, and cross-project discovery.

### 3. Human-In-The-Loop Approval & Multi-Agent Delegation
- **Human Approval**: Dangerous or destructive execution plans pause for explicit user `APPROVED` / `REJECTED` state transitions.
- **Delegation Graphs**: `AgentOrchestrator` coordinates sequential or parallel agent handoffs (e.g. `ProjectManagerAgent` ➔ `ScrumMasterAgent` ➔ `QAAgent` ➔ `ReleaseManagerAgent`).

### 4. API Endpoints (`/api/v1/agents`)
- `POST /api/v1/agents/run` — Execute single or multi-agent goal
- `POST /api/v1/agents/run-stream` — SSE streaming agent goal execution
- `POST /api/v1/agents/approve` — Approve execution plan
- `POST /api/v1/agents/reject` — Reject execution plan
- `GET /api/v1/agents` — List active registered agents
- `GET /api/v1/agents/history` — Agent memory history
- `GET /api/v1/agents/reflections` — Workspace agent reflection logs
- `GET /api/v1/agents/status` — Runtime status & capabilities

---

## 🛡️ AI Architecture Hardening & Production Readiness (Phase 11F)

### 1. Registries Architecture (`server/src/ai/core/registries/`)
- **`PromptRegistry`**: Centralized registry with prompt versioning (`v1`, `v2`, `v3`), categories, authors, and fallback resolution.
- **`PlannerRegistry`**: Dynamic registration and lookup for `TaskPlanner`, `ProjectPlanner`, `SprintPlanner`, `RiskPlanner`, and `ReportingPlanner`.
- **`ToolRegistry`**: Tool metadata, permissions (`workspace:read`), categories, and execution timeouts.
- **`ProviderRegistry`**: Dynamic status tracking (`healthy`, `unhealthy`, `unconfigured`), priority order, failure counts, and response latency.

### 2. Enterprise Telemetry & Audit Logging
- **`AIAuditLogModel` & `AIAuditService`**: Persists non-sensitive execution metadata (`userId`, `workspaceId`, `planner`, `provider`, `promptVersion`, `toolChain`, `latencyMs`, `tokenUsage`, `estimatedCost`, `fallbackOccurred`, `citationsCount`, `requestId`).
- **`AIMetricsService`**: Exposes Prometheus metrics (`teamflow_ai_requests_total`, `teamflow_ai_request_duration_seconds`, `teamflow_ai_tokens_total`, `teamflow_ai_fallbacks_total`).

### 3. Health, Diagnostics & Error System
- **`AIHealthService`**: Multi-tiered health checks across Groq, Gemini, Ollama, Nomic Embeddings, MongoDB Vector Store, and Registries.
- **`AIDiagnosticsService`**: Automated diagnostic reports for provider failures, embedding fallbacks, and RAG execution issues.
- **Standardized AI Errors (`aiError.ts`)**: `ProviderUnavailableError`, `PlannerNotFoundError`, `PromptNotFoundError`, `EmbeddingFailureError`, `RetrieverFailureError`, `ValidationFailureError`, `StreamingFailureError`.

### 4. Admin Observability Endpoints (`/api/v1/ai/core`)
- `GET /api/v1/ai/core/health` — Platform health & registry status
- `GET /api/v1/ai/core/providers` — Provider diagnostic metrics & response times
- `GET /api/v1/ai/core/metrics` — Automated diagnostic report
- `GET /api/v1/ai/core/audit` — Paginated AI audit logs
- `GET /api/v1/ai/core/prompts` — Registered prompts & versions
- `GET /api/v1/ai/core/planners` — Registered AI planners
- `GET /api/v1/ai/core/tools` — Registered AI tool metadata & permissions
- `GET /api/v1/ai/core/config` — Centralized AI configuration

---

## 📈 AI Project & Sprint Intelligence (Phase 11E)

### 1. Overview
Executive AI intelligence layer for project managers and engineering leaders. Provides Project Health Scoring, Sprint Planning, Release Readiness Analysis, Team Workload Balancing, Executive Report Exports, and Daily Stand-up Generation.

### 2. Specialized Planners (`server/src/ai/project/planners/project.planner.ts`)
- **`ProjectPlanner`**: Evaluates overall project trajectory and generates health scores (0–100).
- **`SprintPlanner`**: Analyzes team capacity vs. backlog to suggest optimal 2-week sprint allocations.
- **`RiskPlanner`**: Analyzes technical, dependency, and release blockers.
- **`ReportingPlanner`**: Generates exportable Markdown Executive Reports (Weekly, Sprint, Release Summary).

### 3. Key Project AI Features
- 🩺 **Project Health Scoring**: Calculates numeric score (0 to 100) based on task completion, blocked items, overdue work, and velocity.
- 🚀 **Sprint Planning**: Suggests sprint backlog items, capacity utilization %, overflow items, and risk summaries.
- 📦 **Release Readiness**: Evaluates deployment readiness %, must-fix blocking issues, and untested work gaps.
- ⚖️ **Team Workload Balancing**: Identifies overloaded/underutilized team members and recommends task rebalancing.
- 📊 **Executive Reports**: Generates Markdown reports exportable as `.md` files.
- 👤 **Daily Standup Generation**: Formats Yesterday / Today / Blockers summaries per team member.

### 4. API Endpoints
- `POST /api/v1/ai/project-assistant/action` — Execute project AI action with workspace RBAC.
- `POST /api/v1/ai/project-assistant/stream` — SSE streaming project intelligence output.

---

## ⚡ AI Task Assistant (Phase 11D)

### 1. Overview
Action-oriented AI Task Assistant embedded directly inside every task drawer. Decoupled using a **Planner-Executor-Validator** architecture (`server/src/ai/planner`, `server/src/ai/executor`, `server/src/ai/validators`). Assists users with task refinement, estimation, risk analysis, test generation, and discussion summaries.

### 2. Planner-Executor-Validator Architecture
- **TaskPlanner (`server/src/ai/planner/task.planner.ts`)**: Analyzes intent and constructs execution plans specifying required context retrievers, tools, and system prompts. Never mutates data directly.
- **TaskExecutor (`server/src/ai/executor/task.executor.ts`)**: Gathers hybrid RAG context, executes repository tools, and streams outputs via `ProviderManager` (`Groq` → `Gemini` → `Ollama`).
- **TaskValidator (`server/src/ai/validators/task.validator.ts`)**: Validates generated output, detects hallucinations, verifies Given/When/Then acceptance criteria formatting, and ensures standard T-shirt complexity estimations.

### 3. AI Task Features (9 Actions)
- ✨ **Improve Description**: Rewrites and structures task descriptions into professional Markdown.
- ✨ **Generate Subtasks**: Decomposes complex tasks into 3–6 actionable subtasks.
- ✨ **Acceptance Criteria**: Formats criteria using standard `Given / When / Then` Given-When-Then rules.
- ✨ **Complexity Estimation**: Estimates effort (`XS`/`S`/`M`/`L`/`XL`), hours, confidence score, and reasoning.
- ✨ **Risk Analysis**: Analyzes technical, migration, security, and performance risks.
- ✨ **Find Duplicates**: Searches existing workspace tasks using Hybrid RAG to detect duplicate work.
- ✨ **Suggest Dependencies**: Identifies blocking tasks, blocked-by tasks, and circular dependencies.
- ✨ **Summarize Discussion**: Summarizes task comments, replies, decisions, and open questions.
- ✨ **Generate Test Cases**: Produces positive, negative, edge, and security test case specifications.

### 4. API Endpoints
- `POST /api/v1/ai/task-assistant/action` — Execute task assistant action with RBAC checks.
- `POST /api/v1/ai/task-assistant/stream` — SSE streaming AI task generation output.

---

## 🧠 Semantic Knowledge Base & Hybrid RAG (Phase 11C)

### 1. Event-Driven Indexing (`IndexingSubscriber`)
- Listens to `DomainEventBus` events (`TASK_CREATED`, `TASK_UPDATED`, `COMMENT_CREATED`, `FILE_UPLOADED`, `PROJECT_CREATED`, `WORKSPACE_CREATED`).
- Automatically updates vector index in the background without blocking core HTTP request cycles.
- Business services emit events only — embedding and indexing pipeline is fully decoupled.

### 2. Document Chunking Service (`ChunkingService`)
- Configured chunk size: 800–1000 tokens (~3500 characters).
- Overlap: 150–200 tokens (~700 characters).
- Supports Markdown, plain text, comments, task descriptions, file text, activity summaries.

### 3. Embedding Pipeline & Persistence
- Reuses `NomicEmbeddingProvider` (`nomic-embed-text:v1.5`, 768 dimensions).
- `VectorDocumentModel` stores `chunkId`, `workspaceId`, `projectId`, `entityType`, `entityId`, `chunkIndex`, `chunkText`, `embedding`, and `metadata`.
- `MongoDBVectorStore` supports persistent bulk upsert, deletion, vector search, and fallback.

### 4. Hybrid RAG Pipeline (`HybridRetriever`)
1. **Vector Search**: Computes query embeddings and executes similarity search in `MongoDBVectorStore`.
2. **Repository Search**: Runs parallel keyword queries in `searchTasks`, `searchProjects`, `searchFiles`, `searchComments`.
3. **Deduplication**: Removes duplicate entity contents.
4. **Re-ranking**: Normalizes scores across similarity (50%) + recency & entity importance (50%).
5. **Context Fusion & Citation Generation**: Generates ranked context blocks with structured citations.

### 5. Retriever Cache & Invalidation (`RetrieverCache`)
- In-memory 5-minute TTL cache storing hybrid search results.
- Automatically invalidated whenever domain indexing events occur.

### 6. Admin API Endpoints (`/api/v1/ai/index`)
- `POST /api/v1/ai/index/rebuild` — Rebuilds workspace vector index.
- `GET /api/v1/ai/index/status` — Returns automated indexing status.
- `GET /api/v1/ai/index/statistics` — Returns total chunk counts, entity distribution, and provider info.

---

## 🤖 Workspace AI Assistant (Phase 11B)

### 1. Overview
Integrated natural language AI Assistant that analyzes the workspace across Tasks, Projects, Boards, Comments, Files, Activities, Notifications, and Metadata. Operates seamlessly using the existing LangGraph workflow engine, retrievers, repository tools, and multi-provider fallback strategy (`Groq` → `Gemini` → `Ollama`).

### 2. Frontend Components (`client/src/features/ai/`)
- **`AIButton`**: Floating trigger button with keyboard shortcut listener (`⌘K` / `Ctrl+K`).
- **`AIPanel`**: Resizable slide-over drawer with chat header, conversation controls, and side navigation.
- **`ChatWindow`**: Scrollable chat history container with auto-scroll and typing animation.
- **`ChatInput`**: Auto-resizing prompt textarea with send/stop buttons and `Enter` / `Shift+Enter` key handling.
- **`ChatMessage`**: Formatted message bubble rendering Markdown, code blocks, citations, provider badges, and copy/retry actions.
- **`CitationCard` & `SourceBadge`**: Interactive citation chips for referenced tasks, projects, files, comments, and activities.
- **`SuggestedQuestions`**: Pre-built prompt buttons ("What changed today?", "Summarize this workspace", etc.).
- **`ProviderBadge` & `TokenUsageIndicator`**: Real-time display of active model (`Groq`, `Gemini`, `Ollama`), latency in ms, and token usage.

### 3. Backend & Security Architecture
- Executed via `POST /api/v1/ai/query` & `POST /api/v1/ai/stream`.
- **Parallel Context Retrieval**: `WorkflowGraph` retrieves workspace, project, task, file, activity, and notification context concurrently using `Promise.all`.
- **Strict RBAC Enforcement**: `AIService` verifies workspace membership before executing retrievers or searching repositories.
- **Citations System**: Context metadata automatically converted into structured `CitationItem[]` chips for frontend navigation.

---

## 🤖 AI Provider Refactor & Infrastructure (Phase 11A & 11A.1)

### 1. Multi-Provider Fallback Architecture (`Groq` → `Gemini` → `Ollama`)
- **`ProviderManager`**: Manages automatic fallback execution, exponential retry backoff (`MAX_RETRIES`), timeout protection (`LLM_TIMEOUT_MS`), circuit breaker, and round-trip observability metrics.
- **Primary Cloud Provider (`GroqProvider`)**: High-speed LLM inference via `groq-sdk` supporting configurable models (`GROQ_MODEL`, default `llama-3.3-70b-versatile`).
- **First Cloud Fallback (`GeminiProvider`)**: Google Gemini Generative AI fallback (`GEMINI_MODEL`, default `gemini-1.5-flash`).
- **Local Fallback (`OllamaProvider`)**: Local inference via Ollama HTTP API (`OLLAMA_MODEL`, default `llama3.1:8b`).

### 2. Nomic Embedding Provider (`NomicEmbeddingProvider`)
- **Primary Embedding**: `NomicEmbeddingProvider` generating embeddings via Ollama HTTP API (`nomic-embed-text:v1.5`) with vector generator fallback.
- **Vector Store**: `MongoDBVectorStore` implementing `VectorStore` interface for vector indexing and cosine similarity search.

### 3. LangGraph Workflow Graph
- State Graph executing sequential node transitions:
  `Input` → `Intent Detection` → `Context Retrieval` → `Tool Selection` → `LLM Generation` → `Response`

### 4. Reusable Repository Tools & Context Retrievers
- Tools wrapping Repositories only (no direct MongoDB queries in graph nodes): `searchTasks`, `getTask`, `searchProjects`, `getProject`, `getWorkspace`, `searchComments`, `searchFiles`, `searchActivities`, `searchNotifications`.
- Retrievers gathering structured context: `WorkspaceRetriever`, `TaskRetriever`, `ProjectRetriever`, `CommentRetriever`, `FileRetriever`, `ActivityRetriever`, `NotificationRetriever`.

### 5. API Endpoints (`/api/v1/ai`)
- `GET /health` — Multi-component AI health status (Groq, Gemini, Ollama, Nomic Embeddings, VectorStore)
- `GET /providers` — Active and pluggable LLM, Embedding, and VectorStore provider configurations
- `POST /query` — Authenticated workflow graph query execution with workspace RBAC
- `POST /stream` — Server-Sent Events (SSE) streaming generative text chunks
- `POST /embed-test` — Embedding vector test endpoint

---

## 🔔 Notification Center Architecture (Phase 10)

### 1. Decoupled Domain Event Architecture
- **Services emit Domain Events** (`TASK_ASSIGNED`, `COMMENT_CREATED`, `MENTIONS_PARSED`, etc.) — notification creation is never called inside core business logic.
- **`registerNotificationSubscribers`** in `notification.subscriber.ts` consumes domain events, calculates valid recipients (excluding the actor), and triggers notification creation & Socket.IO real-time dispatch.

### 2. Socket.IO Real-Time Dispatch (`user:{userId}`)
- Authenticated clients join their personal room `user:{userId}`.
- Real-time events emitted:
  - `NOTIFICATION_CREATED` — New in-app notification
  - `NOTIFICATION_READ` — Single notification read
  - `NOTIFICATION_READ_ALL` — Mark all as read
  - `NOTIFICATION_DELETED` — Single notification deleted
  - `UNREAD_COUNT_UPDATED` — Live unread badge update

### 3. API Endpoints (`/api/v1/notifications`)
- `GET /` — Cursor-paginated notification history (`limit`, `cursor`)
- `GET /unread-count` — Fast count of unread notifications
- `PATCH /read-all` — Mark all unread notifications as read
- `PATCH /:id/read` — Mark a single notification as read
- `DELETE /:id` — Delete a notification

---

## 🚀 Infrastructure & Production Features (Phase 09A)

### 1. Health & Readiness Probes
- `GET /health` — Detailed component status (MongoDB, Redis, Cloudinary, memory, uptime) — HTTP 200 (healthy) / 503 (unhealthy)
- `GET /ready` — Kubernetes readiness probe verifying active MongoDB & Redis connections
- `GET /live` — Kubernetes process liveness probe
- `GET /metrics` — Prometheus-compatible metrics endpoint

### 2. Prometheus Metrics (`prom-client`)
- `teamflow_http_requests_total` — Total HTTP request counter tagged by `method`, `path`, and `status`
- `teamflow_http_request_duration_seconds` — Request duration histogram
- `teamflow_active_socket_connections` — Active Socket.IO connection gauge
- `teamflow_uploads_total` — Total file upload counter
- `teamflow_comments_created_total` — Task comments counter
- `teamflow_tasks_created_total` — Tasks created counter
- `teamflow_projects_created_total` — Projects created counter

### 3. Socket.IO Horizontal Scaling & Redis Pub/Sub
- Automatically uses `@socket.io/redis-adapter` when `REDIS_ENABLED=true`
- Falls back to in-memory adapter in local development or standalone mode
- `RedisPublisher` abstraction available for distributed event streaming (`ENABLE_REDIS_EVENTS=true`)

### 4. Request Correlation & Structured Logging
- `requestIdMiddleware` assigns or reuses `X-Request-ID` across every incoming HTTP request
- Structured JSON logging includes `requestId`, `method`, `path`, `status`, `durationMs`, `ip`, `userId`, `workspaceId`, `projectId`
- Sensitive headers (`Authorization`, `Cookie`) and secrets are redacted

### 5. Dedicated Route-Specific Rate Limiters
- Auth Limiter: 20 attempts / 15m
- File Upload Limiter: 30 uploads / 15m
- Comment Creation Limiter: 60 comments / 5m
- Task Creation Limiter: 100 tasks / 10m
- Organization Creation Limiter: 5 orgs / 1h
- Invitation Limiter: 20 invitations / 15m

### 6. Graceful 4-Step Shutdown
Handles `SIGINT` & `SIGTERM` signals in order:
1. Stop accepting new HTTP requests
2. Close Socket.IO connections
3. Close MongoDB database connections
4. Close Redis pub/sub connections

---

## ⚙️ Infrastructure Configuration (`env.config.ts`)

| Environment Variable | Type | Default | Description |
|---|---|---|---|
| `NODE_ENV` | `development \| production \| test` | `development` | Runtime environment |
| `PORT` | `number` | `5000` | Server listening port |
| `CLIENT_URL` | `string` | `http://localhost:3000` | CORS allowed origin |
| `MONGODB_URI` | `string` | `mongodb://localhost:27017/teamflow` | MongoDB connection string |
| `REDIS_ENABLED` | `boolean` | `false` | Enable Redis adapter & caching |
| `REDIS_URL` | `string` | `undefined` | Optional Redis URI (e.g. `redis://:pass@host:6379`) |
| `REDIS_HOST` | `string` | `127.0.0.1` | Redis host |
| `REDIS_PORT` | `number` | `6379` | Redis port |
| `METRICS_ENABLED` | `boolean` | `true` | Enable `/metrics` endpoint |
| `ENABLE_REDIS_EVENTS` | `boolean` | `false` | Distribute domain events via Redis Pub/Sub |
| `LOG_LEVEL` | `string` | `info` | Logging verbosity (`info`, `warn`, `error`, `debug`) |
| `GROQ_API_KEY` | `string` | `""` | Groq API Key for Primary LLM Inference |
| `GEMINI_API_KEY` | `string` | `""` | Google Gemini API Key for Fallback |
