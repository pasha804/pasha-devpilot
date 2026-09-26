# Pasha DevPilot — Current Architecture State

> Audited: September 2026 — Comprehensive Inspection Report
> Product: Pasha DevPilot ("Your AI Software Engineer")

---

## 1. Executive Summary

Pasha DevPilot is an autonomous software engineering platform designed to understand codebases, formulate rigorous step-by-step engineering plans, execute targeted patches with human-in-the-loop approval, run automated test verification in an isolated sandbox, and open truthful GitHub Pull Requests.

---

## 2. Directory & Component Inventory

```
e:\Pasha-devpolit\
├── .env                              ← Local environment configuration (gitignored)
├── .env.example                      ← Sanitized environment template
├── .gitignore                        ← Excludes .env, *.db, *.pem, *.key, node_modules, etc.
├── AGENTS.md                         ← Pasha DevPilot agent system context
├── ARCHITECTURE.md                   ← Architectural blueprints & flow diagrams
├── DEMO_SCRIPT.md                    ← Product walkthrough script
├── HACKATHON_GUIDE.md                ← Hackathon submission & deployment instructions
├── Procfile                          ← Process definitions (web, worker)
├── README.md                         ← Project README
├── SKILL.md                          ← IBM Bob marketplace skill specification
├── docker-compose.yml                ← Multi-service local composition (postgres, redis, api, web)
├── railway.toml                      ← Railway deployment configuration
├── start.bat / stop.bat              ← Windows orchestration scripts
├── apps/
│   ├── api/                          ← FastAPI backend service
│   │   ├── core/
│   │   │   ├── config.py             ← Pydantic BaseSettings (GitHub, DB, Redis, AI)
│   │   │   ├── database.py           ← Async SQLAlchemy engine (Postgres/SQLite)
│   │   │   ├── security.py           ← JWT issuing/decoding, token hashing, secret masking
│   │   │   └── audit.py              ← Immutable audit log recorder
│   │   ├── models/                   ← SQLAlchemy ORM models
│   │   │   ├── user.py               ← User, Workspace, WorkspaceMember, Session
│   │   │   ├── repository.py         ← Project, Repository, RepositoryFile, RepositorySymbol, ProjectMemory, Integration
│   │   │   └── task.py               ← Task, TaskStep, AgentRun, ToolCall, FileChange, VerificationRun, PullRequest, AuditLog, UsageRecord
│   │   ├── routes/
│   │   │   ├── auth_routes.py        ← GitHub OAuth & Token endpoints
│   │   │   ├── repo_routes.py        ← Repo discovery, selection, AST file tree, search, diagnostics
│   │   │   ├── task_routes.py        ← Task CRUD, plan approval gate, state transitions
│   │   │   ├── agent_routes.py       ← Investigation, execution, and self-healing engine
│   │   │   ├── verification_routes.py← Test runner execution
│   │   │   ├── pr_routes.py          ← Pull Request generation
│   │   │   ├── events_routes.py      ← Real-time SSE streaming endpoint
│   │   │   └── settings_routes.py    ← Configuration, memory, and telemetry
│   │   ├── schemas/                  ← Pydantic request/response models
│   │   ├── services/
│   │   │   ├── analyzer_service.py   ← 20-section engineering report generator
│   │   │   ├── context_engine.py     ← Relevant context assembly engine
│   │   │   ├── event_bus.py          ← Async event publishing and SSE streaming
│   │   │   ├── git_workflow_service.py← Branching, conventional commits, PR generation
│   │   │   ├── github_service.py     ← GitHub REST API v3 client
│   │   │   ├── indexer_service.py    ← AST symbol extraction & file indexing
│   │   │   ├── sandbox_service.py    ← Subprocess sandbox jail with blocked command filtering
│   │   │   ├── search_service.py     ← Exact and semantic code search
│   │   │   └── verification_service.py← Automated test runner detector
│   │   ├── tests/                    ← Pytest test suite (10 core tests passing)
│   │   └── Dockerfile                ← API container definition
│   └── web/                          ← Next.js 15 App Router Frontend
│       ├── src/
│       │   ├── app/
│       │   │   ├── page.tsx          ← Landing page with interactive walkthrough
│       │   │   ├── dashboard/        ← Metric telemetry, active tasks, work done
│       │   │   ├── repositories/     ← GitHub repository discovery and picker
│       │   │   ├── tasks/            ← Task list and task workspace ([id])
│       │   │   ├── pull-requests/    ← Pull Request tracking
│       │   │   ├── settings/         ← Platform configuration & memory
│       │   │   └── auth/callback/    ← GitHub OAuth callback handler
│       │   ├── components/           ← UI components (DiffViewer, Monaco, PipelineVisualizer, etc.)
│       │   └── lib/api.ts            ← Typed API client
│       └── Dockerfile                ← Standalone Next.js container
├── packages/
│   └── agent_core/                   ← Reusable Agent Engine
│       ├── orchestrator/             ← 7-state async machine & prompts
│       ├── providers/                ← ModelRouter (Bob, DeepSeek, Groq, OpenAI, Anthropic)
│       └── tools/                    ← Read, write, git, test execution tools
└── demo-repo/                        ← Seeded isolated testbed with pytest suite
```

