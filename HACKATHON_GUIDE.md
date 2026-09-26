# Pasha DevPilot — Hackathon Demonstration Guide

## Product Overview
- **Brand:** Pasha Dev
- **Product:** Pasha DevPilot
- **Tagline:** "Your AI Software Engineer — powered by IBM Bob."
- **Core Promise:** Understand. Analyze. Plan. Build. Verify. Review. Ship.
- **IBM Bob Integration:** `BobProvider` wraps IBM Bob's OpenAI-compatible API with a DevPilot SDLC system preamble. Set `BOB_API_KEY` in `.env` and the `ModelRouter` routes all AI calls through Bob automatically.
- **Technology Stack:**
  - **Primary AI:** IBM Bob (`BobProvider`) — SDLC-aware code comprehension, planning, generation, and verification.
  - **Fallback AI:** DeepSeek V4 Flash (`deepseek-v4-flash-0731`) / Groq (`llama-3.3-70b-versatile`)
  - **Repository Intelligence:** AST Python/TypeScript symbol parser, 20-section engineering report generator, sensitive file exclusion shield
  - **Orchestration:** Bounded self-healing execution loop (max 3 attempts), strict Human-in-the-Loop approval gate
  - **Execution Sandbox:** Isolated workspace with command allowlisting, path restriction, and timeout enforcement
  - **Review Workspace:** Monaco diff viewer with additions/deletions line badges, side-by-side/inline toggles, and per-file change summaries
  - **Git & PR Engine:** Truthful branch/commit/PR publishing (`devpilot/<task-slug>-<task-id>`), no fake URLs (`LOCAL_BRANCH_PREPARED` when remote token absent)
  - **Frontend:** Next.js 15 App Router, Tailwind CSS, Monaco Editor, Lucide Icons, SSE real-time streaming, Ctrl+K Command Palette
  - **Backend:** FastAPI, SQLAlchemy Async, SQLite/PostgreSQL, SSE Event Bus

---

## 3-Minute Winning Demo Video Script

### [0:00 - 0:20] Hook — IBM Bob as the Engine
- **Visual:** Pasha DevPilot landing page. Quick cut to `packages/agent_core/providers/bob_provider.py` showing `BobProvider` class, then `router.py` showing `BOB_API_KEY` priority check.
- **Voiceover:**
  > This is Pasha DevPilot — an end-to-end AI software engineering platform built as an IBM Bob extension.
  > Under the hood, IBM Bob drives every step: codebase analysis, implementation planning, code generation, and test verification.
  > DevPilot's `BobProvider` hooks into Bob's OpenAI-compatible API with a custom SDLC-aware system preamble, and the `ModelRouter` automatically routes all AI traffic through Bob the moment a `BOB_API_KEY` is set.
  > No configuration changes. Just set the key, and Bob runs the pipeline.

### [0:20 - 0:50] Problem Statement
- **Visual:** Pasha DevPilot Dashboard showing dark-first developer workstation and 9-step workflow diagram.
- **Voiceover:**
  > Every developer knows the frustration of AI code assistants that guess code without context, hallucinate files, break builds silently, or require pasting dangerous personal access tokens into random web forms.
  > DevPilot doesn't just guess code. It connects via zero-PAT GitHub OAuth, understands your codebase AST symbols, generates a 20-section engineering report, pauses for your approval, applies surgical patches in an isolated sandbox, truthfully verifies test suites with bounded self-healing, lets you review every line in a Monaco diff viewer, and ships clean Pull Requests — all driven by IBM Bob.

### [0:50 - 1:30] Zero-PAT GitHub Connect & Bob-Powered Engineering Report
- **Visual:** Navigate to Repositories → Connect GitHub → Select repository → Click "Analyze Repository".
- **Action:** Bob (via `BobProvider`) scans repository ASTs, identifies tech stack, detects sensitive files (`.env`, `credentials.json`) and shields them from AI context.
- **Voiceover:**
  > Notice the onboarding: zero PAT pasting. With one click, DevPilot loads accessible repositories.
  > When we select our repository and click 'Analyze Repository', IBM Bob activates in read-only mode.
  > Bob generates a comprehensive 20-Section Engineering Report: Architecture, Authentication, API Layer, Security, Performance, and pinpointed Findings with exact file, line, and evidence.
  > Here, Bob identifies an inverted expiration check: finding AUTH-002 in auth_service.py.

