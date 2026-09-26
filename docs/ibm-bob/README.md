# IBM Bob 2.0 Hackathon Documentation — Pasha DevPilot

> **Project:** Pasha DevPilot — "Your AI Software Engineer."  
> **Hackathon Track:** IBM Bob 2.0 Hackathon on lablab.ai  
> **Role of IBM Bob:** AI-Assisted Development Environment + Runtime SDLC Provider  

---

## 1. Overview & Truthful Attribution

Pasha DevPilot was architected, scaffolded, and iteratively developed using the **IBM Bob IDE** and Bob reasoning models as the primary AI pair-programming assistant, combined with a production runtime integration via `BobProvider`.

This directory contains complete, unvarnished documentation of how IBM Bob was utilized throughout the lifecycle of this project:

- [Session Summary](file:///e:/Pasha-devpolit/docs/ibm-bob/session-summary.md): Granular breakdown of prompt trajectories, phases, and token consumption inside the IBM Bob IDE.
- [Development Log](file:///e:/Pasha-devpolit/docs/ibm-bob/development-log.md): Chronological record of code generation, AST parsing design, security jail engineering, and self-healing test loop creation.
- [Decisions (ADRs)](file:///e:/Pasha-devpolit/docs/ibm-bob/decisions/): Architectural Decision Records detailing major design choices guided by IBM Bob.
- [Screenshots](file:///e:/Pasha-devpolit/docs/ibm-bob/screenshots/): Visual walkthrough references and recording artifacts.

---

## 2. IBM Bob Dual-Role Architecture

IBM Bob played two vital, distinct roles in Pasha DevPilot:

### A. Development-Time AI Assistant
IBM Bob was used as the primary engineering assistant during the initial build phases:
- Synthesizing the 7-state orchestrator state machine (`packages/agent_core/orchestrator/state_machine.py`)
- Generating AST symbol parsers and context extraction algorithms (`apps/api/services/repository_indexer.py`, `context_engine.py`)
- Designing the restricted execution sandbox allowlist (`apps/api/services/sandbox_service.py`)
- Authoring the Next.js 15 App Router cyber/terminal interface and Monaco diff engine (`apps/web/`)

### B. Runtime AI Provider (`BobProvider`)
Pasha DevPilot features a first-class `BobProvider` (`packages/agent_core/providers/bob_provider.py`) implementing an OpenAI-compatible connector to the IBM Bob platform with custom SDLC preambles:
- When `BOB_API_KEY` is configured in the environment, `ModelRouter` prioritizes `BobProvider` for all 7 pipeline states:
  1. `UNDERSTANDING`
  2. `INVESTIGATING`
  3. `PLANNING`
  4. `WAITING_FOR_APPROVAL` (Gate)
  5. `IMPLEMENTING`
  6. `VERIFYING`
  7. `REVIEWING`

---

## 3. Directory Navigation

| Document | Purpose |
|---|---|
| [`session-summary.md`](file:///e:/Pasha-devpolit/docs/ibm-bob/session-summary.md) | Granular prompt-by-prompt session records and token tracking |
| [`development-log.md`](file:///e:/Pasha-devpolit/docs/ibm-bob/development-log.md) | Day-by-day engineering log, debugging steps, and verification |
| [`decisions/`](file:///e:/Pasha-devpolit/docs/ibm-bob/decisions/) | Formal Architecture Decision Records (ADRs) |
| [`screenshots/`](file:///e:/Pasha-devpolit/docs/ibm-bob/screenshots/) | E2E demo assets and UI walkthrough notes |
