# AGENTS.md — Pasha DevPilot Agent Context

## Project Summary

**Pasha DevPilot** is a production-grade AI software engineering platform built as an **IBM Bob extension**.  
IBM Bob is the primary AI provider powering every stage of the DevPilot SDLC pipeline via `BobProvider`.

## Tech Stack

| Layer | Technology |
|---|---|
| Primary AI | IBM Bob (`BobProvider`, `bob-code-plus` model) |
| Fallback AI | DeepSeek V4 Flash via CleanAPIs, Groq llama-3.3-70b-versatile |
| Backend | FastAPI 0.100+, SQLAlchemy Async, SQLite/PostgreSQL, Python 3.11+ |
| Frontend | Next.js 15 App Router, TypeScript, Tailwind CSS, Monaco Editor |
| Agent Core | Custom 7-state orchestrator (`packages/agent_core/`) |
| Sandbox | Restricted execution engine with command allowlisting |
| Auth | JWT + GitHub OAuth (zero PAT flow) |

## Repository Layout

```
/
├── SKILL.md                          IBM Bob marketplace skill
├── AGENTS.md                         ← this file
├── README.md                         Full project documentation
├── HACKATHON_GUIDE.md                Demo video script + deployment guide
├── .env.example                      Environment variable template
├── apps/
│   ├── api/                          FastAPI backend
│   │   ├── core/config.py            Settings (BOB_API_KEY, BOB_BASE_URL, BOB_MODEL)
│   │   ├── core/security.py          JWT auth, secret masking
│   │   ├── main.py                   App factory, CORS, error handling
│   │   ├── routes/                   API route handlers
│   │   ├── services/sandbox_service.py  Execution sandbox (command allowlist)
│   │   ├── Dockerfile                Production container
│   │   └── tests/                    Integration test suite
│   └── web/                          Next.js 15 frontend
│       └── src/
│           ├── app/                  Pages: dashboard, tasks, repos, PRs, settings
│           └── components/           DiffViewer, PipelineVisualizer, Monaco Editor
└── packages/
    └── agent_core/
        ├── providers/
        │   ├── bob_provider.py       IBM Bob integration (PRIMARY)
        │   ├── router.py             ModelRouter — auto-selects Bob when BOB_API_KEY set
        │   ├── deepseek_provider.py  Fallback provider
        │   ├── groq_provider.py      Verification fallback
        │   └── base.py               BaseAIProvider contract
        └── orchestrator/
            ├── orchestrator.py       7-state async execution machine
            └── state_machine.py      State transitions & event bus
```

## IBM Bob Integration

`BobProvider` (`packages/agent_core/providers/bob_provider.py`) extends `CleanAPIsProvider` and injects a DevPilot SDLC system preamble into every call.  
`ModelRouter.get_development_provider()` automatically selects Bob when `BOB_API_KEY` is set in the environment.

### Environment Variables for Bob

```env
BOB_API_KEY=<your IBM Bob API key>
BOB_BASE_URL=https://api.bob.ibm.com/v1
BOB_MODEL=bob-code-plus
```

## Agent Pipeline States

The orchestrator drives a 7-state machine. Bob operates in all active states:

1. `UNDERSTANDING` — parse repository file tree, extract AST symbols
2. `INVESTIGATING` — generate 20-section engineering report with findings
3. `PLANNING` — produce step-by-step implementation plan
4. `WAITING_FOR_APPROVAL` — present plan, wait for human approval gate (**human must approve**)
5. `IMPLEMENTING` — apply unified diffs in isolated sandbox
6. `VERIFYING` — run test suite, diagnose failures, self-heal (max 3 attempts)
7. `REVIEWING` — serve Monaco diff workspace, answer dev questions about changes

## Security Model

- **No code changes without explicit human approval** at `WAITING_FOR_APPROVAL` gate.
- Sandbox blocks: `rm`, `del`, `shutdown`, `curl | bash`, `git push --force`, `git clean -f`, `git rm -rf`.
- Only approved test binaries execute: `pytest`, `npm test`, `jest`, `vitest`, `cargo test`, `go test`.
- Directory traversal (`../`) and paths outside sandbox root are blocked.
- API tokens (`ghp_*`, `sk-*`, `cc_*`) are automatically masked in all UI output.

## Key Files to Read Before Editing

| File | Purpose |
|---|---|
| `apps/api/core/config.py` | All environment settings including `BOB_API_KEY` |
| `packages/agent_core/providers/bob_provider.py` | Bob integration |
| `packages/agent_core/providers/router.py` | Provider selection logic |
| `packages/agent_core/orchestrator/orchestrator.py` | Main execution loop |
| `apps/api/services/sandbox_service.py` | Sandbox security (blocked commands) |
| `apps/api/main.py` | FastAPI app factory (CORS, auth middleware) |

## Development Notes

- Run API: `python -m uvicorn apps.api.main:app --host 0.0.0.0 --port 8000 --reload`
- Run frontend: `cd apps/web && npm run dev`
- Run tests: `python -m pytest apps/api/tests/test_devpilot_core.py -v`
- Windows one-shot: `start.bat` (starts both API and frontend)
- Docker: `docker build -t pasha-devpilot-api -f apps/api/Dockerfile . && docker run -p 8000:8000 --env-file .env pasha-devpilot-api`
