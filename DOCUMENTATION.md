# Pasha DevPilot — Technical Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [High-Level Architecture](#high-level-architecture)
3. [The 7-State Orchestrator](#the-7-state-orchestrator)
4. [AI Provider Routing & IBM Bob Integration](#ai-provider-routing--ibm-bob-integration)
5. [Execution Sandbox & Security Jail](#execution-sandbox--security-jail)
6. [API Reference](#api-reference)
7. [Frontend Architecture](#frontend-architecture)
8. [Database Schema & Models](#database-schema--models)
9. [Deployment & Operations](#deployment--operations)

---

## 1. System Overview

**Pasha DevPilot** is an autonomous software engineering agent built as a native **IBM Bob extension**. It bridges the divide between conversational AI code generation and automated software delivery by coupling an LLM reasoning engine with:
- Abstract Syntax Tree (AST) structural symbol analysis.
- An execution sandbox enforcing rigorous command allowlisting.
- A deterministic 7-stage finite state machine.
- An automated self-healing test loop.
- Seamless GitHub repository management and Pull Request authoring.

---

## 2. High-Level Architecture

```
+-------------------------------------------------------------------------+
|                         Next.js 15 Client Web UI                        |
|  - Dashboard (`/dashboard`)           - Repositories (`/repositories`)  |
|  - Task Runner (`/tasks/[id]`)        - Pull Requests (`/pull-requests`)|
|  - Monaco Diff Editor                 - Real-time State Visualizer      |
+------------------------------------+------------------------------------+
                                     | JSON / SSE / REST
                                     v
+-------------------------------------------------------------------------+
|                           FastAPI Backend Core                          |
|  - `apps/api/main.py`: CORS, Lifespan, Auth Middleware                  |
|  - `apps/api/routes/`:                                                  |
|     * `auth_routes.py`: GitHub OAuth & JWT Session Handler              |
|     * `repo_routes.py`: Repository Sync & AST Cache                     |
|     * `task_routes.py`: 7-State Execution Trigger                       |
|     * `agent_routes.py`: Provider Health & Diagnostic Telemetry         |
+------------------+----------------------------------+-------------------+
                   |                                  |
                   v                                  v
+------------------------------------+  +---------------------------------+
|     `packages/agent_core/`         |  |   Sandbox Execution Engine      |
|  - `orchestrator/orchestrator.py`  |  |  `apps/api/services/sandbox_    |
|  - `orchestrator/state_machine.py` |  |   service.py`                   |
|  - `providers/bob_provider.py`     |  |  - Process Isolation            |
|  - `providers/router.py`           |  |  - Command Allowlist            |
|  - `providers/deepseek_provider.py`|  |  - Path Traversal Block         |
|  - `providers/groq_provider.py`    |  |  - Secret Masking Engine        |
+------------------+-----------------+  +---------------------------------+
                   |
                   v
+-------------------------------------------------------------------------+
|                           AI Intelligence Layer                         |
|   - PRIMARY: IBM Bob (`bob-code-plus`) via CleanAPIs Gateway            |
|   - FALLBACK: DeepSeek V4 Flash / Groq llama-3.3-70b-versatile          |
+-------------------------------------------------------------------------+
```

---

## 3. The 7-State Orchestrator

The core execution engine is governed by `packages/agent_core/orchestrator/orchestrator.py`. Every engineering job progresses through a linear 7-state finite state machine:

```
[1. UNDERSTANDING] ➔ [2. INVESTIGATING] ➔ [3. PLANNING]
                                                 |
                                                 v
[5. IMPLEMENTING] 🠔 [4. WAITING_FOR_APPROVAL (GATE)]
       |
       v
[6. VERIFYING] ──(Tests Fail, Retries < 3)──➔ (Self-Heal Loop)
       |
       v (Tests Green)
[7. REVIEWING / READY_TO_SHIP] ➔ [GitHub PR Created]
```

### State Breakdown

1. **`UNDERSTANDING`**:
   - Clones target repo into sandbox directory `temp_sandboxes/{task_id}`.
   - Parses AST using `ast` module (Python) or regex tree (TypeScript/JS).
   - Generates an in-memory symbol graph containing classes, functions, and import paths.

2. **`INVESTIGATING`**:
   - Executes the existing test harness (`pytest`, `npm test`) to reproduce failures.
   - Captures stderr and tracebacks.
   - Formulates root-cause hypothesis using IBM Bob.

3. **`PLANNING`**:
   - IBM Bob synthesizes a structured step-by-step engineering plan.
   - Includes files to modify, changes required, and regression risk assessment.

4. **`WAITING_FOR_APPROVAL`**:
   - The engine halts execution.
   - Emits SSE state update to UI.
   - The user must explicitly click **"Approve Plan"** via `POST /api/v1/tasks/{id}/approve` to proceed. No code is modified without this approval.

5. **`IMPLEMENTING`**:
   - IBM Bob generates unified diff chunks.
   - The diff patcher validates line numbers and replaces code in the isolated sandbox files.

6. **`VERIFYING`**:
   - The sandbox executes the test binary (`pytest -v`).
   - If tests fail, the error is fed back into IBM Bob to auto-heal the patch (up to 3 retry attempts).
   - If tests pass (exit code 0), task proceeds to State 7.

7. **`REVIEWING` / `READY_TO_SHIP`**:
   - Produces Monaco unified diff representation.
   - Upon developer confirmation, pushes the verified commit to GitHub and opens a Pull Request.

---

## 4. AI Provider Routing & IBM Bob Integration

DevPilot uses a decoupled provider architecture under `packages/agent_core/providers/`:

```python
# packages/agent_core/providers/router.py
class ModelRouter:
    @classmethod
    def get_development_provider(cls) -> BaseAIProvider:
        if os.getenv("BOB_API_KEY"):
            return BobProvider() # PRIMARY: IBM Bob
        if os.getenv("GROQ_API_KEY"):
            return GroqProvider() # Verification Fallback
        return DeepSeekProvider() # Default CleanAPIs Fallback
```

### `BobProvider` Specification (`bob_provider.py`)
- Inherits from `CleanAPIsProvider`.
- Pre-injects the DevPilot SDLC system prompt into all conversations:
  ```text
  You are Pasha DevPilot powered by IBM Bob.
  You act as a senior staff software engineer.
  Rules:
  1. Produce unified diffs with exact line ranges.
  2. Never emit hypothetical syntax.
  3. Ensure all tests in the sandbox pass cleanly.
  ```
- Uses model `bob-code-plus` via `https://api.bob.ibm.com/v1`.

---

## 5. Execution Sandbox & Security Jail

The execution sandbox (`apps/api/services/sandbox_service.py`) protects the host machine:

### 5.1 Command Allowlist
Only explicitly permitted binaries can be run:
- **Python:** `pytest`, `python -m pytest`, `python -m unittest`, `pip list`
- **Node.js:** `npm test`, `npx vitest`, `npx jest`, `npm run build`
- **Git:** `git status`, `git diff`, `git log`, `git checkout`, `git add`, `git commit`, `git push` (safe commands only)

### 5.2 Blocked Commands & Patterns
Any execution matching the following triggers an immediate `SecurityException`:
- Dangerous shell commands: `rm -rf`, `del`, `format`, `shutdown`, `curl | bash`, `wget | sh`
- Dangerous git operations: `git push --force`, `git clean -f`, `git reset --hard`
- Path traversal sequences: `../`, `..\\`, absolute paths pointing outside sandbox jail.

### 5.3 Secret Masking
All stdout, stderr, and network payloads pass through the secret masker:
- `ghp_[A-Za-z0-9]{36}` ➔ `[REDACTED_GITHUB_TOKEN]`
- `sk-[A-Za-z0-9]{32,}` ➔ `[REDACTED_API_KEY]`
- `eyJ...` (JWT tokens) ➔ `[REDACTED_JWT_TOKEN]`

---

## 6. API Reference

### Health & Agent Telemetry
- `GET /api/v1/health`  
  Returns system status, active database, and AI provider status.
- `GET /api/v1/agent/status`  
  Returns active provider (`BobProvider`), model name, and sandbox jail state.

### Repositories
- `GET /api/v1/repos`  
  Lists all connected repositories with branch and language metadata.
- `POST /api/v1/repos/sync`  
  Syncs repository list from authenticated GitHub account.
- `GET /api/v1/repos/{id}/scan`  
  Initiates AST symbol scan and returns detected files and dependencies.

### Tasks & Orchestrator
- `POST /api/v1/tasks`  
  Creates a new autonomous engineering task.  
  *Payload:* `{"repo_id": "...", "prompt": "Fix token expiration bug", "branch": "main"}`
- `GET /api/v1/tasks/{id}`  
  Returns current state, engineering report, plan, and diffs.
- `POST /api/v1/tasks/{id}/approve`  
  Approves the plan at State 4 and triggers State 5 (`IMPLEMENTING`).
- `POST /api/v1/tasks/{id}/ship`  
  Commits verified changes, pushes branch to GitHub, and opens a Pull Request.

---

## 7. Frontend Architecture

The frontend is built with **Next.js 15 (App Router)** and **Tailwind CSS**:
- **`src/app/dashboard/page.tsx`**: System health metrics, recent tasks, and activity telemetry.
- **`src/app/repositories/page.tsx`**: Interactive repository grid with GitHub sync and AST scanning.
- **`src/app/tasks/[id]/page.tsx`**: The main command center featuring:
  - **Pipeline Visualizer**: Real-time 7-state glowing stepper.
  - **Approval Modal**: Interactive plan inspection & approval gate.
  - **Live Terminal Feed**: Streaming pytest logs and self-healing iterations.
  - **Monaco Diff Viewer**: Full syntax-highlighted side-by-side patch viewer.
- **`src/app/pull-requests/page.tsx`**: Live PR dashboard tracking branches, review status, and direct GitHub links.

---

## 8. Database Schema & Models

Implemented using **SQLAlchemy Async** supporting SQLite and PostgreSQL:

```
+--------------------+       +--------------------+       +--------------------+
|       Users        |       |    Repositories    |       |       Tasks        |
+--------------------+       +--------------------+       +--------------------+
| id (PK)            | 1   * | id (PK)            | 1   * | id (PK)            |
| github_id          |-------| user_id (FK)       |-------| repo_id (FK)       |
| username           |       | name               |       | current_state      |
| email              |       | full_name          |       | prompt             |
| avatar_url         |       | default_branch     |       | plan_json          |
| access_token (enc) |       | is_private         |       | diff_content       |
+--------------------+       +--------------------+       | test_output        |
                                                          | pull_request_url   |
                                                          +--------------------+
```

---

## 9. Deployment & Operations

### Local Execution (Windows)
```powershell
.\start.bat
```
Starts FastAPI on port `8000` and Next.js on port `3000`.

### Production Docker Container
```bash
docker build -t pasha-devpilot-api -f apps/api/Dockerfile .
docker run -p 8000:8000 --env-file .env pasha-devpilot-api
```

### Production Deployment (Railway)
- **Frontend URL:** `https://web-production-787ab.up.railway.app`
- **Backend API URL:** `https://api-production-508f.up.railway.app`
- **Redis Worker:** Handles async event queues and cross-container state broadcasting.
