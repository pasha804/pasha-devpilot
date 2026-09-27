import os
import subprocess
import base64

def generate_high_end_pdf():
    thumb_path = os.path.join(os.getcwd(), "thumbnail.jpg")
    thumb_b64 = ""
    if os.path.exists(thumb_path):
        with open(thumb_path, "rb") as f:
            thumb_b64 = f"data:image/jpeg;base64,{base64.b64encode(f.read()).decode('utf-8')}"

    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Pasha DevPilot — Ultra High-End Pitch Deck</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    @page {{
      size: 1920px 1080px;
      margin: 0;
    }}
    * {{
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
    }}
    body {{
      background: #060913;
      color: #F8FAFC;
    }}

    /* Master Page Canvas */
    .page {{
      width: 1920px;
      height: 1080px;
      position: relative;
      page-break-after: always;
      break-after: page;
      overflow: hidden;
      padding: 60px 80px;
      background: #060913;
      background-image: 
        radial-gradient(circle at 10% 15%, rgba(56, 189, 248, 0.18) 0%, transparent 40%),
        radial-gradient(circle at 90% 85%, rgba(168, 85, 247, 0.16) 0%, transparent 45%),
        radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px);
      background-size: 100% 100%, 100% 100%, 28px 28px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }}

    /* Global Header */
    .header-bar {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding-bottom: 20px;
      position: relative;
    }}
    .header-left {{
      display: flex;
      align-items: center;
      gap: 16px;
    }}
    .logo-container {{
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 800;
      font-size: 1.35rem;
      letter-spacing: -0.02em;
    }}
    .logo-icon {{
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, #0284C7, #38BDF8);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      color: #fff;
      font-size: 1.1rem;
      box-shadow: 0 0 16px rgba(56, 189, 248, 0.5);
    }}
    .badge-pill {{
      background: rgba(56, 189, 248, 0.12);
      border: 1px solid rgba(56, 189, 248, 0.35);
      color: #38BDF8;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      display: flex;
      align-items: center;
      gap: 8px;
    }}
    .dot-live {{
      width: 8px;
      height: 8px;
      background: #10B981;
      border-radius: 50%;
      box-shadow: 0 0 10px #10B981;
    }}
    .page-indicator {{
      font-family: 'JetBrains Mono', monospace;
      font-size: 1.05rem;
      color: #94A3B8;
      background: rgba(255, 255, 255, 0.04);
      padding: 6px 16px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      font-weight: 600;
    }}

    /* Global Footer */
    .footer-bar {{
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding-top: 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.95rem;
      color: #64748B;
    }}
    .footer-bar a {{
      color: #38BDF8;
      text-decoration: none;
      font-weight: 600;
      font-family: 'JetBrains Mono', monospace;
    }}

    /* Typography */
    .section-eyebrow {{
      font-size: 0.95rem;
      font-weight: 800;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: #38BDF8;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 10px;
    }}
    .headline {{
      font-size: 2.85rem;
      font-weight: 800;
      line-height: 1.18;
      letter-spacing: -0.03em;
      color: #FFFFFF;
      margin-bottom: 8px;
    }}
    .text-glow {{
      background: linear-gradient(135deg, #FFFFFF 30%, #38BDF8 85%, #818CF8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }}
    .subtext {{
      font-size: 1.25rem;
      color: #94A3B8;
      line-height: 1.5;
      max-width: 1300px;
      margin-bottom: 24px;
    }}

    /* High-End Glass Cards */
    .glass-card {{
      background: rgba(13, 20, 36, 0.75);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 18px;
      padding: 28px;
      backdrop-filter: blur(20px);
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.4);
      display: flex;
      flex-direction: column;
      position: relative;
    }}
    .glass-card::before {{
      content: '';
      position: absolute;
      top: 0;
      left: 15%;
      right: 15%;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.4), transparent);
    }}

    /* Grids */
    .grid-3 {{
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 28px;
      flex: 1;
      align-content: center;
    }}
    .grid-2 {{
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 28px;
      flex: 1;
      align-content: center;
    }}

    /* Code Terminal Frame */
    .terminal-frame {{
      background: #080C16;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 14px;
      overflow: hidden;
      font-family: 'JetBrains Mono', monospace;
      box-shadow: 0 12px 35px rgba(0, 0, 0, 0.5);
    }}
    .terminal-header {{
      background: rgba(255, 255, 255, 0.04);
      padding: 10px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      font-size: 0.8rem;
      color: #94A3B8;
    }}
    .terminal-dots {{
      display: flex;
      gap: 6px;
    }}
    .dot {{
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }}
    .dot-red {{ background: #EF4444; }}
    .dot-yellow {{ background: #F59E0B; }}
    .dot-green {{ background: #10B981; }}
    .terminal-body {{
      padding: 16px 20px;
      font-size: 0.92rem;
      line-height: 1.6;
    }}

    /* Diff lines */
    .diff-del {{
      background: rgba(239, 68, 68, 0.15);
      color: #FCA5A5;
      padding: 2px 8px;
      border-radius: 4px;
      display: block;
      margin: 3px 0;
      border-left: 3px solid #EF4444;
    }}
    .diff-add {{
      background: rgba(16, 185, 129, 0.15);
      color: #6EE7B7;
      padding: 2px 8px;
      border-radius: 4px;
      display: block;
      margin: 3px 0;
      border-left: 3px solid #10B981;
    }}

    /* Stat Highlight Metric */
    .metric-value {{
      font-size: 3.2rem;
      font-weight: 800;
      letter-spacing: -0.04em;
      line-height: 1;
      margin-bottom: 6px;
    }}
    .metric-label {{
      font-size: 1rem;
      color: #94A3B8;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }}

    /* High-Impact Hero Layout */
    .hero-split {{
      display: grid;
      grid-template-columns: 1.15fr 0.85fr;
      gap: 40px;
      align-items: center;
      flex: 1;
    }}
    .hero-thumbnail {{
      width: 100%;
      height: 520px;
      object-fit: cover;
      border-radius: 22px;
      border: 2px solid rgba(56, 189, 248, 0.4);
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.7), 0 0 35px rgba(56, 189, 248, 0.25);
    }}

    /* Pill list */
    .tech-pill {{
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.12);
      padding: 6px 14px;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      color: #E2E8F0;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }}
  </style>
</head>
<body>

  <!-- ========================================================
       SLIDE 1: EXECUTIVE COVER & HERO
       ======================================================== -->
  <div class="page">
    <div class="header-bar">
      <div class="header-left">
        <div class="logo-container">
          <div class="logo-icon">⚡</div>
          <span>PASHA DEVPILOT</span>
        </div>
        <div class="badge-pill"><span class="dot-live"></span> IBM BOB HACKATHON 2026 // PRODUCTION SUBMISSION</div>
      </div>
      <div class="page-indicator">01 / 08</div>
    </div>

    <div class="hero-split">
      <div>
        <div class="section-eyebrow">⚡ NEXT-GENERATION AUTONOMOUS SDLC</div>
        <h1 class="headline text-glow" style="font-size: 4.2rem; line-height: 1.08;">PASHA DEVPILOT</h1>
        <p class="subtext" style="font-size: 1.4rem; color: #CBD5E1; margin-top: 14px;">
          The enterprise-grade <strong>Autonomous AI Software Engineer</strong> built as an <strong>IBM Bob</strong> extension. Moving beyond chat assistants into deterministic repository inspection, sandboxed verification, and governed Git pull requests.
        </p>

        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 30px 0;">
          <div class="glass-card" style="padding: 18px 22px; border-color: rgba(56, 189, 248, 0.35);">
            <div style="font-size: 0.8rem; font-weight: 700; color: #38BDF8; letter-spacing: 0.05em;">PRIMARY ENGINE</div>
            <div style="font-size: 1.25rem; font-weight: 800; color: #fff; margin-top: 4px;">IBM Bob</div>
            <div style="font-size: 0.8rem; color: #94A3B8;">bob-code-plus</div>
          </div>
          <div class="glass-card" style="padding: 18px 22px; border-color: rgba(168, 85, 247, 0.35);">
            <div style="font-size: 0.8rem; font-weight: 700; color: #A855F7; letter-spacing: 0.05em;">ORCHESTRATION</div>
            <div style="font-size: 1.25rem; font-weight: 800; color: #fff; margin-top: 4px;">7-State Machine</div>
            <div style="font-size: 0.8rem; color: #94A3B8;">Full Audit Trail</div>
          </div>
          <div class="glass-card" style="padding: 18px 22px; border-color: rgba(16, 185, 129, 0.35);">
            <div style="font-size: 0.8rem; font-weight: 700; color: #10B981; letter-spacing: 0.05em;">GOVERNANCE</div>
            <div style="font-size: 1.25rem; font-weight: 800; color: #fff; margin-top: 4px;">Human Gate</div>
            <div style="font-size: 0.8rem; color: #94A3B8;">Mandatory Sign-off</div>
          </div>
        </div>

        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          <span class="tech-pill">Next.js 15 App Router</span>
          <span class="tech-pill">FastAPI Async Core</span>
          <span class="tech-pill">Monaco Diff Editor</span>
          <span class="tech-pill">Isolated Pytest Sandbox</span>
          <span class="tech-pill">Zero-PAT OAuth</span>
        </div>
      </div>

      <div>
        <img src="{thumb_b64}" alt="Pasha DevPilot Platform Visual" class="hero-thumbnail" />
      </div>
    </div>

    <div class="footer-bar">
      <div>Platform Repository: <a href="https://github.com/pasha804/pasha-devpilot" target="_blank">github.com/pasha804/pasha-devpilot</a></div>
      <div>Target Demo: <a href="https://github.com/pasha804/laughing-octo-eureka" target="_blank">laughing-octo-eureka (devpilot/task-0378c47f)</a></div>
    </div>
  </div>


  <!-- ========================================================
       SLIDE 2: THE INDUSTRY CRISIS (WHY CHATBOTS FAIL)
       ======================================================== -->
  <div class="page">
    <div class="header-bar">
      <div class="header-left">
        <div class="logo-container"><div class="logo-icon">⚡</div><span>PASHA DEVPILOT</span></div>
        <div class="badge-pill" style="border-color: rgba(248, 113, 113, 0.4); color: #F87171;"><span class="dot-live" style="background: #F87171; box-shadow: 0 0 10px #F87171;"></span> 01 // THE CORE BOTTLENECK</div>
      </div>
      <div class="page-indicator">02 / 08</div>
    </div>

    <div>
      <div class="section-eyebrow" style="color: #F87171;">THE PROBLEM WITH TODAY'S AI TOOLS</div>
      <h2 class="headline">Why AI Chatbots Fail Real Software Teams</h2>
      <p class="subtext">LLMs write disconnected code snippets in browser sidebars, but real software requires AST context, continuous testing, and enterprise security.</p>
    </div>

    <div class="grid-3">
      <!-- Problem Card 1 -->
      <div class="glass-card" style="border-color: rgba(248, 113, 113, 0.3);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <div style="font-size: 2.2rem;">📋</div>
          <span class="tech-pill" style="color: #F87171; border-color: rgba(248, 113, 113, 0.4);">80% Time Wasted</span>
        </div>
        <h3 style="font-size: 1.45rem; font-weight: 700; color: #F87171; margin-bottom: 10px;">The Copy-Paste Abyss</h3>
        <p style="font-size: 1.05rem; color: #94A3B8; line-height: 1.6; margin-bottom: 16px;">
          Engineers spend hours shuttling code between chat prompts, IDEs, and local git branches. Every manual copy introduces subtle syntax breaks, indent errors, and context loss.
        </p>
        <div class="terminal-frame">
          <div class="terminal-header">
            <span>dev_workflow.log</span>
            <span>FRICTION</span>
          </div>
          <div class="terminal-body" style="color: #FCA5A5; font-size: 0.85rem;">
            [10:14] Copy prompt → ChatGPT<br>
            [10:16] Paste snippet → IDE<br>
            [10:18] Indentation error on line 42<br>
            [10:20] Context lost across 4 files
          </div>
        </div>
      </div>

      <!-- Problem Card 2 -->
      <div class="glass-card" style="border-color: rgba(248, 113, 113, 0.3);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <div style="font-size: 2.2rem;">❌</div>
          <span class="tech-pill" style="color: #F87171; border-color: rgba(248, 113, 113, 0.4);">Zero Verification</span>
        </div>
        <h3 style="font-size: 1.45rem; font-weight: 700; color: #F87171; margin-bottom: 10px;">Untested Hallucinations</h3>
        <p style="font-size: 1.05rem; color: #94A3B8; line-height: 1.6; margin-bottom: 16px;">
          Standard models output code with zero awareness of test suites. They invent non-existent library methods and inverted logic that silently crashes CI/CD pipelines.
        </p>
        <div class="terminal-frame">
          <div class="terminal-header">
            <span>pytest_output.log</span>
            <span style="color: #EF4444;">FAIL</span>
          </div>
          <div class="terminal-body" style="font-size: 0.85rem;">
            <span style="color: #EF4444;">FAILED test_auth.py::test_expired_token</span><br>
            <span style="color: #94A3B8;">> AssertionError: Expected True, got False</span><br>
            <span style="color: #EF4444;">====== 7 failed, 4 passed in 0.42s ======</span>
          </div>
        </div>
      </div>

      <!-- Problem Card 3 -->
      <div class="glass-card" style="border-color: rgba(248, 113, 113, 0.3);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <div style="font-size: 2.2rem;">⚠️</div>
          <span class="tech-pill" style="color: #F87171; border-color: rgba(248, 113, 113, 0.4);">High Security Risk</span>
        </div>
        <h3 style="font-size: 1.45rem; font-weight: 700; color: #F87171; margin-bottom: 10px;">Ungoverned Black Boxes</h3>
        <p style="font-size: 1.05rem; color: #94A3B8; line-height: 1.6; margin-bottom: 16px;">
          Autonomous agents running destructive shell commands (<code style="color: #F87171;">rm -rf, git push --force</code>) or modifying production files without approval are blocked by enterprise compliance.
        </p>
        <div class="terminal-frame">
          <div class="terminal-header">
            <span>security_alert.log</span>
            <span style="color: #EF4444;">BLOCKED</span>
          </div>
          <div class="terminal-body" style="font-size: 0.85rem;">
            <span style="color: #EF4444;">[ALERT] Unauthorized binary: 'rm -rf'</span><br>
            <span style="color: #EF4444;">[ALERT] Force push attempt detected</span><br>
            <span style="color: #F59E0B;">[REASON] Zero human approval gate</span>
          </div>
        </div>
      </div>
    </div>

    <div class="footer-bar">
      <div>Industry Diagnosis • Why Passive LLM Chatbots Cannot Scale to Enterprise SDLC</div>
      <div>Pasha DevPilot Technical Whitepaper</div>
    </div>
  </div>


  <!-- ========================================================
       SLIDE 3: THE SOLUTION — PASHA DEVPILOT
       ======================================================== -->
  <div class="page">
    <div class="header-bar">
      <div class="header-left">
        <div class="logo-container"><div class="logo-icon">⚡</div><span>PASHA DEVPILOT</span></div>
        <div class="badge-pill"><span class="dot-live"></span> 02 // ARCHITECTURAL SOLUTION</div>
      </div>
      <div class="page-indicator">03 / 08</div>
    </div>

    <div>
      <div class="section-eyebrow">PLATFORM VALUE PROPOSITION</div>
      <h2 class="headline text-glow">The Complete Governed AI Software Engineer</h2>
      <p class="subtext">Pasha DevPilot replaces blind chatbots with an autonomous, audited, and self-healing lifecycle engine powered by IBM Bob.</p>
    </div>

    <div class="grid-3">
      <!-- Pillar 1 -->
      <div class="glass-card" style="border-color: rgba(56, 189, 248, 0.4);">
        <div style="font-size: 2.2rem; margin-bottom: 16px;">🧠</div>
        <h3 style="font-size: 1.45rem; font-weight: 700; color: #38BDF8; margin-bottom: 12px;">Real AST Repository Intelligence</h3>
        <p style="font-size: 1.05rem; color: #94A3B8; line-height: 1.6; margin-bottom: 20px;">
          Parses genuine multi-file AST trees. Extracts functions, classes, and cross-file dependencies to identify structural defects, logic inversions, and syntax violations across repositories.
        </p>
        <div style="margin-top: auto; padding: 12px 16px; background: rgba(56, 189, 248, 0.08); border-radius: 10px; border: 1px solid rgba(56, 189, 248, 0.2);">
          <span style="font-size: 0.85rem; font-weight: 700; color: #38BDF8;">FEATURE:</span>
          <span style="font-size: 0.85rem; color: #E2E8F0;"> 1-Click "⚡ Resolve All" bulk defect remediation</span>
        </div>
      </div>

      <!-- Pillar 2 -->
      <div class="glass-card" style="border-color: rgba(16, 185, 129, 0.4);">
        <div style="font-size: 2.2rem; margin-bottom: 16px;">🛡️</div>
        <h3 style="font-size: 1.45rem; font-weight: 700; color: #10B981; margin-bottom: 12px;">Human-in-the-Loop Governance Gate</h3>
        <p style="font-size: 1.05rem; color: #94A3B8; line-height: 1.6; margin-bottom: 20px;">
          Guarantees that no autonomous agent touches production files blindly. The 7-state machine pauses at <code style="color: #10B981;">WAITING_FOR_APPROVAL</code>, requiring explicit engineer sign-off on the remediation plan.
        </p>
        <div style="margin-top: auto; padding: 12px 16px; background: rgba(16, 185, 129, 0.08); border-radius: 10px; border: 1px solid rgba(16, 185, 129, 0.2);">
          <span style="font-size: 0.85rem; font-weight: 700; color: #10B981;">COMPLIANCE:</span>
          <span style="font-size: 0.85rem; color: #E2E8F0;"> Zero code changes without developer approval</span>
        </div>
      </div>

      <!-- Pillar 3 -->
      <div class="glass-card" style="border-color: rgba(168, 85, 247, 0.4);">
        <div style="font-size: 2.2rem; margin-bottom: 16px;">🔄</div>
        <h3 style="font-size: 1.45rem; font-weight: 700; color: #A855F7; margin-bottom: 12px;">Self-Healing Test Sandbox</h3>
        <p style="font-size: 1.05rem; color: #94A3B8; line-height: 1.6; margin-bottom: 20px;">
          Runs real test binaries (<code style="color: #A855F7;">pytest, jest</code>) inside an isolated sandbox. Parses stack traces, autonomously diagnoses failures, refines unified diffs, and re-tests up to 3 cycles.
        </p>
        <div style="margin-top: auto; padding: 12px 16px; background: rgba(168, 85, 247, 0.08); border-radius: 10px; border: 1px solid rgba(168, 85, 247, 0.2);">
          <span style="font-size: 0.85rem; font-weight: 700; color: #A855F7;">AUTONOMY:</span>
          <span style="font-size: 0.85rem; color: #E2E8F0;"> 100% verified test passes before PR creation</span>
        </div>
      </div>
    </div>

    <div class="footer-bar">
      <div>Enterprise Architecture • Controlled Autonomy Powered by IBM Bob</div>
      <div>Pasha DevPilot System Overview</div>
    </div>
  </div>


  <!-- ========================================================
       SLIDE 4: THE 7-STATE ORCHESTRATOR PIPELINE
       ======================================================== -->
  <div class="page">
    <div class="header-bar">
      <div class="header-left">
        <div class="logo-container"><div class="logo-icon">⚡</div><span>PASHA DEVPILOT</span></div>
        <div class="badge-pill"><span class="dot-live"></span> 03 // CORE ORCHESTRATION</div>
      </div>
      <div class="page-indicator">04 / 08</div>
    </div>

    <div>
      <div class="section-eyebrow">DETERMINISTIC LIFECYCLE</div>
      <h2 class="headline text-glow">The 7-State Orchestrator Pipeline</h2>
      <p class="subtext">Every developer request passes through an audited, verifiable, and interruptible state machine.</p>
    </div>

    <div style="display: flex; flex-direction: column; gap: 12px; flex: 1; justify-content: center;">
      <!-- Step 1 -->
      <div class="glass-card" style="padding: 16px 28px; flex-direction: row; align-items: center; justify-content: space-between; border-color: rgba(56, 189, 248, 0.2);">
        <div style="display: flex; align-items: center; gap: 24px;">
          <span style="font-family: 'JetBrains Mono', monospace; font-size: 1rem; font-weight: 800; color: #38BDF8; background: rgba(56, 189, 248, 0.15); padding: 6px 14px; border-radius: 8px; width: 230px; text-align: center;">1. UNDERSTANDING</span>
          <span style="font-size: 1.15rem; font-weight: 600; color: #F1F5F9;">Traverses repository file tree, parses AST symbols, and constructs cross-module dependency graphs.</span>
        </div>
        <span class="tech-pill">AST PARSING</span>
      </div>

      <!-- Step 2 -->
      <div class="glass-card" style="padding: 16px 28px; flex-direction: row; align-items: center; justify-content: space-between; border-color: rgba(56, 189, 248, 0.2);">
        <div style="display: flex; align-items: center; gap: 24px;">
          <span style="font-family: 'JetBrains Mono', monospace; font-size: 1rem; font-weight: 800; color: #38BDF8; background: rgba(56, 189, 248, 0.15); padding: 6px 14px; border-radius: 8px; width: 230px; text-align: center;">2. INVESTIGATING</span>
          <span style="font-size: 1.15rem; font-weight: 600; color: #F1F5F9;">Generates a comprehensive 20-section architectural finding report analyzing failing test root causes.</span>
        </div>
        <span class="tech-pill">ROOT CAUSE</span>
      </div>

      <!-- Step 3 -->
      <div class="glass-card" style="padding: 16px 28px; flex-direction: row; align-items: center; justify-content: space-between; border-color: rgba(56, 189, 248, 0.2);">
        <div style="display: flex; align-items: center; gap: 24px;">
          <span style="font-family: 'JetBrains Mono', monospace; font-size: 1rem; font-weight: 800; color: #38BDF8; background: rgba(56, 189, 248, 0.15); padding: 6px 14px; border-radius: 8px; width: 230px; text-align: center;">3. PLANNING</span>
          <span style="font-size: 1.15rem; font-weight: 600; color: #F1F5F9;">Produces step-by-step remediation plans with explicit file boundary definitions and targeted patches.</span>
        </div>
        <span class="tech-pill">STRATEGY</span>
      </div>

      <!-- Step 4 (HUMAN GATE) -->
      <div class="glass-card" style="padding: 16px 28px; flex-direction: row; align-items: center; justify-content: space-between; border-color: #10B981; background: rgba(16, 185, 129, 0.12);">
        <div style="display: flex; align-items: center; gap: 24px;">
          <span style="font-family: 'JetBrains Mono', monospace; font-size: 1rem; font-weight: 800; color: #10B981; background: rgba(16, 185, 129, 0.25); padding: 6px 14px; border-radius: 8px; width: 230px; text-align: center;">4. APPROVAL GATE</span>
          <span style="font-size: 1.15rem; font-weight: 700; color: #FFFFFF;">MANDATORY HUMAN GATE: Pipeline halts. Human engineer inspects plan and clicks 'Approve'.</span>
        </div>
        <span class="tech-pill" style="border-color: #10B981; color: #10B981; background: rgba(16, 185, 129, 0.2);">HUMAN SIGN-OFF</span>
      </div>

      <!-- Step 5 -->
      <div class="glass-card" style="padding: 16px 28px; flex-direction: row; align-items: center; justify-content: space-between; border-color: rgba(168, 85, 247, 0.2);">
        <div style="display: flex; align-items: center; gap: 24px;">
          <span style="font-family: 'JetBrains Mono', monospace; font-size: 1rem; font-weight: 800; color: #A855F7; background: rgba(168, 85, 247, 0.15); padding: 6px 14px; border-radius: 8px; width: 230px; text-align: center;">5. IMPLEMENTING</span>
          <span style="font-size: 1.15rem; font-weight: 600; color: #F1F5F9;">Applies clean unified diffs in an isolated sandbox workspace with automated rollback capabilities.</span>
        </div>
        <span class="tech-pill">UNIFIED DIFF</span>
      </div>

      <!-- Step 6 -->
      <div class="glass-card" style="padding: 16px 28px; flex-direction: row; align-items: center; justify-content: space-between; border-color: rgba(168, 85, 247, 0.2);">
        <div style="display: flex; align-items: center; gap: 24px;">
          <span style="font-family: 'JetBrains Mono', monospace; font-size: 1rem; font-weight: 800; color: #A855F7; background: rgba(168, 85, 247, 0.15); padding: 6px 14px; border-radius: 8px; width: 230px; text-align: center;">6. VERIFYING</span>
          <span style="font-size: 1.15rem; font-weight: 600; color: #F1F5F9;">Executes test suite binaries; autonomously diagnoses tracebacks and repairs defects (max 3 cycles).</span>
        </div>
        <span class="tech-pill">SELF-HEALING</span>
      </div>

      <!-- Step 7 -->
      <div class="glass-card" style="padding: 16px 28px; flex-direction: row; align-items: center; justify-content: space-between; border-color: rgba(56, 189, 248, 0.35);">
        <div style="display: flex; align-items: center; gap: 24px;">
          <span style="font-family: 'JetBrains Mono', monospace; font-size: 1rem; font-weight: 800; color: #38BDF8; background: rgba(56, 189, 248, 0.15); padding: 6px 14px; border-radius: 8px; width: 230px; text-align: center;">7. REVIEWING</span>
          <span style="font-size: 1.15rem; font-weight: 600; color: #F1F5F9;">Presents Monaco visual diff editor with line additions/deletions and 1-Click 'Commit & Push to GitHub'.</span>
        </div>
        <span class="tech-pill">MONACO & GIT</span>
      </div>
    </div>

    <div class="footer-bar">
      <div>Source Implementation: packages/agent_core/orchestrator/state_machine.py</div>
      <div>IBM Bob Hackathon 2026</div>
    </div>
  </div>


  <!-- ========================================================
       SLIDE 5: DEEP IBM BOB INTEGRATION
       ======================================================== -->
  <div class="page">
    <div class="header-bar">
      <div class="header-left">
        <div class="logo-container"><div class="logo-icon">⚡</div><span>PASHA DEVPILOT</span></div>
        <div class="badge-pill" style="border-color: rgba(168, 85, 247, 0.4); color: #A855F7;"><span class="dot-live" style="background: #A855F7; box-shadow: 0 0 10px #A855F7;"></span> 04 // AI FOUNDATION</div>
      </div>
      <div class="page-indicator">05 / 08</div>
    </div>

    <div>
      <div class="section-eyebrow" style="color: #A855F7;">PRIMARY AI PROVIDER</div>
      <h2 class="headline text-glow">Deep IBM Bob Integration</h2>
      <p class="subtext">IBM Bob is the primary AI provider driving code reasoning, planning, and verification across every pipeline state.</p>
    </div>

    <div class="grid-2">
      <!-- Bob Card 1 -->
      <div class="glass-card" style="border-color: rgba(56, 189, 248, 0.35);">
        <div style="font-size: 2.2rem; margin-bottom: 14px;">⚡</div>
        <h3 style="font-size: 1.45rem; font-weight: 700; color: #38BDF8; margin-bottom: 10px;">Native BobProvider Architecture</h3>
        <p style="font-size: 1.05rem; color: #94A3B8; line-height: 1.6; margin-bottom: 16px;">
          Extends <code style="color: #38BDF8;">CleanAPIsProvider</code> to inject specialized DevPilot SDLC system preambles. Enforces structured output schemas, precise syntax boundaries, and deterministic code generation.
        </p>
        <div class="terminal-frame">
          <div class="terminal-header"><span>bob_provider.py</span><span>CORE</span></div>
          <div class="terminal-body" style="font-size: 0.85rem; color: #CBD5E1;">
            <span style="color: #38BDF8;">class BobProvider(CleanAPIsProvider):</span><br>
            &nbsp;&nbsp;def _inject_sdlc_preamble(self, messages):<br>
            &nbsp;&nbsp;&nbsp;&nbsp;return [DEVPILOT_SDLC_SYSTEM_PROMPT] + messages
          </div>
        </div>
      </div>

      <!-- Bob Card 2 -->
      <div class="glass-card" style="border-color: rgba(168, 85, 247, 0.35);">
        <div style="font-size: 2.2rem; margin-bottom: 14px;">🔀</div>
        <h3 style="font-size: 1.45rem; font-weight: 700; color: #A855F7; margin-bottom: 10px;">Intelligent ModelRouter Selection</h3>
        <p style="font-size: 1.05rem; color: #94A3B8; line-height: 1.6; margin-bottom: 16px;">
          Automatically detects <code style="color: #A855F7;">BOB_API_KEY</code> and routes all development tasks to <code style="color: #A855F7;">bob-code-plus</code>. Seamlessly orchestrates fallback providers for high-availability test verification.
        </p>
        <div class="terminal-frame">
          <div class="terminal-header"><span>router.py</span><span>DISPATCH</span></div>
          <div class="terminal-body" style="font-size: 0.85rem; color: #CBD5E1;">
            <span style="color: #A855F7;">if config.BOB_API_KEY:</span><br>
            &nbsp;&nbsp;return BobProvider(model=config.BOB_MODEL)<br>
            <span style="color: #94A3B8;"># Resilient multi-tier verification fallback</span>
          </div>
        </div>
      </div>

      <!-- Bob Card 3 -->
      <div class="glass-card" style="border-color: rgba(16, 185, 129, 0.35);">
        <div style="font-size: 2.2rem; margin-bottom: 14px;">🔍</div>
        <h3 style="font-size: 1.45rem; font-weight: 700; color: #10B981; margin-bottom: 10px;">Dynamic UI Model Attribution</h3>
        <p style="font-size: 1.05rem; color: #94A3B8; line-height: 1.6;">
          Real-time model attribution on the Dashboard, Pipeline Visualizer, Task Monitor, and Settings page dynamically queries backend settings to display the exact active AI model with zero hardcoded badges.
        </p>
      </div>

      <!-- Bob Card 4 -->
      <div class="glass-card" style="border-color: rgba(248, 113, 113, 0.35);">
        <div style="font-size: 2.2rem; margin-bottom: 14px;">🔐</div>
        <h3 style="font-size: 1.45rem; font-weight: 700; color: #F87171; margin-bottom: 10px;">Zero-Leakage Credential Masking</h3>
        <p style="font-size: 1.05rem; color: #94A3B8; line-height: 1.6;">
          Cryptographic token redacting filters intercept all model prompts, execution stdout, and UI responses. Tokens matching <code style="color: #F87171;">ghp_*, sk-*, cc_*</code> are redacted before persistent storage or display.
        </p>
      </div>
    </div>

    <div class="footer-bar">
      <div>IBM Bob Provider: packages/agent_core/providers/bob_provider.py</div>
      <div>IBM Bob Hackathon 2026</div>
    </div>
  </div>


  <!-- ========================================================
       SLIDE 6: ENTERPRISE SECURITY & DEFENSE-IN-DEPTH
       ======================================================== -->
  <div class="page">
    <div class="header-bar">
      <div class="header-left">
        <div class="logo-container"><div class="logo-icon">⚡</div><span>PASHA DEVPILOT</span></div>
        <div class="badge-pill" style="border-color: rgba(16, 185, 129, 0.4); color: #10B981;"><span class="dot-live"></span> 05 // SECURITY & COMPLIANCE</div>
      </div>
      <div class="page-indicator">06 / 08</div>
    </div>

    <div>
      <div class="section-eyebrow" style="color: #10B981;">SAFE AUTONOMOUS EXECUTION</div>
      <h2 class="headline text-glow">Enterprise Security & Sandbox Isolation</h2>
      <p class="subtext">Restricted execution engine enforcing command allowlisting, path traversal lockdown, and zero-PAT authorization.</p>
    </div>

    <div class="grid-2">
      <!-- Security 1 -->
      <div class="glass-card" style="border-color: rgba(248, 113, 113, 0.4);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
          <h3 style="font-size: 1.45rem; font-weight: 700; color: #F87171;">🚫 Strict Command Allowlisting</h3>
          <span class="tech-pill" style="color: #F87171;">BLOCKED</span>
        </div>
        <p style="font-size: 1.05rem; color: #94A3B8; line-height: 1.6; margin-bottom: 16px;">
          The execution sandbox blocks destructive shell commands before they can run. Any attempt to invoke dangerous binaries immediately aborts task execution.
        </p>
        <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 14px;">
          <span class="tech-pill" style="color: #F87171; border-color: #F87171; text-decoration: line-through;">rm -rf</span>
          <span class="tech-pill" style="color: #F87171; border-color: #F87171; text-decoration: line-through;">del /f</span>
          <span class="tech-pill" style="color: #F87171; border-color: #F87171; text-decoration: line-through;">shutdown</span>
          <span class="tech-pill" style="color: #F87171; border-color: #F87171; text-decoration: line-through;">curl | bash</span>
          <span class="tech-pill" style="color: #F87171; border-color: #F87171; text-decoration: line-through;">git push --force</span>
          <span class="tech-pill" style="color: #F87171; border-color: #F87171; text-decoration: line-through;">git clean -f</span>
        </div>
        <div style="font-size: 0.9rem; color: #10B981; font-weight: 600;">
          ✓ ONLY APPROVED TEST BINARIES PERMITTED: pytest, npm test, jest, vitest, cargo test, go test
        </div>
      </div>

      <!-- Security 2 -->
      <div class="glass-card" style="border-color: rgba(56, 189, 248, 0.4);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
          <h3 style="font-size: 1.45rem; font-weight: 700; color: #38BDF8;">🔒 Directory Traversal Lockdown</h3>
          <span class="tech-pill" style="color: #38BDF8;">SANDBOXED</span>
        </div>
        <p style="font-size: 1.05rem; color: #94A3B8; line-height: 1.6; margin-bottom: 16px;">
          Task workspaces are strictly isolated inside ephemeral directory containers. Any relative path attempts containing <code style="color: #38BDF8;">../</code> or paths escaping the sandbox root are blocked at the kernel boundary.
        </p>
        <div class="terminal-frame">
          <div class="terminal-header"><span>sandbox_service.py</span><span>JAIL GUARD</span></div>
          <div class="terminal-body" style="font-size: 0.85rem; color: #CBD5E1;">
            if not target_path.resolve().is_relative_to(sandbox_root):<br>
            &nbsp;&nbsp;raise SandboxSecurityViolation("Path traversal outside sandbox blocked.")
          </div>
        </div>
      </div>

      <!-- Security 3 -->
      <div class="glass-card" style="border-color: rgba(168, 85, 247, 0.4);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
          <h3 style="font-size: 1.45rem; font-weight: 700; color: #A855F7;">👥 Zero-PAT GitHub Authentication</h3>
          <span class="tech-pill" style="color: #A855F7;">OAUTH</span>
        </div>
        <p style="font-size: 1.05rem; color: #94A3B8; line-height: 1.6;">
          Engineers never expose personal access tokens to AI models. DevPilot uses secure, ephemeral JWT sessions with GitHub OAuth. All Git pushes and branch operations authenticate via isolated backend tokens.
        </p>
      </div>

      <!-- Security 4 -->
      <div class="glass-card" style="border-color: rgba(16, 185, 129, 0.4);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
          <h3 style="font-size: 1.45rem; font-weight: 700; color: #10B981;">📊 Microsecond Audit Log Trail</h3>
          <span class="tech-pill" style="color: #10B981;">AUDITED</span>
        </div>
        <p style="font-size: 1.05rem; color: #94A3B8; line-height: 1.6;">
          Every agent reasoning thought, tool parameter, unified diff application, test stdout, and state change is immutably logged into SQLite/PostgreSQL with millisecond timestamps for enterprise compliance.
        </p>
      </div>
    </div>

    <div class="footer-bar">
      <div>Security Implementation: apps/api/services/sandbox_service.py</div>
      <div>IBM Bob Hackathon 2026</div>
    </div>
  </div>


  <!-- ========================================================
       SLIDE 7: REAL-WORLD REPOSITORY VALIDATION (LIVE PROOF)
       ======================================================== -->
  <div class="page">
    <div class="header-bar">
      <div class="header-left">
        <div class="logo-container"><div class="logo-icon">⚡</div><span>PASHA DEVPILOT</span></div>
        <div class="badge-pill" style="border-color: rgba(16, 185, 129, 0.4); color: #10B981;"><span class="dot-live"></span> 06 // LIVE PRODUCTION PROOF</div>
      </div>
      <div class="page-indicator">07 / 08</div>
    </div>

    <div>
      <div class="section-eyebrow">EMPIRICAL VALIDATION</div>
      <h2 class="headline text-glow">Real Code, Real AST Bugs, Real Remediation</h2>
      <p class="subtext">Demonstrated live on active repository: <strong>pasha804/laughing-octo-eureka</strong></p>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; flex: 1; align-content: center;">
      <!-- Left: Real AST Diff -->
      <div class="glass-card" style="border-color: rgba(56, 189, 248, 0.4);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
          <h3 style="font-size: 1.35rem; font-weight: 700; color: #38BDF8;">Unified Diff Preview (src/auth_service.py)</h3>
          <span class="tech-pill">AST REPAIRED</span>
        </div>
        <p style="font-size: 0.95rem; color: #94A3B8; margin-bottom: 14px;">
          The agent parsed AST tokens, identified that the comparison operator inverted token validity, and applied an exact surgical unified diff patch.
        </p>
        <div class="terminal-frame">
          <div class="terminal-header">
            <span>src/auth_service.py — Unified Diff</span>
            <span style="color: #10B981;">MODIFIED</span>
          </div>
          <div class="terminal-body" style="font-size: 0.88rem;">
            <span style="color: #94A3B8;">@@ -31,6 +31,6 @@ def is_token_expired(token_data: dict) -> bool:</span><br>
            <span style="color: #94A3B8;">&nbsp;&nbsp;&nbsp;&nbsp;now = datetime.utcnow()</span><br>
            <span class="diff-del">-&nbsp;&nbsp;&nbsp;return now &lt; token_data["exp"]&nbsp;&nbsp;# BUG: Active tokens marked expired!</span>
            <span class="diff-add">+&nbsp;&nbsp;&nbsp;return now &gt;= token_data["exp"] # FIXED: Proper expiration boundary</span>
            <span style="color: #94A3B8;">&nbsp;&nbsp;&nbsp;&nbsp;return False</span>
          </div>
        </div>
        <div style="margin-top: 14px; font-size: 0.85rem; color: #CBD5E1;">
          ⚡ Also resolved: Coupon discount division by zero in <code style="color: #38BDF8;">src/billing_service.py</code> and sliding window timestamp errors in <code style="color: #38BDF8;">src/rate_limiter.py</code>.
        </div>
      </div>

      <!-- Right: Real Test Execution -->
      <div class="glass-card" style="border-color: rgba(16, 185, 129, 0.4);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
          <h3 style="font-size: 1.35rem; font-weight: 700; color: #10B981;">Sandbox Verification & Git Push</h3>
          <span class="tech-pill" style="border-color: #10B981; color: #10B981;">100% PASS</span>
        </div>
        <p style="font-size: 0.95rem; color: #94A3B8; margin-bottom: 14px;">
          Test suite transitioned from 7 broken test assertions to 11 passing tests in the sandbox, followed by automated branch creation and remote Git push.
        </p>
        <div class="terminal-frame">
          <div class="terminal-header">
            <span>sandbox/pytest_runner.stdout</span>
            <span style="color: #10B981;">PASSED</span>
          </div>
          <div class="terminal-body" style="font-size: 0.88rem;">
            <span style="color: #94A3B8;">$ pytest tests/ -v</span><br>
            <span style="color: #10B981;">tests/test_auth.py::test_expired_token PASSED</span><br>
            <span style="color: #10B981;">tests/test_auth.py::test_valid_token PASSED</span><br>
            <span style="color: #10B981;">tests/test_billing.py::test_coupon_calc PASSED</span><br>
            <span style="color: #10B981;">tests/test_rate_limiter.py::test_window PASSED</span><br>
            <span style="color: #10B981; font-weight: 700;">================ 11 passed in 0.38s ================</span><br>
            <span style="color: #38BDF8;">[GIT] Pushed branch 'devpilot/task-0378c47f' to origin</span><br>
            <span style="color: #10B981;">[PULL REQUEST] PR URL generated for team review</span>
          </div>
        </div>
        <div style="margin-top: 14px; font-size: 0.85rem; color: #CBD5E1;">
          🔗 Remote Branch: <code style="color: #10B981;">https://github.com/pasha804/laughing-octo-eureka/tree/devpilot/task-0378c47f</code>
        </div>
      </div>
    </div>

    <div class="footer-bar">
      <div>Live Test Results • Automated Verification on laughing-octo-eureka</div>
      <div>IBM Bob Hackathon 2026</div>
    </div>
  </div>


  <!-- ========================================================
       SLIDE 8: SUMMARY & LINKS
       ======================================================== -->
  <div class="page">
    <div class="header-bar">
      <div class="header-left">
        <div class="logo-container"><div class="logo-icon">⚡</div><span>PASHA DEVPILOT</span></div>
        <div class="badge-pill"><span class="dot-live"></span> 07 // CONCLUSION & LINKS</div>
      </div>
      <div class="page-indicator">08 / 08</div>
    </div>

    <div>
      <div class="section-eyebrow">FINAL VERDICT</div>
      <h2 class="headline text-glow">The Future of Governed Software Autonomy</h2>
      <p class="subtext">Pasha DevPilot is fully coded, integrated with IBM Bob, tested against live repositories, and ready for deployment.</p>
    </div>

    <!-- 4 High Impact Stat Cards -->
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; margin-bottom: 28px;">
      <div class="glass-card" style="align-items: center; text-align: center; border-color: rgba(56, 189, 248, 0.4);">
        <div class="metric-value" style="color: #38BDF8;">IBM Bob</div>
        <div class="metric-label">Primary AI Core</div>
      </div>
      <div class="glass-card" style="align-items: center; text-align: center; border-color: rgba(16, 185, 129, 0.4);">
        <div class="metric-value" style="color: #10B981;">100%</div>
        <div class="metric-label">Test Pass Rate</div>
      </div>
      <div class="glass-card" style="align-items: center; text-align: center; border-color: rgba(168, 85, 247, 0.4);">
        <div class="metric-value" style="color: #A855F7;">7-State</div>
        <div class="metric-label">Orchestrator Engine</div>
      </div>
      <div class="glass-card" style="align-items: center; text-align: center; border-color: rgba(248, 113, 113, 0.4);">
        <div class="metric-value" style="color: #F87171;">0</div>
        <div class="metric-label">PAT Token Leaks</div>
      </div>
    </div>

    <!-- Master Links Card -->
    <div class="glass-card" style="padding: 32px; border-color: rgba(56, 189, 248, 0.4); flex: 1; justify-content: space-around;">
      <div style="font-size: 1.35rem; font-weight: 700; color: #FFFFFF; margin-bottom: 8px;">
        Evaluation Links & Hackathon Artifacts
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; font-size: 1.1rem; line-height: 1.8;">
        <div>
          <p>🔗 <strong>Platform Repository:</strong></p>
          <p style="font-family: 'JetBrains Mono', monospace; color: #38BDF8;">https://github.com/pasha804/pasha-devpilot</p>
          
          <p style="margin-top: 14px;">🔗 <strong>Demo Target Repository:</strong></p>
          <p style="font-family: 'JetBrains Mono', monospace; color: #38BDF8;">https://github.com/pasha804/laughing-octo-eureka</p>
        </div>
        <div>
          <p>⚡ <strong>Active Remediated Branch (11/11 tests pass):</strong></p>
          <p style="font-family: 'JetBrains Mono', monospace; color: #10B981;">devpilot/task-0378c47f</p>
          
          <p style="margin-top: 14px;">📦 <strong>Complete Architecture:</strong></p>
          <p style="color: #CBD5E1;">Next.js 15 + FastAPI Async + Monaco Diff + IBM Bob</p>
        </div>
      </div>
    </div>

    <div class="footer-bar">
      <div>IBM Bob Hackathon 2026 • Official Project Submission</div>
      <div>Pasha DevPilot Engineering Team</div>
    </div>
  </div>

</body>
</html>
"""

    deck_html_path = os.path.join(os.getcwd(), "deck_printable.html")
    with open(deck_html_path, "w", encoding="utf-8") as f:
        f.write(html_content)

    pdf_output_path = os.path.join(os.getcwd(), "Pasha_DevPilot_Pitch_Deck.pdf")
    chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
    
    cmd = [
        chrome_path,
        "--headless",
        "--disable-gpu",
        "--run-all-compositor-stages-before-draw",
        "--no-pdf-header-footer",
        f"--print-to-pdf={pdf_output_path}",
        f"file:///{deck_html_path.replace(os.sep, '/')}"
    ]
    
    print("Exporting ultra high-end PDF using headless Chrome...")
    res = subprocess.run(cmd, capture_output=True, text=True)
    if os.path.exists(pdf_output_path):
        size_kb = os.path.getsize(pdf_output_path) / 1024
        print(f"SUCCESS: Ultra high-end PDF created at {pdf_output_path} ({size_kb:.2f} KB)")
    else:
        print(f"FAILED: {res.stderr}")

if __name__ == "__main__":
    generate_high_end_pdf()