### [1:30 - 2:00] Human-in-the-Loop Approval Gate
- **Visual:** Click "Create Fix Plan" on finding AUTH-002.
- **Action:** Bob switches to Plan Mode reasoning and generates a step-by-step implementation plan.
- **Voiceover:**
  > We click 'Create Fix Plan'. IBM Bob formulates an implementation plan detailing objectives, affected files, expected changes, risks, and verification commands.
  > Crucially: Bob never touches code without explicit authorization. It stops at the Human Approval Gate.
  > We inspect the plan and click 'Approve Plan'.

### [2:00 - 2:40] Isolated Sandbox, Bounded Self-Healing & Monaco Diff Review
- **Visual:** Click "Approve Plan". State shifts to IMPLEMENTING. Verification terminal runs pytest. Tests pass.
- **Action:** Switch to "Review Workspace" tab. Inspect Monaco diff viewer with green additions and red deletions.
- **Voiceover:**
  > Bob enters its isolated sandbox. It applies targeted code modifications without touching the default branch.
  > The verification engine executes real pytest tests. If a test fails, Bob's bounded self-healing loop diagnoses the traceback and repairs it automatically — capped at 3 attempts.
  > In our dedicated Review Workspace, developers inspect the Monaco diff viewer with line numbers, side-by-side or inline view, and per-file change summaries. We can even ask Bob questions about the diff.

### [2:40 - 3:00] Safe Git Workflow & Truthful Pull Request Publishing
- **Visual:** Click "Approve & Ship". DevPilot validates the workspace, creates branch `devpilot/fix-auth-expiration`, makes a conventional commit, and prepares a Pull Request.
- **Voiceover:**
  > Happy with the diff, we click 'Approve & Ship'. Bob creates a clean branch, writes a conventional commit, and publishes a pull request complete with truthful verification results.
  > Pasha DevPilot, powered by IBM Bob: Understand. Analyze. Plan. Build. Verify. Review. Ship.

---

## IBM Bob Integration Details

### BobProvider Location
```
packages/agent_core/providers/bob_provider.py
```

### Enabling Bob
```env
# .env
BOB_API_KEY=your_ibm_bob_api_key_here
BOB_BASE_URL=https://api.bob.ibm.com/v1
BOB_MODEL=bob-code-plus
```

### Provider Auto-Selection Flow
```python
# packages/agent_core/providers/router.py — get_development_provider()
if bob_key:                  # BOB_API_KEY set → IBM Bob
    return BobProvider(...)
elif deepseek_key:           # fallback → DeepSeek
    return DeepSeekProvider(...)
else:                        # demo fallback → Mock
    return MockAIProvider(...)
```

### Pipeline State → Bob Role Mapping
| State | Bob Action |
|---|---|
| `UNDERSTANDING` | File tree & AST symbol comprehension |
| `INVESTIGATING` | 20-section engineering report generation |
| `PLANNING` | Step-by-step implementation plan (Plan mode) |
| `IMPLEMENTING` | Unified diff generation with tool use |
| `VERIFYING` | Test execution diagnosis & bounded self-healing |
| `REVIEWING` | Diff explanation & code review Q&A |

---

## Cloud Deployment Instructions

### 1. Backend (Docker)
```bash
docker build -t pasha-devpilot-api -f apps/api/Dockerfile .
docker run -p 8000:8000 --env-file .env pasha-devpilot-api
```

### 2. Backend (Render / Railway / Fly.io)
- Root Directory: `.`
- Build Command: `pip install -r apps/api/requirements.txt`
- Start Command: `python -m uvicorn apps.api.main:app --host 0.0.0.0 --port 8000`
- Environment Variables: copy from `.env.example`, set real `BOB_API_KEY`

### 3. Frontend (Vercel)
- Root Directory: `apps/web`
- Build Command: `npm run build`
- Output Directory: `.next`
- Environment Variables:
  - `NEXT_PUBLIC_API_URL=https://your-backend-api.onrender.com`

---

## Testing & Verification
Run the automated end-to-end full pipeline test anytime:
```bash
python apps/api/tests/test_full_suite.py
```
