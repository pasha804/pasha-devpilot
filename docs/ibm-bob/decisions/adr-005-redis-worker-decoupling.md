# ADR-005: Decoupled Redis Worker for Long-Running Agent Tasks

## Status
Accepted

## Context
Repository indexing, AST parsing, AI code synthesis, test execution, and git operations are long-running I/O and compute intensive processes. Running them synchronously inside FastAPI HTTP request-response cycles triggers HTTP timeouts, blocks worker threads, and degrades API responsiveness.

## Decision
1. Introduce a Redis-backed job queue (`apps/worker/queue.py`) using Redis list primitives and async streams.
2. Build a standalone worker daemon (`apps/worker/worker.py`) that consumes jobs (`investigate_task`, `execute_task`, `index_repo`, `scan_repo`).
3. For environments where Redis is not configured (e.g. single-container local test environments), provide an automatic fallback to FastAPI's in-process `BackgroundTasks`.

## Consequences
- Fast HTTP responses (202 Accepted) for task creation and triggering.
- Railway deployment can scale `api` and `worker` instances independently.
- Resilient recovery: jobs remain in the queue if an API instance restarts.
