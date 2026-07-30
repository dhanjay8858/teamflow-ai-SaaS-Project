# Changelog

All notable changes to TeamFlow AI will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [v1.2.0] - 2026-07-30 — Engineering Milestone 2: Deployment, DevOps & Observability

### Added
- **Multi-stage Dockerfiles**: Docker container definitions for `server` (Node 20 Alpine, non-root user) and `client` (Nginx Alpine SPA server).
- **Docker Compose Setup**: `docker-compose.yml` for local dev stack (MongoDB, Redis, Server, Client) and `docker-compose.prod.yml` override.
- **Vercel Frontend Configuration**: `vercel.json` with SPA routing rewrites and asset caching headers.
- **Render Backend Configuration**: `render.yaml` infrastructure-as-code blueprint with `/health` check and env var mapping.
- **Structured JSON Logging**: Production JSON logger with sensitive data scrubbing (`password`, `token`, `secret`, `authorization`) and unique correlation `errorId`.
- **Prometheus Metrics**: Extended metrics with `teamflow_ai_provider_requests_total`, `teamflow_ai_request_duration_seconds`, and `teamflow_agent_executions_total`.
- **Deployment Documentation**: Complete suite in `docs/deployment/` covering local dev, Vercel, Render, MongoDB Atlas, Redis, and troubleshooting.
- **CI/CD Docker & Security Verification**: GitHub Actions workflow enhanced with Docker build verification and `npm audit` security checks.

### Changed
- **Cross-Domain Cookie Auth**: Configured `sameSite: 'none'` and `secure: true` in production for Vercel -> Render cross-origin cookie authentication.
- **Vite Production Optimization**: Manual chunk splitting (`vendor-react`, `vendor-router`, `vendor-query`, `vendor-icons`) and compressed bundle targets.
- **Express Security**: Added `compression` middleware, multi-origin CORS support, and hardened `helmet()` CSP headers.
- **Environment Schema Validation**: Extended Zod validation in `env.config.ts` for AI provider keys and LLM hyperparameters.

---

## [v1.1.0] - 2026-07-29 — Engineering Milestone 1: Quality, Testing & Production Readiness

### Added
- **Backend Test Suite**: 73 Vitest + Supertest tests covering Auth, Workspace, Project, Task, Comment, Notification, and AI endpoints.
- **Frontend Test Suite**: 57 Vitest + React Testing Library tests covering Zustand stores, Protected Routes, Markdown Renderer, AIPanel, AIHub, and NotificationBell.
- **Playwright E2E Suite**: Scenarios for end-to-end user journey, AI fallback chain, and RBAC security enforcement.
- **CI/CD Pipeline**: GitHub Actions 5-stage automated pipeline enforcing type-checking, linting, unit tests, coverage gates, and build verification.
- **Security Audit & Testing Strategy**: Created `docs/security/security-audit.md` and `docs/testing/testing-strategy.md`.
