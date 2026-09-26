# Pasha DevPilot — Master Video Demo Script (English)

> **Event:** IBM Bob 2.0 Hackathon on lablab.ai  
> **Duration:** 2:45 to 3:00 minutes  
> **Narration Style:** Professional, authoritative, energetic, crisp international English.  
> **Target Audience:** Hackathon Judges, Enterprise Tech Leads, Open-Source Maintainers.

---

## 📋 Pre-Flight Recording Checklist

Before starting OBS Studio, Loom, or Camtasia:
1. **Screen 1 (Main):** Open [https://web-production-787ab.up.railway.app](https://web-production-787ab.up.railway.app) (or `http://localhost:3000`) in fullscreen 1080p (1920x1080).
2. **Screen 2 (Tab):** Open [https://github.com/pasha804/laughing-octo-eureka](https://github.com/pasha804/laughing-octo-eureka) ready in an adjacent tab.
3. **Audio:** Microphone level tested at -6dB to -3dB with noise suppression active.
4. **Resolution & Zoom:** Set browser zoom to 100% or 110% for sharp text visibility.

---

## 🎬 Turn-by-Turn Video Timeline & Spoken Narration

### Scene 1: Landing Page & The Core Problem (0:00 – 0:20)

**On-Screen Actions:**
- Start fullscreen on the Pasha DevPilot landing page (`/dashboard`).
- Slowly move the cursor across the cyber-grid showing the live telemetry headline:  
  *"Autonomous AI Software Engineer powered by IBM Bob"*.
- Hover briefly over the 5-phase mantra: *"Understand. Plan. Build. Verify. Ship."*

**Spoken Script:**
> *"Hello everyone! Today, developers have plenty of AI code assistants that suggest snippets inside an editor. But writing code is only twenty percent of software engineering. The real challenge is understanding whole-repository topology, planning multi-file refactors, enforcing strict security boundaries, and running automated test suites until the build is proven green.*
>
> *Meet **Pasha DevPilot** — an autonomous AI software engineer built as an enterprise extension for **IBM Bob**. Powered by IBM Bob's reasoning engine, DevPilot turns GitHub issues and failing test suites into verified, production-ready Pull Requests through a deterministic 7-state finite state machine."*

---

### Scene 2: Real GitHub Authorization & Account Linking (0:20 – 0:40)

**On-Screen Actions:**
- Click on **Repositories** in the sidebar navigation (`/repositories`).
- Click the glowing button: **"Authorize with GitHub"** (or **"Sync Repositories"**).
- Show the instant OAuth 2.0 handshake completing seamlessly.
- Point to your connected profile badge: `@pasha804` and the populated repository cyber-grid.

**Spoken Script:**
> *"Connecting to DevPilot is seamless and secure. We implement full server-side GitHub OAuth 2.0 with zero Personal Access Token exposure. Notice what just happened: my GitHub profile `@pasha804` is instantly linked, and DevPilot dynamically discovers all my public and private repositories without needing any client-side secrets."*

---

### Scene 3: Repository Selection & Sandbox Jail Isolation (0:40 – 1:00)

**On-Screen Actions:**
- Locate and click on the repository card: **`pasha804/laughing-octo-eureka`**.
- Transition to the repository details view.
- Highlight the **Sandbox Status Indicator**:  
  *"Sandbox Jail Initialized — Isolated Temporary Environment"*.
- Point out the security parameters displayed on the card (Process Isolation, Traversal Guards).

**Spoken Script:**
> *"Here is our live demo target: `laughing-octo-eureka`, a Python OAuth and billing microservice.
>
> When I select this repository, DevPilot clones it directly into an **isolated sandbox execution jail**. Notice our zero-trust security guardrails: arbitrary shell execution is blocked, destructive commands like `rm -rf` and force-pushes are strictly forbidden, and directory traversal is completely contained. The host machine is one hundred percent protected."*

---

### Scene 4: Deep AST Scanning & Defect Diagnostics (1:00 – 1:25)

**On-Screen Actions:**
- Click the button: **"Scan Repository AST"**.
- Watch the scanner populate the symbol tree: `AuthService`, `BillingService`, `User`, `AuthToken`.
- Scroll to the detected defects panel:
  - Defect 1: `src/auth_service.py` (Inverted comparison operator rejecting valid tokens).
  - Defect 2: `src/billing_service.py` (Promotional discount added instead of subtracted).
- Show the baseline test failure telemetry: **4 Failed, 3 Passed (Exit Code 1)**.

**Spoken Script:**
> *"Now watch DevPilot's first two states — **UNDERSTANDING** and **INVESTIGATING** — in action.
>
> DevPilot parses the full Abstract Syntax Tree across the codebase, extracting every class, method, and import relationship. It executes the project's existing test harness and uncovers two critical defects:
>
> First, an inverted timestamp check in `auth_service.py` that rejects valid authentication tokens; second, an arithmetic defect in `billing_service.py` that adds discounts instead of subtracting them, causing customers to be overcharged. The existing test suite is failing with four errors."*

---

### Scene 5: Launching Task, 7-State FSM & Human Approval Gate (1:25 – 1:55)

**On-Screen Actions:**
- Click **"Start Engineering Task"** (or `/tasks/new`).
- Prompt Input:  
  *"Fix token expiration bug in auth_service and correct discount deduction in billing_service. Verify all pytest assertions pass."*
- Click **"Launch Autonomous Task"**.
- The **7-State Pipeline Visualizer** animates across:
  - `UNDERSTANDING` (Green ✓)
  - `INVESTIGATING` (Green ✓)
  - `PLANNING` (Green ✓)
  - **HALTS at State 4: `WAITING_FOR_APPROVAL` (Glowing Amber ⚠️)**.
- The **Approval Modal** opens showing the structured step-by-step implementation plan generated by IBM Bob.
- Point mouse to the steps and risk assessment, then click **"Approve & Implement"**.

**Spoken Script:**
> *"Let's fix this autonomously. I submit our engineering prompt and launch the task.
>
> Look at the 7-State Pipeline Visualizer: it transitions through UNDERSTANDING, INVESTIGATING, and PLANNING. 
>
> And here is our core architectural philosophy: **AI must never touch production code without developer consent.**
>
> The orchestrator halts execution at State 4: **WAITING_FOR_APPROVAL** with a glowing amber beacon. DevPilot presents the exact multi-file plan generated by IBM Bob. I can review the file targets, inspect the regression risk assessment, and click **Approve Plan**. Only now does DevPilot proceed to write any changes."*

---

### Scene 6: Sandboxed Implementation, Pytest & Autonomous Self-Healing (1:55 – 2:20)

**On-Screen Actions:**
- The pipeline advances to `IMPLEMENTING` (blue pulsing node), applying unified diffs.
- Moves automatically to `VERIFYING` (State 6).
- The **Live Streaming Terminal** displays the test execution:  
  `pytest tests/ -v`
- Terminal output logs stream in real-time:
  - `test_auth.py::test_issue_and_verify_valid_token PASSED`
  - `test_auth.py::test_expired_token_rejected PASSED`
  - `test_billing.py::test_calculate_invoice_with_promotional_discount PASSED`
  - **Banner: `7 passed in 0.42s (100% Green)`**.

**Spoken Script:**
> *"Upon approval, DevPilot transitions to State 5: **IMPLEMENTING**, synthesizing surgical unified diffs and applying them inside the sandbox.
>
> Next, in State 6 — **VERIFYING** — the sandbox executes the real pytest test runner. If tests had failed, DevPilot would have initiated an autonomous self-healing loop for up to three attempts, feeding compiler tracebacks back into IBM Bob.
>
> But here, IBM Bob's patch is surgically accurate on the first try: all seven test assertions turn green in zero point four seconds!"*

---

### Scene 7: Inspecting Changes in Monaco Diff Editor & Sandbox Editor (2:20 – 2:40)

**On-Screen Actions:**
- Pipeline advances to State 7: `REVIEWING`.
- The integrated **Monaco Diff Editor** renders side-by-side:
  - `src/auth_service.py`: Red line `- if token.expires_at > now:` replaced by Green `+ if token.expires_at < now:`.
  - `src/billing_service.py`: Red line `- discounted_subtotal = subtotal + discount_amount` replaced by Green `+ discounted_subtotal = subtotal - discount_amount`.
- Briefly toggle the **Built-in Sandbox Editor** tab to show that developers can also tweak code manually right in the workspace.

**Spoken Script:**
> *"We advance to State 7: **REVIEWING**. DevPilot loads the verified patches into our integrated Monaco Diff Editor.
>
> Look at the precision: on line 68 of `auth_service.py`, it flipped the inverted operator from greater-than to less-than. On line 58 of `billing_service.py`, it corrected the addition to subtraction. 
>
> And if the engineer wants to make further manual edits, they can inspect and edit the files directly inside our built-in sandbox editor."*

---

### Scene 8: Pushing Branch, Opening GitHub PR & Conclusion (2:40 – 3:00)

**On-Screen Actions:**
- In the review bar, click the glowing action button: **"Ship to GitHub"** / **"Create Pull Request"**.
- An animated notification confirms:  
  *"Branch pushed: devpilot/fix-auth-billing | Pull Request Created!"*
- Click the displayed PR link and switch to GitHub tab: [pasha804/laughing-octo-eureka/pull/1](https://github.com/pasha804/laughing-octo-eureka).
- Show the clean markdown PR description, test logs attached, and green status.
- Return to DevPilot dashboard showing updated metrics.

**Spoken Script:**
> *"Finally, DevPilot asks: 'Ready to ship?'. I click **Ship Pull Request**. DevPilot automatically creates a dedicated branch, commits the verified files, pushes to the GitHub remote, and opens a real, fully documented Pull Request directly on GitHub.
>
> From a broken repository with four test failures to a green, verified Pull Request in under ninety seconds. Pasha DevPilot transforms IBM Bob from an advisory chatbot into a truthful, autonomous software engineer.
>
> Thank you for watching!"*

---

## 🎙️ Pacing & Voiceover Guidelines

| Scene | Duration | Tone & Energy | Focus Keyphrase |
|---|---|---|---|
| **Scene 1** | 0:00 – 0:20 | Confident, provocative | *"Writing code is only 20% of engineering"* |
| **Scene 2** | 0:20 – 0:40 | Smooth, modern | *"Zero PAT exposure, server-side OAuth 2.0"* |
| **Scene 3** | 0:40 – 1:00 | Security-focused, precise | *"Isolated sandbox execution jail"* |
| **Scene 4** | 1:00 – 1:25 | Analytical, technical | *"AST symbol parsing, 4 test failures"* |
| **Scene 5** | 1:25 – 1:55 | Dramatic, authoritative | *"AI must never touch code without human consent"* |
| **Scene 6** | 1:55 – 2:20 | Triumphant, rapid | *"100% green verification in 0.4 seconds"* |
| **Scene 7** | 2:20 – 2:40 | Detailed, technical | *"Monaco Diff Editor, surgical precision"* |
| **Scene 8** | 2:40 – 3:00 | Inspiring, conclusive | *"From broken repo to verified PR in 90 seconds"* |
