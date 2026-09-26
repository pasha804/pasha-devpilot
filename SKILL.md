---
name: devpilot
description: >
  Pasha DevPilot — AI-powered SDLC automation running on top of IBM Bob.
  Triggers when the user wants to analyze a codebase, find bugs, create a fix plan,
  run sandbox verification, generate a pull request, or search code symbols.
  Use when phrases like "analyze my repo", "find bugs", "fix this bug", "create a
  fix plan", "run DevPilot", "verify my code", "generate a PR", "search symbols",
  "engineering report", or "run tests" appear.
---

# DevPilot Skill — IBM Bob Extension

## What This Skill Does

Pasha DevPilot is an IBM Bob extension that adds **four capabilities Bob doesn't have natively**:

1. **AST-Level Code Analysis** — Python/TypeScript symbol parsing, 20-section engineering report, sensitive-file shield.
2. **Isolated Sandbox Execution** — Runs `pytest`, `npm test`, `tsc`, `eslint` in a directory-jailed subprocess with command allowlisting and timeout enforcement.
3. **Bounded Self-Healing** — If tests fail after an AI-generated patch, DevPilot diagnoses the traceback and retries up to 3 times before stopping safely.
4. **Truthful PR Engine** — Creates a clean Git branch, writes conventional commits, generates a pull request body with real verification evidence (no fabricated URLs).

## Workflow (mirrors Bob's Plan → Approve → Implement)

```
Bob Plan mode → DevPilot UNDERSTANDING → INVESTIGATING → PLANNING
                → WAITING_FOR_APPROVAL (human gate)
                → IMPLEMENTING (sandbox) → VERIFYING (pytest/npm test)
                → READY_TO_SHIP → PR created
```

## API Endpoints (DevPilot backend must be running on port 8000)

| Action | Method | Endpoint |
|--------|--------|----------|
| List repositories | GET | `/repositories` |
| Connect a repository | POST | `/repositories` |
| Analyze repository (20-section report) | POST | `/repositories/{id}/analyze` |
| Search code symbols | POST | `/repositories/{id}/search` |
| Create a task | POST | `/tasks` |
| Get task state | GET | `/tasks/{id}` |
| Run investigation + plan | POST | `/tasks/{id}/investigate` |
| Approve plan | POST | `/tasks/{id}/approve` |
| Run sandbox verification | POST | `/tasks/{id}/verify` |
| Create pull request | POST | `/tasks/{id}/pull-request` |
| Stream task events (SSE) | GET | `/tasks/{id}/events` |
| Health check | GET | `/health` |

## How Bob Should Use This Skill

### Analyzing a repository

When the user asks to analyze their codebase or find issues:

1. Call `GET /repositories` to list connected repos.
2. If none found, call `POST /repositories` with `{"name": "<repo_name>", "local_path": "<path>"}`.
3. Call `POST /repositories/{id}/analyze` — returns a 20-section `RepositoryAnalysisReport` with severity-ranked findings.
4. Present the findings to the user. Each finding has: `id`, `severity`, `category`, `title`, `file`, `line`, `why_it_matters`, `suggested_improvement`, `confidence`.

### Creating and running a fix task

When the user wants to fix a bug or implement a feature:

1. Call `POST /tasks` with `{"title": "<task title>", "description": "<description>", "repository_id": "<id>"}`.
2. Call `POST /tasks/{id}/investigate` — DevPilot enters UNDERSTANDING → INVESTIGATING → PLANNING.
3. Stream events from `GET /tasks/{id}/events` and show the user the live pipeline state.
4. When state reaches `WAITING_FOR_APPROVAL`, present the plan to the user and ask: *"DevPilot has prepared an implementation plan. Do you want to approve it?"*
5. On user approval, call `POST /tasks/{id}/approve`.
6. DevPilot enters IMPLEMENTING → VERIFYING (runs real tests in sandbox).
7. When state reaches `READY_TO_SHIP`, call `POST /tasks/{id}/pull-request` to generate the PR.

### Searching code

When the user asks "where is X defined" or "find all uses of Y":

```
POST /repositories/{id}/search
{"query": "<user query>", "search_type": "semantic", "limit": 10}
```

Returns ranked `CodeMatch` objects with `file_path`, `line_number`, `snippet`, `score`.

## Environment

DevPilot backend defaults to `http://localhost:8000`.
Set `DEVPILOT_API_URL` in your environment to override for cloud deployments.

## Security Notes

- DevPilot never executes destructive commands (`rm -rf`, `git clean`, `git push --force`).
- DevPilot never reads `.env`, `.pem`, `.key`, or credential files into AI context.
- Every significant action is recorded in the audit log.
- The Human-in-the-Loop gate is mandatory — DevPilot cannot modify code without explicit user approval.