---

## 3. Technology Stack & Current Infrastructure State

| Component | Current Technology | Current Implementation State |
|---|---|---|
| **Frontend** | Next.js 16.3 (React 19, Tailwind CSS v4, Monaco) | Fully builds and renders dashboard, repo picker, task workspace, diffs, PRs |
| **Backend** | FastAPI 0.135.1, Python 3.14 | Async ASGI application with route splitting, CORS, lifespan management |
| **Database** | SQLite local (`pasha_devpilot.db`), asyncpg ready | Async SQLAlchemy 2.0 with complete relational schema covering all 19 entities |
| **Authentication** | JWT (`HS256`), GitHub OAuth 2.0, PAT | Server-side token exchange, user/workspace provisioning, session hashing |
| **Queue / Worker** | FastAPI `BackgroundTasks` in-process | BackgroundTasks dispatching long jobs; Redis queue and dedicated worker pending |
| **AI Providers** | IBM Bob (`BobProvider`), DeepSeek V4 Flash, Groq | ModelRouter dynamically routes calls based on active environment API keys |
| **Sandbox & Security** | Subprocess execution jail (`ExecutionSandbox`) | Strict blocked commands (`rm`, `curl \| bash`, force pushes), path containment |
| **CLI Status** | GitHub CLI & Railway CLI logged in (`pasha804` / `arianpasha0@gmail.com`) | Authenticated and ready for remote operations |

---

## 4. Current Gaps & Opportunities Identified

1. **GitHub Remote Push in PR Flow**:
   - `GitWorkflowService.prepare_and_create_pr` creates local branch and commit, but needs to push the branch to remote GitHub (`git push -u origin branch`) using the authenticated user token before opening the GitHub PR.
2. **Dedicated Background Worker**:
   - Background tasks currently run inside FastAPI's event loop via `BackgroundTasks`. A standalone Railway worker service communicating over Redis queue will provide true multi-service separation.
3. **Explicit Auth Routes & Disconnect**:
   - Implement `GET /api/auth/github` (redirecting or returning authorize URL with CSRF state), `GET /api/auth/github/callback`, `POST /api/auth/logout`, `POST /api/auth/github/disconnect`, and `/auth` page.
4. **Real Verification Output in Frontend**:
   - In `apps/web/src/app/tasks/[id]/page.tsx`, replace the fallback verification snippet with live verification test output and exit code from backend verification runs.
5. **Missing Import in `agent_routes.py`**:
   - Line 241 references `AgentMessage` which needs to be imported from `packages.agent_core.providers.base`.
6. **Alembic Database Migrations**:
   - Initialize Alembic migrations for repeatable PostgreSQL schema versioning.
7. **IBM Bob Hackathon Documentation**:
   - Create `/docs/ibm-bob/` documenting the actual Bob session history, development logs, and engineering decisions.
