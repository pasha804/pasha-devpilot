# Pasha DevPilot — Master Cinematic Video Demo Script (English)

> **Event:** IBM Bob 2.0 Hackathon on lablab.ai  
> **Duration:** Exactly 3:00 minutes (180 seconds)  
> **Narration Style:** Confident, visionary, crisp Silicon Valley engineering delivery.  
> **Target Audience:** IBM Hackathon Judges, VP of Engineering, Open-Source Devs.  
> **Live Production URL:** [https://web-production-787ab.up.railway.app](https://web-production-787ab.up.railway.app)  
> **Target Repository:** [https://github.com/pasha804/laughing-octo-eureka](https://github.com/pasha804/laughing-octo-eureka)

---

## 🎬 Director's Recording Setup

1. **Resolution:** 1080p 60fps (1920x1080) Fullscreen, Browser Zoom 100%.
2. **Audio Track:** Crisp voiceover recorded with noise filter, optional subtle ambient tech synth pad at -24dB underneath.
3. **Tab Layout:**
   - Tab 1: **Pasha DevPilot Landing Page** (`https://web-production-787ab.up.railway.app`)
   - Tab 2: **Pasha DevPilot Dashboard** (`https://web-production-787ab.up.railway.app/dashboard`)
   - Tab 3: **GitHub Demo Repository** (`https://github.com/pasha804/laughing-octo-eureka`)

---

## ⏱️ Scene-by-Scene Timeline & Voiceover Script

### 🌄 SCENE 1: The Cinematic Landing Page & The Problem (0:00 – 0:25)

**Visuals & Screen Action:**
- Start on the **Pasha DevPilot Cinematic Landing Page**.
- Slow camera push or cursor pan across the dark mountain horizon with the electric blue light beam rising into the starry sky.
- Highlight the stylized **"P"** brand logo and headline:  
  `Pasha DevPilot — Your AI Software Engineer.`  
  `Understand. Plan. Build. Verify. Ship.`
- Move cursor over the floating 3D glass card showing the live diff and active building stepper.

**Spoken Script:**
> *"Writing code is only twenty percent of software engineering. The real challenge is diagnosing complex repositories, planning multi-file refactors, enforcing strict security boundaries, and proving that tests pass before shipping to production.*
>
> *Meet **Pasha DevPilot** — an autonomous AI software engineer built as a production-grade extension for **IBM Bob**. Powered by IBM Bob's reasoning engine, DevPilot connects to real GitHub repositories, inspects AST topology, halts at human approval gates, tests code inside an isolated sandbox, and pushes verified pull requests with a single click."*

---

### 🔑 SCENE 2: Zero-PAT GitHub Authentication & Discovery (0:25 – 0:45)

**Visuals & Screen Action:**
- Click the electric blue **"Connect GitHub"** button on the navbar.
- Show the instantaneous, secure OAuth handshake.
- Land on the **Connected Repositories** view (`/repositories`).
- Point to connected account `@pasha804` and the target repository card: `pasha804/laughing-octo-eureka`.

**Spoken Script:**
> *"Connecting to DevPilot requires zero friction and zero risk. We built a zero-PAT authentication flow using server-side GitHub OAuth 2.0. No developer ever needs to copy-paste dangerous personal access tokens.*
>
> *Here is our live target repository: `laughing-octo-eureka` — a Python authentication and billing microservice with real failing tests. DevPilot clones it directly into an isolated execution jail, strictly blocking destructive shell commands and protecting your host machine."*

---

### 🧠 SCENE 3: AST Scanning & 20-Section Engineering Report (0:45 – 1:10)

**Visuals & Screen Action:**
- Click **"Scan Repository AST"** on `laughing-octo-eureka`.
- The AST symbol tree populates instantly with functions, classes, and dependency graphs.
- Show the baseline test failure diagnostics: **4 Failed Tests in Pytest**.
- Highlight the 2 critical defects found:
  1. `src/auth_service.py:37` — Inverted comparison operator rejecting valid tokens.
  2. `src/billing_service.py:58` — Promotional discount added instead of subtracted.

**Spoken Script:**
> *"DevPilot starts in State 1 and 2: **UNDERSTANDING** and **INVESTIGATING**.*
>
> *It parses the repository's Abstract Syntax Tree, extracts symbol hierarchies, and runs the baseline test suite. Look at the diagnosis: DevPilot isolates an inverted comparison operator in `auth_service.py` that expires valid tokens immediately, and an arithmetic defect in `billing_service.py` that overcharges users. The test harness is failing with four errors."*

---

### 🛑 SCENE 4: Launching Task & The Human-in-the-Loop Gate (1:10 – 1:40)

**Visuals & Screen Action:**
- Click **"Launch Autonomous Task"** with the prompt:  
  `"Fix token expiration logic in auth_service and correct discount calculation in billing_service. Verify all pytest assertions pass."`
- The **7-State Pipeline Visualizer** illuminates:
  - `UNDERSTANDING` (✓ Green)
  - `INVESTIGATING` (✓ Green)
  - `PLANNING` (✓ Green)
  - **HALTS at State 4: `WAITING_FOR_APPROVAL` (Glowing Amber Beacon ⚠️)**.
- Open the **Approval Dialog** showing IBM Bob's multi-step implementation plan.
- Click **"Approve & Implement"**.

**Spoken Script:**
> *"Now watch the 7-State Finite State Machine in action.*
>
> *Here is our core enterprise principle: **AI must never modify production code without explicit developer authorization.**
>
> *The orchestrator advances through planning, then automatically halts at State 4: **WAITING_FOR_APPROVAL**. DevPilot presents the exact surgical plan formulated by IBM Bob, listing target files, line numbers, and regression risks. I inspect the plan, click **Approve Plan**, and only then is permission granted to enter the sandbox."*

---

### 🧪 SCENE 5: Sandboxed Unified Diff & Truthful Pytest Verification (1:40 – 2:10)

**Visuals & Screen Action:**
- Pipeline advances to `IMPLEMENTING` (State 5) — applies surgical patches.
- Transitions to `VERIFYING` (State 6).
- Live sandbox terminal streams the real test run:  
  `pytest tests/ -v`
- Watch assertions turn green one by one:
  - `test_valid_fresh_token PASSED [50%]`
  - `test_expired_token PASSED [100%]`
  - **Banner: `2 passed in 0.12s · 100% Test Suite Passage`**.

**Spoken Script:**
> *"In State 5: **IMPLEMENTING**, DevPilot applies surgical unified diffs inside the isolated sandbox.
>
> Next, in State 6: **VERIFYING**, DevPilot runs the real pytest suite. If any test fails, our bounded self-healing engine analyzes the compiler traceback and iterates up to three attempts. But IBM Bob's patch is surgically precise on the first try — all tests pass with zero regressions!"*

---

### 🔎 SCENE 6: Monaco Diff Review & 1-Click Push to GitHub (2:10 – 2:45)

**Visuals & Screen Action:**
- Navigate to the **Review Workspace** & **Monaco Diff Viewer**.
- Show side-by-side syntax-highlighted diff:
  - Red line deleted: `- return current_timestamp < (token.created_at + expires_in)`
  - Green line added: `+ return current_timestamp > (token.created_at + expires_in)`
- Scroll to the glowing green banner:  
  `✓ AI Fixes Completed · Ready to Push (1 file modified)`
- **CLICK THE SINGLE BUTTON**: **"Push Changes to GitHub"**.
- Watch the button transition: `Pushing to GitHub...` ➔ `✓ View Shipped PR on GitHub ↗`.

**Spoken Script:**
> *"In State 7: **REVIEWING**, the developer inspects the changes in our integrated Monaco Diff Editor. Every single line added and deleted is crystal clear.
>
> And here is the magic: with this single button — **Push Changes to GitHub** — DevPilot commits the verified diffs to a clean branch, pushes to remote GitHub, and publishes a real Pull Request."*

---

### 🚀 SCENE 7: Live GitHub PR & Grand Finale (2:45 – 3:00)

**Visuals & Screen Action:**
- Click **"View Shipped PR on GitHub"**, opening [pasha804/laughing-octo-eureka/pull/1](https://github.com/pasha804/laughing-octo-eureka).
- Scroll through the PR description:
  - Verified test logs embedded
  - Conventional commit format
  - All CI checks passing green
- Cut back to the Pasha DevPilot dashboard showing **Total Work Done: +1 Shipped**.

**Spoken Script:**
> *"Look at this on GitHub: Pull Request opened, complete with test execution logs, diff hashes, and zero hallucinations.
>
> From a broken repository with failing tests to a verified, production-ready Pull Request in under ninety seconds. Pasha DevPilot transforms IBM Bob into a truthful, autonomous software engineer.
>
> Try it live today at our Railway URL. Thank you!"*

---

## 💡 Top 5 Tips for Video Recording

1. **Keep the pace lively:** Don't pause during loading spinners; talk through the architecture as tasks run.
2. **Highlight IBM Bob:** Emphasize that `BobProvider` is powering the reasoning, AST defect isolation, and diff generation.
3. **Show Real Evidence:** Point to the real terminal exit code `0` and the real GitHub pull request URL.
4. **Mouse Movement:** Smooth, deliberate cursor movements. Avoid fast frantic circles.
5. **End on Impact:** Leave the live Railway URL on screen for the final 3 seconds.
