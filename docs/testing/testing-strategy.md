# TeamFlow AI — Testing Strategy

## Overview

TeamFlow AI employs a **4-layer testing pyramid** to ensure production-quality reliability:

```
                    ┌──────────────┐
                    │  E2E Tests   │  ← Playwright (critical user journeys)
                   ┌┴──────────────┴┐
                   │ Integration    │  ← Supertest (API contract verification)
                  ┌┴────────────────┴┐
                  │  Component Tests │  ← React Testing Library (UI behavior)
                 ┌┴──────────────────┴┐
                 │    Unit Tests      │  ← Vitest (isolated business logic)
                 └────────────────────┘
```

---

## Technology Stack

| Layer | Backend | Frontend |
|---|---|---|
| Unit Tests | Vitest | Vitest |
| Integration Tests | Vitest + Supertest | — |
| Component Tests | — | React Testing Library |
| E2E Tests | — | Playwright |
| Coverage | @vitest/coverage-v8 | @vitest/coverage-v8 |

---

## Directory Structure

### Backend (`server/`)
```
tests/
├── unit/                           # Isolated service & utility tests
│   ├── appError.test.ts
│   ├── auth.service.test.ts
│   ├── workspace.service.test.ts
│   ├── project.service.test.ts
│   ├── task.service.test.ts
│   ├── comment.service.test.ts
│   ├── notification.service.test.ts
│   └── ai.provider.test.ts
├── integration/                    # Supertest API endpoint tests
│   ├── auth.api.test.ts
│   ├── org.api.test.ts
│   ├── task.api.test.ts
│   └── ai.api.test.ts
├── fixtures/                       # Mock data & factories
│   └── mockData.ts
└── helpers/                        # Shared test utilities
```

### Frontend (`client/`)
```
src/
├── stores/
│   └── auth.store.test.ts          # Zustand store tests
├── routes/
│   └── ProtectedRoute.test.tsx     # Route guard tests
├── features/
│   ├── ai/components/
│   │   └── MarkdownRenderer.test.tsx
│   └── notifications/components/
│       └── NotificationBell.test.tsx
e2e/
├── scenario-user-journey.spec.ts   # Full user journey
├── scenario-ai-fallback.spec.ts    # Provider resilience
└── scenario-rbac-security.spec.ts  # Authorization checks
```

---

## Coverage Targets

| Scope | Target | Enforcement |
|---|---|---|
| Backend Statements | ≥ 90% | `vitest.config.ts` threshold + CI gate |
| Backend Functions | ≥ 90% | `vitest.config.ts` threshold + CI gate |
| Backend Branches | ≥ 85% | `vitest.config.ts` threshold + CI gate |
| Frontend Statements | ≥ 80% | `vitest.config.ts` threshold + CI gate |
| Frontend Functions | ≥ 80% | `vitest.config.ts` threshold + CI gate |
| Frontend Branches | ≥ 75% | `vitest.config.ts` threshold + CI gate |

---

## Testing Commands

### Backend
```bash
cd server

# Run all backend tests
npm test

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run with coverage report
npm run test:coverage
```

### Frontend
```bash
cd client

# Run all component/store tests
npm test

# Run with coverage
npm run test:coverage

# Run Playwright E2E
npm run test:e2e
```

---

## Mocking Strategy

### Backend Mocking
- **Repository Layer**: All service tests mock their repository dependencies using `vi.fn()`.
- **External Services**: Cloudinary, Groq/Gemini/Ollama providers, and MongoDB are mocked to avoid external dependencies in CI.
- **Domain Event Bus**: Mocked to prevent side effects during tests.
- **Auth Middleware**: Mocked in integration tests to inject a test user without real JWT verification.

### Frontend Mocking
- **Zustand Stores**: Direct `setState` manipulation for deterministic test state.
- **React Query**: Wrapped with `QueryClientProvider` using `retry: false`.
- **Socket.IO**: Mocked at the module level — `socket.on/off` are vi.fn() stubs.
- **API Client**: Axios instance mocked per-test to return controlled responses.

---

## CI/CD Pipeline

The `.github/workflows/ci.yml` pipeline runs 5 sequential/parallel jobs:

1. **Lint & TypeCheck** — ESLint + `tsc --noEmit` (both server and client)
2. **Backend Tests** — `npm run test:coverage` with 90% gate
3. **Frontend Tests** — `npm run test:coverage` with 80% gate
4. **Playwright E2E** — Full browser tests against live dev servers
5. **Build Verification** — `npm run build` for both server (tsc) and client (vite)

**Failure Policy**: Any job failure blocks merge to `main` or `develop`.

---

## Architecture Validation

- **Circular Dependency Detection**: Monitor import chains to prevent circular references between services.
- **Dead Code Detection**: Coverage reports identify unreached branches.
- **Boundary Enforcement**: Services must not directly import from other feature modules — use the event bus for cross-domain communication.
