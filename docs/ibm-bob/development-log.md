# IBM Bob Development Log

> **Project:** Pasha DevPilot — "Your AI Software Engineer."  
> **Topic:** Chronological Engineering Log, Debugging, and System Audits  

---

## Log Entry 01 — Core Architecture & Data Modeling
- **Focus:** System design and database schema.
- **Assisted by:** IBM Bob IDE.
- **Implementation:**
  - Designed SQLAlchemy models mapping users, workspaces, repositories, tasks, task steps, agent runs, and pull requests.
  - Implemented async database session factory supporting SQLite (development) and PostgreSQL (production).
  - Defined FastAPI application factory in `apps/api/main.py` with custom error handlers, CORS configuration, and lifespan startup verification.

---

## Log Entry 02 — 7-State Orchestrator & Safety Gate
- **Focus:** Building the agent execution machine.
- **Assisted by:** IBM Bob IDE.
- **Implementation:**
  - Implemented the 7-state machine: `UNDERSTANDING` ➔ `INVESTIGATING` ➔ `PLANNING` ➔ `WAITING_FOR_APPROVAL` ➔ `IMPLEMENTING` ➔ `VERIFYING` ➔ `REVIEWING`.
  - Added an immutable human-in-the-loop gate at `WAITING_FOR_APPROVAL`: the agent cannot modify files or execute writes without an explicit approval signal.
  - Built streaming event bus emitting state transitions and logs to connected clients via SSE.

---

## Log Entry 03 — Execution Sandbox Jail & Subprocess Security
- **Focus:** Isolating code execution and preventing arbitrary execution exploits.
- **Assisted by:** IBM Bob IDE.
- **Implementation:**
  - Enforced a directory traversal jail: operations attempting to escape repo workspace roots (`../`) are blocked with security errors.
  - Restricted subprocess commands to an approved binary allowlist (`pytest`, `npm test`, `jest`, `vitest`, `cargo test`, `go test`, `git status`, `git diff`).
  - Blocked destructive operations (`rm -rf`, `curl | bash`, `git push --force`, `git clean -f`).
  - Stripped environment secrets (`DATABASE_URL`, `SECRET_KEY`, `GITHUB_CLIENT_SECRET`, `BOB_API_KEY`) from test execution environments.

---

## Log Entry 04 — Repository Intelligence & AST Parser
- **Focus:** Eliminating context stuffing and hallucinated paths.
- **Assisted by:** IBM Bob IDE.
- **Implementation:**
  - Created `RepositoryIndexer` to parse repository file trees and extract AST function/class signatures.
  - Built `ContextEngine` and `CodeSearchService` to rank files relevant to specific tasks instead of passing the entire repo to the model context.
  - Implemented automated 20-section engineering report generator synthesizing dependencies, architecture, and suspected defect locations.

---

## Log Entry 05 — Production Hardening, Redis Decoupling & GitHub OAuth
- **Focus:** Multi-service Railway architecture and zero-mock production flows.
- **Implementation:**
  - Architected decoupled Redis queue (`apps/worker/queue.py`) and standalone background worker daemon (`apps/worker/worker.py`).
  - Upgraded GitHub OAuth flow with HMAC-SHA256 CSRF protection, secure HTTP-only cookies, and session invalidation.
  - Implemented real remote branch pushing and GitHub PR creation via authenticated token injection in `git_workflow_service.py`.
  - Built truthful verification UI in `tasks/[id]/page.tsx` displaying live exit codes, stdout, and execution duration.

---

## Log Entry 06 — Verification & Test Suite
- **Focus:** System test suite and build validation.
- **Outcomes:**
  - Python test suite passed 10/10 assertions (`apps/api/tests/test_devpilot_core.py`) verifying security tokens, AST indexing, sandbox isolation, orchestrator planning, PR generation, and routing.
  - Next.js 15 App Router production build succeeded with 0 TypeScript errors across all 11 static and dynamic routes.
