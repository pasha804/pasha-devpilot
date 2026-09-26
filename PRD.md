# Product Requirements Document (PRD) — Pasha DevPilot

## 1. Executive Summary

**Product Name:** Pasha DevPilot  
**Tagline:** Autonomous AI Software Engineer powered by IBM Bob  
**Version:** 1.0.0 (Production Hackathon Release)  
**Core Promise:** *Understand. Plan. Build. Verify. Ship.*

Pasha DevPilot is an enterprise-grade autonomous software engineering platform designed as a native extension for the **IBM Bob AI ecosystem**. Unlike conventional conversational code assistants that only suggest autocompletions in an editor, DevPilot takes ownership of entire engineering workflows: connecting to real GitHub repositories, constructing comprehensive AST symbol graphs, diagnosing deep logic defects, synthesizing structured implementation plans, requiring explicit human approval, executing surgical diffs in a sandboxed runtime jail, validating with automated test runners, and publishing verified Pull Requests.

---

## 2. Problem Statement

### 2.1 The Limits of Code Assistants
Current generative AI tools (Copilot, generic chat bots) operate on isolated prompts or single-file buffers. They suffer from:
1. **Lack of Repository Context:** Inability to build whole-project call graphs and understand multi-file side effects.
2. **Hallucinated & Broken Code:** Emitting untested code snippets that fail at runtime or break existing test suites.
3. **Absence of Safety Rails:** No isolation mechanism preventing destructive terminal operations (`rm -rf`, force pushes, data loss).
4. **No Verification Loop:** No capability to execute unit tests, read tracebacks, and self-heal before burdening human reviewers.

### 2.2 The Solution
Pasha DevPilot bridges the gap between AI generation and production deployment through:
- **Deterministic 7-State Finite State Machine (FSM)**.
- **Deep AST symbol indexing** across Python and TypeScript codebases.
- **Strict Human-in-the-Loop approval gate** before applying any file modifications.
- **Sandboxed execution jail** with command allowlisting and path-traversal prevention.
- **Self-healing test runner** with automated retry feedback loops (up to 3 iterations).
- **Direct GitHub integration** with OAuth 2.0 and Pull Request generation.

---

## 3. Target Audience & Personas

| Persona | Role | Core Need | DevPilot Value |
|---|---|---|---|
| **Senior Engineer / Tech Lead** | Architecture & Code Quality | Review and verify complex bug fixes quickly without context-switching. | Reviews structured 20-section reports and approves unified diffs before merging. |
| **Full-Stack Developer** | Feature Delivery & Maintenance | Eliminate repetitive bug fixing, test writing, and dependency updates. | Hands off failing test suites to DevPilot; receives green passing PRs. |
| **DevOps / Security Lead** | Platform Security & Compliance | Ensure AI agents never execute unsafe host commands or leak API tokens. | Strict command allowlist, isolated sandbox jail, and automatic secret masking. |

---

## 4. Product Architecture & System Design

```
+---------------------------------------------------------------------------------+
|                               PASHA DEVPILOT UI                                 |
|         (Next.js 15 App Router - Tailwind CSS - Monaco Editor - Lucide)         |
+----------------------------------------+----------------------------------------+
                                         | REST / Server-Sent Events
                                         v
+---------------------------------------------------------------------------------+
|                              FASTAPI BACKEND CORE                               |
|        (Async SQLAlchemy - SQLite/PostgreSQL - JWT Auth - Secret Masker)         |
+----------------------------------------+----------------------------------------+
                                         |
     +-----------------------------------+-----------------------------------+
     |                                                                       |
     v                                                                       v
+---------------------------------------+   +---------------------------------------+
|          7-STATE ORCHESTRATOR         |   |         EXECUTION SANDBOX JAIL        |
|  1. UNDERSTANDING (AST Parser)        |   |  - Isolated temp filesystem           |
|  2. INVESTIGATING (Diagnostics)       |   |  - Command allowlist (pytest/npm/git) |
|  3. PLANNING (Step-by-step)           |   |  - Path traversal guard (../ blocked) |
|  4. WAITING_FOR_APPROVAL [GATE]       |   |  - Process timeout & memory limits    |
|  5. IMPLEMENTING (Unified Diffs)      |   +---------------------------------------+
|  6. VERIFYING (Self-Healing Tests)    |
|  7. REVIEWING / SHIP (Monaco & PR)    |
+---------------------------------------+
     |
     v
+---------------------------------------------------------------------------------+
|                           MULTI-PROVIDER AI ROUTER                              |
|   - PRIMARY: IBM Bob (bob-code-plus via CleanAPIs / BobProvider)                |
|   - FALLBACK: DeepSeek V4 Flash / Groq llama-3.3-70b-versatile                  |
+---------------------------------------------------------------------------------+
```

---

## 5. Functional Requirements (7-State Machine)

### State 1: `UNDERSTANDING`
- **FR-1.1:** Clones target repository into an isolated sandbox working directory.
- **FR-1.2:** Recursively parses directory structure, detecting project type (`pyproject.toml`, `package.json`, `Cargo.toml`, `go.mod`).
- **FR-1.3:** Performs AST symbol extraction, extracting class declarations, function signatures, dependencies, and test paths.
- **FR-1.4:** Stores indexed symbol table in memory for prompt grounding.

