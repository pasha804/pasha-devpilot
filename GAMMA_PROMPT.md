# Pasha DevPilot — Master Prompt for Gamma.app / ClickUp Presentation Generator

> **Purpose:** Use this prompt inside **Gamma.app** or **ClickUp AI** to generate a world-class, highly visual, interactive presentation deck using your uploaded project documentation (`PRD.md`, `DETAIL.txt`, `DOCUMENTATION.md`, `README.md`).

---

## 🛠️ Gamma.app Recommended Settings Before Generating

When starting in **Gamma.app** (via *Generate from Document* or *Prompt*):
1. **Output Format:** Presentation (16:9 Widescreen)
2. **Text Amount:** Detailed / Comprehensive (not brief)
3. **Theme:** Choose **Dark / Cyber / Night / Midnight Slate** (deep navy `#07090e`, neon blue `#3b82f6`, emerald `#10b981`, amber `#f59e0b`)
4. **Visual Style:** Tech / Engineering / Vector Diagrams & Clean Code Widgets
5. **Language:** English

---

## 📋 The Copy-Paste Master Prompt for Gamma.app / ClickUp AI

Copy and paste the exact text block below into the Gamma/ClickUp AI generation box:

```text
You are a Principal Technical Product Designer and Executive Presentation Specialist. 
Generate a high-impact, visually stunning 11-slide presentation deck for "Pasha DevPilot", an autonomous AI software engineering platform built as an official extension for IBM Bob for the IBM Bob 2.0 Hackathon on lablab.ai.

DESIGN & AESTHETIC DIRECTIVES:
- Theme: Sleek cyber-dark theme (midnight navy background, vibrant electric blue #3b82f6 accents, emerald green #10b981 for success states, amber #f59e0b for warning gates, and danger red #ef4444 for errors).
- Layout: Use rich visual cards, 2-column and 3-column feature grids, interactive comparison tables, horizontal state stepper diagrams, code diff snippet blocks, and large numeric stat callouts.
- Tone: Highly technical, confident, enterprise-ready, authoritative. Zero marketing fluff.

SLIDE-BY-SLIDE CONTENT & WIDGET SPECIFICATION:

SLIDE 1: PRODUCT IDENTITY & HERO
- Tagline Badge: "Autonomous AI Software Engineer powered by IBM Bob"
- Main Title: "Pasha DevPilot"
- Subtitle: "Understand. Plan. Build. Verify. Ship."
- Description: "An enterprise-grade autonomous software engineering platform that connects directly to GitHub repositories, parses AST symbol topologies, requires human approval, and verifies patches inside an isolated sandbox jail until 100% green."
- Widgets: 3 Feature Cards highlighting (1) Whole-Repo AST Intelligence, (2) Human-in-the-Loop Safety Gate, (3) Sandboxed Test Verification & GitHub Pull Requests.
- Badges: IBM Bob 2.0 Hackathon • Next.js 15 • FastAPI • Railway Cloud.

SLIDE 2: THE INDUSTRY CRISIS (WHAT'S BROKEN TODAY)
- Title: "The Limits of Existing AI Code Assistants"
- Subtitle: "Writing code is only 20% of engineering. The remaining 80% is debugging, regression testing, and repository topology."
- Widgets: 3 Warning Cards (Red accent border)
  1. "Single-File Blindness": Copilots only inspect the current editor buffer, missing cross-module dependencies and causing breaking changes in unseen files.
  2. "Untested Hallucinations": Chatbots emit probabilistic code snippets without compilers or test suites. Developers waste hours debugging AI syntax errors.
  3. "Zero Infrastructure Safety": Unchecked agent access risks destructive host operations like 'rm -rf', force-pushes, and API token leakage.

SLIDE 3: THE PARADIGM SHIFT (THE PASHA DEVPILOT SOLUTION)
- Title: "Pasha DevPilot: Truthful Autonomous Delivery"
- Subtitle: "An enterprise workstation connecting directly to real GitHub repositories with zero mock data."
- Widget: High-Contrast Comparison Matrix Table:
  * Dimension: Repository Context -> Competitors: Single buffer / Chat copy-paste -> DevPilot: Whole-Repo AST Symbol Graph
  * Dimension: Safety Rail -> Competitors: Blind file overwrites -> DevPilot: Human-in-the-Loop Approval Gate (State 4)
  * Dimension: Verification -> Competitors: None (Assumes code works) -> DevPilot: Real pytest/npm in Sandbox with 3x Self-Healing
  * Dimension: Final Artifact -> Competitors: Markdown block in chat -> DevPilot: Verified GitHub Branch + Signed Pull Request

SLIDE 4: THE CORE ORCHESTRATOR (7-STATE FINITE STATE MACHINE)
- Title: "The Deterministic 7-State Finite State Machine"
- Subtitle: "Zero random prompt generation. Every task follows an immutable, audited engineering lifecycle."
- Widget: Horizontal 7-Node Stepper Diagram:
  [1. UNDERSTAND] ➔ [2. INVESTIGATE] ➔ [3. PLAN] ➔ [4. WAITING_FOR_APPROVAL ⚠️] ➔ [5. IMPLEMENT] ➔ [6. VERIFY] ➔ [7. SHIP PR]
- Callout Cards:
  * Phase 1 (States 1-3): AST Symbol Parsing, baseline test execution, and multi-file repair plan synthesis.
  * Phase 2 (State 4): Pipeline halts with glowing amber indicator. Developer must click "Approve" before code is touched.
  * Phase 3 (States 5-7): Surgical unified diff patching, automated test verification, and GitHub PR creation.

SLIDE 5: DEVELOPER SOVEREIGNTY (THE HUMAN-IN-THE-LOOP GATE)
- Title: "Safety Philosophy: The Human-in-the-Loop Approval Gate"
- Subtitle: "AI should advise, plan, and verify — but the human engineer always retains command authority."
- Widgets: 3 Deep-Dive Cards:
  1. "Execution Freeze": The orchestrator safely halts execution in State 4. Zero file writes or Git commits are permitted while waiting.
  2. "Step-by-Step Transparency": The UI displays the exact planned file targets, proposed unified diffs, and regression risk assessment.
  3. "Developer Controls": Engineers can approve with one click, submit feedback to re-plan, or reject the task entirely.

SLIDE 6: ZERO-TRUST SECURITY (RESTRICTED EXECUTION SANDBOX JAIL)
- Title: "Restricted Execution Sandbox & Credential Shield"
- Subtitle: "Protecting host infrastructure from hostile code injection, process escapes, and token exfiltration."
- Widgets: 3 Security Pillar Cards:
  1. "Binary Allowlist": Only approved test and build binaries can execute: pytest, npm test, cargo test, go test, git.
  2. "Destructive Denylist": Blocks rm, del, format, shutdown, curl | bash, and dangerous git commands like git push --force.
  3. "Regex Secret Redaction": Automatically detects and masks ghp_*, sk-*, and JWT tokens before streaming logs to the UI.

SLIDE 7: REAL-WORLD PROOF (CASE STUDY: LAUGHING-OCTO-EUREKA MICROSERVICE)
- Title: "Live Case Study: laughing-octo-eureka Microservice"
- Subtitle: "Autonomous diagnosis, remediation, and self-healing on a live GitHub repository (github.com/pasha804/laughing-octo-eureka)."
- Widgets:
  * Code Diff Box (Red/Green syntax highlighting):
    - Defect 1 (auth_service.py): Inverted operator fix (`- if token.expires_at > now:` ➔ `+ if token.expires_at < now:`)
    - Defect 2 (billing_service.py): Arithmetic fix (`- discounted = subtotal + discount` ➔ `+ discounted = subtotal - discount`)
  * Verification Telemetry Card:
    - Initial Pytest Baseline: 4 FAILED, 3 PASSED (Exit Code 1)
    - Post-DevPilot Patch: 7 PASSED, 0 FAILED in 0.42s (100% Green)
    - Delivered Artifact: Verified GitHub branch + signed Pull Request #1 with full test report.

SLIDE 8: AI INTELLIGENCE BACKBONE (IBM BOB INTEGRATION)
- Title: "IBM Bob: Core SDLC Reasoning Engine"
- Subtitle: "Pasha DevPilot functions as a native extension for IBM Bob via BobProvider and the bob-code-plus model."
- Widgets: 2 Column Cards:
  * "BobProvider & Prompt Engineering": Injects senior staff engineer rules into every call, enforcing unified diffs with exact line ranges and AST symbol grounding. Full 40/40 token lifecycle audit.
  * "ModelRouter & Dynamic Failover": Automatically prioritizes IBM Bob when BOB_API_KEY is configured. Seamless zero-downtime fallback to DeepSeek V4 Flash and Groq LLaMA 3.3.

SLIDE 9: CLOUD PRODUCTION ARCHITECTURE (RAILWAY MULTI-SERVICE)
- Title: "Production Multi-Service Topology on Railway"
- Subtitle: "Live in the cloud with decoupled microservices and real-time state synchronization."
- Widgets: 3 Service Block Cards:
  1. "Next.js 15 Web Workstation": Monaco Diff Editor, glowing 7-state visualizer, dark cyber theme, and SSE event streaming.
  2. "FastAPI Async Backend Core": High-throughput REST API with SQLAlchemy async ORM and Redis Pub/Sub task queue.
  3. "Background Worker Daemon": Standalone Python daemon executing long-running Git clones and sandboxed test suites without blocking.

SLIDE 10: BUSINESS VALUE & ENGINEERING ROI
- Title: "Transforming Developer Velocity & Quality"
- Subtitle: "Eliminating engineering toil and reducing mean time to remediate defects."
- Widgets: 3 Large Stat Metrics:
  * "85% Faster MTTR": Reduces defect repair cycles from hours to under 90 seconds.
  * "100% Verified Green": Zero unverified code merges; every patch must pass real test suites.
  * "Zero Host Escapes": 100% of untrusted operations isolated within sandbox execution jail.

SLIDE 11: CONCLUSION & LIVE EVALUATION
- Main Title: "Understand. Plan. Build. Verify. Ship."
- Subtitle: "Pasha DevPilot demonstrates that autonomous AI software engineering is safe, verified, and production-ready today."
- Widgets: 3 Link Cards:
  * "Live Web Station": web-production-787ab.up.railway.app
  * "Backend API & Health": api-production-508f.up.railway.app/api/v1/health
  * "Live Demo Target": github.com/pasha804/laughing-octo-eureka
- Closing Call to Action: "Explore the live station or test your own GitHub repositories today!"
```

---

## 🎨 Watermark Handling & Export Tips

If you export your presentation from Gamma.app on a free plan:
1. **Gamma PDF/PPTX Export Watermark:**
   - Gamma embeds a small "Made with Gamma" badge in the bottom corner of exported slides.
   - When you export as **PowerPoint (`.pptx`)**, you can simply open it in PowerPoint or Google Slides, click on the corner watermark text box, and press **Delete**!
   - Alternatively, you can use our built-in **`presentation.html`** or **`Pasha_DevPilot_Deck.pptx`** which are **100% watermark-free** and customized with exact colors and SVGs.
2. **Presenting Live in the Browser:**
   - In Gamma, click **Present** (fullscreen mode). The watermark is minimal or hidden in presentation mode.
   - Or open `presentation.html` in Chrome/Edge, press **F11** for fullscreen, and press **`N`** for live speaker notes.
