# Pasha DevPilot — Master Architectural Plan

## 1. System Overview

**Pasha DevPilot** is a production-grade AI software engineering platform with real repository indexing, multi-strategy code search, context ranking, deterministic agent orchestration, human-in-the-loop approval, isolated verification sandbox, and automated pull request generation.

```
+----------------------------------------------------------------------------------------------------+
|                                      PASHA DEVPILOT MONOREPO                                       |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|  apps/web (Next.js 14+ App Router, TypeScript, Tailwind CSS, Monaco Editor, Framer Motion)        |
|  |-- / (Marketing & Live Demo Sandbox)                                                             |
|  |-- /dashboard (Connected repos, active runs, stats, recent activity)                             |
|  |-- /repositories & /repositories/[id] (File tree, framework badges, code search, symbol index)  |
|  |-- /tasks & /tasks/[id] (Agent workflow, live SSE stream, approval gates, Monaco diff, PR prep)  |
|  |-- /pull-requests (Generated PRs, verification audits, GitHub sync)                              |
|  \-- /settings (AI provider keys, GitHub tokens, sandbox parameters, project memories)             |
|                                                                                                    |
|  apps/api (FastAPI, Python 3.14/3.11+, SQLAlchemy async, SQLite/PostgreSQL, Redis/In-Memory Queue)  |
|  |-- core/ (config, security, database session, audit logging, exceptions)                         |
|  |-- models/ (SQLAlchemy models: User, Repo, Task, Step, ToolCall, Diff, Verification, PR)        |
|  |-- services/                                                                                     |
|  |   |-- github_service.py (OAuth, repos, branch, commit, PR creation)                             |
|  |   |-- indexer_service.py (tree walker, language/framework detection, secret exclusion)          |
|  |   |-- search_service.py (exact grep, symbol parser, semantic search)                            |
|  |   |-- context_engine.py (task classifier, relevance ranker, token budgeter)                     |
|  |   |-- sandbox_service.py (safe execution sandbox, allowlisted commands, timeout limits)         |
|  |   |-- verification_service.py (auto-detect pytest/npm test/ruff/eslint, self-healing loop)      |
|  |   \-- git_workflow_service.py (branch management, commit authoring, PR markdown generation)     |
|  \-- routes/ (auth, repos, tasks, agent, verification, prs, events SSE, settings)                  |
|                                                                                                    |
|  packages/agent-core (Python & shared specs)                                                       |
|  |-- providers/ (BaseAIProvider, AnthropicProvider, OpenAIProvider, GeminiProvider, LocalMock)     |
|  |-- tools/ (typed tool registry: read_file, edit_file, run_test, create_pr, etc. + permissions)    |
|  \-- orchestrator/ (deterministic state machine, retry loop, approval checkpoint, audit logger)   |
|                                                                                                    |
|  demo-repo/ (Controlled testbed repository with seeded bugs and test suite for live tasks)          |
|  docs/ (README.md, ARCHITECTURE.md, API.md, AGENT.md, SECURITY.md, DEPLOYMENT.md, THREAT_MODEL.md) |
+----------------------------------------------------------------------------------------------------+
```

---

## 2. Core Execution Phases

- **Phase 0: Workspace & Monorepo Setup**: Root structure, Next.js app initialization, FastAPI backend initialization, package configs, environment files, lint/build scripts.
- **Phase 1: Authentication & GitHub Service**: Real GitHub OAuth + Mock/Developer flow for zero-friction local testing; Repo listing and sync.
- **Phase 2: Repository Intelligence**: File tree indexing, secret exclusion filter, framework/dependency detection, AST symbol indexing, multi-mode code search (Exact, Symbol, Semantic Intent).
- **Phase 3: AI Provider Abstraction & Agent Orchestration**: Multi-provider interface (Gemini, OpenAI, Anthropic, Mock), Typed Tool registry with 4-tier permission gates (`READ`, `WRITE`, `EXTERNAL`, `DESTRUCTIVE`), deterministic agent state machine.
- **Phase 4: Code Modification & Monaco Diff Engine**: Targeted diff generation, file patch application, rollback mechanism, Monaco diff viewer component.
- **Phase 5: Sandbox & Verification Engine**: Command allowlisting, timeout enforcement, automated test runner detection (`pytest`, `npm test`, `ruff`, `eslint`), bounded self-healing retry loop (max 3 attempts).
- **Phase 6: Git Workflow & Pull Request Automation**: Branch creation (`devpilot/task/<id>`), commit creation, PR summary builder, GitHub PR creation.
- **Phase 7: Premium Developer Workstation UI**: Modern dark-mode UI with high information density, real-time SSE streaming for agent events, Monaco code editor, interactive approval modals, Command Palette (`Ctrl+K`).
- **Phase 8: Controlled Demo Repository, Tests, Hardening & Docs**: Built-in testbed repo with seeded bugs, backend unit/integration tests, end-to-end verification, architecture and security documentation.