### State 2: `INVESTIGATING`
- **FR-2.1:** Synthesizes an initial diagnosis by running the existing test runner (`pytest`, `npm test`) inside the sandbox.
- **FR-2.2:** Captures stdout, stderr, and failure tracebacks.
- **FR-2.3:** Queries **IBM Bob** (`bob-code-plus`) with repository context, symbol table, and error logs.
- **FR-2.4:** Outputs an engineering findings report identifying the root cause file and line numbers.

### State 3: `PLANNING`
- **FR-3.1:** IBM Bob creates an ordered, step-by-step implementation plan.
- **FR-3.2:** Each step outlines target files, expected diff chunks, and verification criteria.
- **FR-3.3:** Transition to `WAITING_FOR_APPROVAL` is strictly mandatory.

### State 4: `WAITING_FOR_APPROVAL` (Human-in-the-Loop Gate)
- **FR-4.1:** UI renders the generated engineering plan with an interactive approval control.
- **FR-4.2:** Execution is completely paused; no filesystem writes or git commands may run while in this state.
- **FR-4.3:** User can trigger:
  - `Approve`: Transitions to `IMPLEMENTING`.
  - `Reject`: Cancels task and logs reason.
  - `Revise`: Accepts feedback prompt to re-run `PLANNING`.

### State 5: `IMPLEMENTING`
- **FR-5.1:** IBM Bob synthesizes unified diffs with exact line ranges and standard hunk headers (`@@ -L,S +L,S @@`).
- **FR-5.2:** Sandbox diff engine validates target lines and applies modifications atomatically.
- **FR-5.3:** Syntax trees are re-validated to prevent invalid code generation.

### State 6: `VERIFYING` (Autonomous Self-Healing)
- **FR-6.1:** Executes unit test harness in sandbox using configured runner (`pytest -v`).
- **FR-6.2:** If tests pass with exit code 0:
  - Transition immediately to `REVIEWING`.
- **FR-6.3:** If tests fail (exit code != 0):
  - Increment retry counter (max 3 attempts).
  - Feed error traceback back into IBM Bob with instruction: *"Previous patch failed test assertion X. Synthesize corrected patch."*
  - Re-apply diff and re-run tests.
  - If 3 attempts exhausted, mark task as `FAILED` with diagnostics.

### State 7: `REVIEWING` & `SHIPPING`
- **FR-7.1:** Generates side-by-side Monaco Diff Viewer representation of all modified files.
- **FR-7.2:** Computes stats: lines added, lines removed, files changed.
- **FR-7.3:** Provides one-click action: **"Create Pull Request"**.
- **FR-7.4:** Automatically commits verified branch (`devpilot/fix-{task_id}`) and pushes to GitHub with descriptive markdown PR body.

---

## 6. Security & Guardrails

| Threat Vector | Mitigation Strategy | Enforcement Layer |
|---|---|---|
| **Host System Compromise** | Sandbox execution jail restricted to isolated temporary directory. Blocked: `rm`, `del`, `format`, `shutdown`, `curl \| bash`. | `apps/api/services/sandbox_service.py` |
| **Unapproved Code Execution** | Pipeline execution strictly pauses at `WAITING_FOR_APPROVAL`. Zero code modifications allowed before human approval. | `packages/agent_core/orchestrator/orchestrator.py` |
| **Dangerous Git Operations** | Blocked: `git push --force`, `git clean -f`, `git reset --hard origin`, `git rm -rf`. | Sandbox command allowlist regex |
| **Path Traversal Attacks** | Target paths containing `../` or resolving outside sandbox root trigger immediate `SecurityException`. | Sandbox path canonicalization |
| **Credential / Token Leakage** | Regex-based secret masking automatically redacts `ghp_*`, `gho_*`, `sk-*`, `cc_*`, and JWT tokens from all UI logs. | `apps/api/core/security.py` |

---

## 7. Non-Functional Requirements (NFR)

1. **Performance:**
   - AST symbol indexing completed in `< 2.5 seconds` for repositories under 500 files.
   - Plan generation via IBM Bob completed in `< 6.0 seconds`.
   - UI updates streamed in real-time (< 100ms latency).
2. **Reliability:**
   - Resilient database storage with SQLite (local) and PostgreSQL (production).
   - Graceful fallback: If IBM Bob API reaches rate limits, router switches seamlessly to CleanAPIs / Groq fallback with zero task interruption.
3. **Usability:**
   - 100% responsive dark-mode cyber aesthetic with high contrast (WCAG AA compliant).
   - Zero terminal knowledge required for basic bug fixes.

---

## 8. Success Metrics & KPIs

- **Autonomous Resolution Rate:** > 80% of seeded unit-test defects resolved without manual intervention.
- **Mean Time to Remediate (MTTR):** Average bug fix cycle (understand to verified PR) in `< 90 seconds`.
- **Zero Host Escapes:** 100% of untrusted operations confined within sandbox jail.
- **User Satisfaction:** Seamless one-click verification flow in live demo evaluations.
