"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  CheckCircle2,
  FolderGit2,
  Sparkles,
  ArrowRight,
  Lock,
  GitPullRequest,
  Terminal,
  Activity,
  Layers,
  Code2,
  FileText,
  Zap,
  Cpu,
  Search,
  Check,
  Play,
  Pause,
  RotateCw,
  GitBranch,
  Shield,
  Eye,
  Sliders,
  ChevronRight,
  FileCode2,
  AlertTriangle,
} from "lucide-react";
import { api } from "@/lib/api";

export default function LandingPage() {
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);
  const [demoStep, setDemoStep] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // 9-Step Interactive Demo Workflow with live simulated payloads
  const workflowSteps = [
    {
      title: "Connect GitHub",
      stepNum: "01",
      badge: "OAuth 2.0 App",
      category: "AUTHENTICATION",
      desc: "Instant 1-click GitHub authorization. Zero manual Personal Access Token (PAT) copy-pasting.",
      actionPreview: "GET /api/github/oauth/authorize?scope=repo,read:user",
      statusText: "Authorized as @pasha-dev · Public & Private Repositories Loaded",
      payloadType: "auth",
    },
    {
      title: "Repository Detected",
      stepNum: "02",
      badge: "Target Scope",
      category: "DISCOVERY",
      desc: "Selected 'nexora-backend'. Excludes sensitive files (.env, *.pem, secrets) from AI context.",
      actionPreview: "POST /api/repositories/select --target=nexora-backend",
      statusText: "FastAPI · Python 3.14 · PostgreSQL · Pytest · Sensitive Shield Active",
      payloadType: "repo",
    },
    {
      title: "AI Analysis",
      stepNum: "03",
      badge: "DeepSeek V4 Flash",
      category: "INTELLIGENCE",
      desc: "Read-only AST symbol parsing produces 20-Section Engineering Report with verifiable findings.",
      actionPreview: "POST /api/analysis/generate --model=deepseek-v4-flash-0731",
      statusText: "20 Sections Formulated · Found Inverted Expiration Bug (AUTH-002)",
      payloadType: "analysis",
    },
    {
      title: "Implementation Plan",
      stepNum: "04",
      badge: "Human-in-the-Loop",
      category: "APPROVAL GATE",
      desc: "Audited step-by-step strategy with affected files, risk ratings, and verification commands.",
      actionPreview: "PLAN_PENDING: Waiting for developer authorization checkpoint",
      statusText: "GATE ARMED: AI cannot modify files without explicit user approval",
      payloadType: "plan",
    },
    {
      title: "Sandbox Workspace",
      stepNum: "05",
      badge: "Filesystem Jail",
      category: "ISOLATION",
      desc: "Dedicated isolated sandbox created. Main branch and remote repository remain untouched.",
      actionPreview: "mkdir -p /workspaces/devpilot-sandbox-0189a && git checkout -b agent-work",
      statusText: "Sandbox Initialized · Resource Limits Applied · Path Traversal Blocked",
      payloadType: "sandbox",
    },
    {
      title: "Targeted Changes",
      stepNum: "06",
      badge: "Surgical Patch",
      category: "MODIFICATION",
      desc: "Applies precision unified diff. Fixes token expiration logic without touching unrelated lines.",
      actionPreview: "PATCH src/auth_service.py:37 [ < replaced with > ]",
      statusText: "src/auth_service.py: 1 insertion(+), 1 deletion(-) · Hash verified",
      payloadType: "diff",
    },
    {
      title: "Verification Tests",
      stepNum: "07",
      badge: "Pytest Runner",
      category: "VERIFICATION",
      desc: "Real test suite executed in sandbox. If tests fail, bounded self-healing attempts up to 3 fixes.",
      actionPreview: "sandbox-exec: pytest tests/test_auth.py -v --tb=short",
      statusText: "2 passed in 0.12s · Exit Code: 0 · 100% Test Suite Passage",
      payloadType: "test",
    },
    {
      title: "Diff Review",
      stepNum: "08",
      badge: "Monaco Editor",
      category: "HUMAN REVIEW",
      desc: "Side-by-side unified diff review with additions, deletions, risk metrics, and interactive AI Q&A.",
      actionPreview: "MONACO_DIFF: src/auth_service.py (+1 / -1) · Risk: Low",
      statusText: "Review Workspace Ready · Developer inspected & authorized changes",
      payloadType: "review",
    },
    {
      title: "Pull Request Created",
      stepNum: "09",
      badge: "Truthful Git PR",
      category: "SHIP TO GITHUB",
      desc: "Clean branch created (`devpilot/task-1042`), conventional commit pushed, and rich PR published.",
      actionPreview: "git push origin devpilot/fix-auth-expiration-1042 && gh pr create",
      statusText: "PR #142 Published · Contains full test verification logs & checklist",
      payloadType: "pr",
    },
  ];

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setDemoStep((prev) => (prev + 1) % workflowSteps.length);
    }, 3200);
    return () => clearInterval(timer);
  }, [isAutoPlaying, workflowSteps.length]);

  const handleConnectGitHub = async () => {
    setIsConnecting(true);
    try {
      const authInfo = await api.getGitHubAuthUrl();
      if (authInfo.is_configured && authInfo.url) {
        window.location.href = authInfo.url;
      } else {
        router.push("/repositories?connect=true");
      }
    } catch {
      router.push("/repositories?connect=true");
    } finally {
      setIsConnecting(false);
    }
  };

  const activeDemo = workflowSteps[demoStep];

  return (
    <div className="min-h-screen cyber-bg text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Laser Ambient Beam */}
      <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80" />

      {/* Floating High-Tech Header */}
      <nav className="border-b border-cyan-500/20 bg-[#06080f]/80 backdrop-blur-xl sticky top-0 z-50 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 via-sky-500 to-indigo-600 flex items-center justify-center font-black text-slate-950 text-sm shadow-[0_0_20px_rgba(0,240,255,0.4)]">
            PD
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-tight text-white">
                Pasha DevPilot
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 font-mono font-semibold flex items-center gap-1 shadow-[0_0_8px_rgba(0,240,255,0.2)]">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                AI ENGINEER
              </span>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-7 text-xs font-medium text-slate-400">
          <a href="#workflow-flow" className="hover:text-cyan-300 transition-colors flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            Living Flow
          </a>
          <a href="#intelligence" className="hover:text-cyan-300 transition-colors flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            20-Section Report
          </a>
          <a href="#sandbox" className="hover:text-cyan-300 transition-colors flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            Sandbox Isolation
          </a>
          <a href="#verification" className="hover:text-cyan-300 transition-colors flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-amber-400" />
            Self-Healing Test
          </a>
          <a href="#architecture" className="hover:text-cyan-300 transition-colors">
            Architecture
          </a>
          <a href="#security" className="hover:text-cyan-300 transition-colors">
            Zero-PAT Security
          </a>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleConnectGitHub}
            disabled={isConnecting}
            className="group relative flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-xs shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all active:scale-95"
          >
            <Zap className="w-3.5 h-3.5 fill-slate-950" />
            <span>{isConnecting ? "Connecting..." : "Connect GitHub"}</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </nav>

      {/* 1. HERO SECTION */}
      <section className="relative px-6 pt-24 pb-20 max-w-6xl mx-auto text-center">
        {/* Glow Spheres */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[360px] bg-cyan-500/15 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[200px] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />

        {/* Brand & Badge Pill */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-xs text-cyan-300 font-mono mb-8 shadow-[0_0_20px_rgba(0,240,255,0.15)]">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-bold tracking-wider uppercase text-[11px]">Pasha Dev • Pasha DevPilot 2.0</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-300">Powered by DeepSeek V4 Flash & Groq</span>
        </div>

        {/* Monumental Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white max-w-5xl mx-auto leading-[1.1]">
          Your Autonomous{" "}
          <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-purple-400 bg-clip-text text-transparent">
            AI Software Engineer.
          </span>
        </h1>

        <p className="mt-4 text-lg sm:text-2xl font-medium text-slate-300 tracking-tight">
          Understand. Analyze. Plan. Build. Verify. Review. Ship.
        </p>

        <p className="mt-6 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Connect your GitHub repository. DevPilot indexes your AST symbols, generates a 20-Section Engineering Report, formulates surgical implementation plans, executes code changes in isolated sandboxes, truthfully verifies tests, and opens ready-to-ship Pull Requests.
        </p>

        {/* CTA Group */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={handleConnectGitHub}
            disabled={isConnecting}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-sm shadow-[0_0_30px_rgba(0,240,255,0.4)] transition-all active:scale-95"
          >
            <Zap className="w-4 h-4 fill-slate-950" />
            <span>Connect GitHub (Zero PAT)</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>

          <a
            href="#workflow-flow"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-700 text-slate-200 hover:text-white font-semibold text-sm transition-all shadow-lg"
          >
            <Play className="w-4 h-4 text-cyan-400" />
            <span>Explore Living Workflow Demo</span>
          </a>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Zero PAT Token Pasting</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span>Human-in-the-Loop Gate</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-purple-400" />
            <span>Bounded Self-Healing (Max 3)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
            <span>Monaco Diff Review</span>
          </div>
        </div>
      </section>

      {/* 2. LIVING PIPELINE FLOW & INTERACTIVE SIMULATION (User Core Request) */}
      <section id="workflow-flow" className="px-6 py-16 max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-xs font-mono text-cyan-300 mb-3">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            <span>THE 9-STAGE LIVING PIPELINE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Watch the Autonomous Laser Flow in Action
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto mt-2">
            No mockups. No fake terminal logs. Follow the exact path from repository discovery to verified pull request.
          </p>
        </div>

        {/* Master Flow Container */}
        <div className="glass-panel-elevated rounded-2xl p-6 sm:p-8 border border-cyan-500/25 relative overflow-hidden">
          {/* Ambient Corner Illumination */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-800 relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="font-mono text-xs text-slate-400 ml-2">
                Pasha DevPilot Autonomous Pipeline Simulator
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 hover:text-white transition-colors"
              >
                {isAutoPlaying ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
                <span>{isAutoPlaying ? "Pause Flow" : "Resume Flow"}</span>
              </button>

              <button
                onClick={() => setDemoStep((prev) => (prev + 1) % workflowSteps.length)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-xs font-mono text-cyan-300 hover:bg-cyan-900/60 transition-colors"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Next Stage</span>
              </button>

              <span className="text-[11px] font-mono px-3 py-1 rounded-lg bg-cyan-950 border border-cyan-400 text-cyan-300 font-bold shadow-[0_0_10px_rgba(0,240,255,0.3)]">
                STAGE {demoStep + 1} OF 9: {activeDemo.category}
              </span>
            </div>
          </div>

          {/* Interactive Stepper Rail with Active Traveling Laser */}
          <div className="mt-8 relative z-10">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-2.5 relative">
              {workflowSteps.map((step, idx) => {
                const isActive = idx === demoStep;
                const isPassed = idx < demoStep;

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setDemoStep(idx);
                      setIsAutoPlaying(false);
                    }}
                    className={`relative p-3 rounded-xl border text-left font-mono transition-all duration-300 flex flex-col justify-between min-h-[92px] ${
                      isActive
                        ? "bg-[#0d1629] border-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.35)] ring-1 ring-cyan-400/60 scale-105 z-20"
                        : isPassed
                        ? "bg-[#09151e]/80 border-emerald-500/40 text-emerald-400 hover:border-emerald-400"
                        : "bg-[#080d1a]/80 border-slate-800/80 text-slate-500 hover:border-slate-700"
                    }`}
                  >
                    {/* Top Row */}
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className={`text-[10px] font-bold ${isActive ? "text-cyan-300" : isPassed ? "text-emerald-400" : "text-slate-500"}`}>
                        {step.stepNum}
                      </span>
                      {isPassed ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : isActive ? (
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                      )}
                    </div>

                    {/* Step Title */}
                    <div>
                      <p className={`text-xs font-bold truncate leading-tight ${isActive ? "text-white" : isPassed ? "text-emerald-200" : "text-slate-400"}`}>
                        {step.title}
                      </p>
                      <p className="text-[9px] text-slate-400 truncate mt-0.5">
                        {step.badge}
                      </p>
                    </div>

                    {/* Bottom Progress Tracker */}
                    {isActive && (
                      <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
                        <div className="w-full h-full bg-gradient-to-r from-cyan-400 to-indigo-500 animate-laser-flow shadow-[0_0_8px_#00f0ff]" />
                      </div>
                    )}
                    {isPassed && (
                      <div className="w-full h-0.5 bg-emerald-500/70 rounded-full mt-2" />
                    )}
                    {!isActive && !isPassed && (
                      <div className="w-full h-0.5 bg-slate-800 rounded-full mt-2" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Step Live Holographic Demonstration Terminal */}
          <div className="mt-8 terminal-panel rounded-xl p-5 border border-cyan-500/30 font-mono text-xs relative z-10 shadow-2xl">
            {/* Terminal Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800 text-slate-400 text-[11px]">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span className="text-white font-bold">{activeDemo.actionPreview}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-cyan-400 font-semibold">{activeDemo.badge}</span>
                <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-[10px]">
                  VERIFIED EXECUTION
                </span>
              </div>
            </div>

            {/* Terminal Body with Simulated Interactive Visuals */}
            <div className="py-4 space-y-3">
              <div className="text-slate-300 text-sm font-sans flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>{activeDemo.desc}</span>
              </div>

              {/* Dynamic Payload Simulation based on Step */}
              {activeDemo.payloadType === "analysis" && (
                <div className="bg-[#080d19] rounded-lg p-3.5 border border-cyan-500/20 text-[11px] space-y-1.5">
                  <div className="text-cyan-400 font-bold">20-SECTION ENGINEERING REPORT FORMULATED:</div>
                  <div className="text-slate-300 pl-3">↳ [06 AUTHENTICATION]: Finding AUTH-002 (High Severity) in src/auth_service.py:37</div>
                  <div className="text-slate-400 pl-6 text-[10px]">"Inverted comparison operator causes valid fresh tokens to expire immediately."</div>
                  <div className="text-slate-300 pl-3">↳ [11 TESTING]: Pytest test runner detected (demo-repo/tests/test_auth.py)</div>
                  <div className="text-emerald-400 font-semibold pl-3">↳ [19 RECOMMENDATION]: Centralize expiration check & generate surgical patch</div>
                </div>
              )}

              {activeDemo.payloadType === "plan" && (
                <div className="bg-[#080d19] rounded-lg p-3.5 border border-amber-500/30 text-[11px] space-y-2">
                  <div className="text-amber-300 font-bold flex items-center justify-between">
                    <span>HUMAN-IN-THE-LOOP APPROVAL CHECKPOINT (GATE 04)</span>
                    <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/40 text-[10px]">
                      AWAITING CONFIRMATION
                    </span>
                  </div>
                  <div className="text-slate-300 text-[11px]">
                    Step 1: Replace inverted &lt; with &gt; on line 37 in src/auth_service.py<br/>
                    Step 2: Run pytest tests/test_auth.py in isolated sandbox<br/>
                    Step 3: Show unified Monaco diff for human review before any branch push
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button className="px-3 py-1 bg-cyan-600 text-slate-950 font-bold rounded text-[11px] shadow-[0_0_10px_#00f0ff]">
                      Approve Plan
                    </button>
                    <button className="px-3 py-1 bg-slate-800 text-slate-300 rounded text-[11px] border border-slate-700">
                      Edit Plan
                    </button>
                  </div>
                </div>
              )}

              {activeDemo.payloadType === "diff" && (
                <div className="bg-[#080d19] rounded-lg p-3.5 border border-slate-800 text-[11px] font-mono space-y-1">
                  <div className="text-slate-400 pb-1 border-b border-slate-800 flex justify-between">
                    <span>--- src/auth_service.py (original)</span>
                    <span className="text-emerald-400">+12 / -4 lines</span>
                  </div>
                  <div className="text-rose-400 bg-rose-950/20 px-2 py-0.5 rounded">
                    - return current_timestamp &lt; (token.created_at_timestamp + token.expires_in_seconds)
                  </div>
                  <div className="text-emerald-400 bg-emerald-950/20 px-2 py-0.5 rounded">
                    + return current_timestamp &gt; (token.created_at_timestamp + token.expires_in_seconds)
                  </div>
                </div>
              )}

              {activeDemo.payloadType === "test" && (
                <div className="bg-[#080d19] rounded-lg p-3.5 border border-emerald-500/30 text-[11px] font-mono space-y-1">
                  <div className="text-emerald-400 font-bold">============================= test session starts =============================</div>
                  <div className="text-slate-400">demo-repo/tests/test_auth.py::test_valid_fresh_token <span className="text-emerald-400 font-bold">PASSED [ 50%]</span></div>
                  <div className="text-slate-400">demo-repo/tests/test_auth.py::test_expired_token <span className="text-emerald-400 font-bold">PASSED [100%]</span></div>
                  <div className="text-emerald-300 font-bold pt-1">============================== 2 passed in 0.12s ==============================</div>
                </div>
              )}

              {activeDemo.payloadType === "pr" && (
                <div className="bg-[#080d19] rounded-lg p-3.5 border border-cyan-500/30 text-[11px] space-y-1.5">
                  <div className="text-cyan-300 font-bold flex items-center justify-between">
                    <span>PULL REQUEST #142: fix(auth): enforce valid expiration check in AuthService</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px]">
                      PASSED VERIFICATION
                    </span>
                  </div>
                  <div className="text-slate-400 text-[10px]">
                    Branch: <span className="text-white">devpilot/fix-auth-expiration-1042</span> ➔ Base: <span className="text-white">master</span>
                  </div>
                  <div className="text-slate-300 text-[10px] pt-1">
                    ✓ 2/2 Pytest tests verified in sandbox · 0 regressions · Conventional commit verified
                  </div>
                </div>
              )}

              {/* Status bar */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-slate-400 text-[11px]">
                <div className="flex items-center gap-1.5 text-cyan-300 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span>{activeDemo.statusText}</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  Stage Latency: ~1.2s · Zero PAT Leakage
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PROBLEM SECTION */}
      <section className="px-6 py-20 border-t border-slate-800 bg-[#080d18]/60">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-500/30 text-xs font-mono text-rose-300">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>THE INDUSTRY PROBLEM</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white">Chatbots Don't Ship Production Code</h2>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Traditional AI coding assistants dump entire files blindly, hallucinate nonexistent symbols, lack isolated testing sandboxes, force developers to manually paste dangerous API tokens, and leave you to figure out why tests broke.
          </p>
        </div>
      </section>

      {/* 4. HOW DEVPILOT WORKS */}
      <section id="how-it-works" className="px-6 py-20 border-t border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">The Engineering Workflow</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-2">Built for Trust, Not Vibes</h2>
            <p className="text-sm text-slate-400 mt-2">Not User ➔ Chatbot ➔ Answer. A complete, audited engineering pipeline.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {[
              { num: "01", title: "Connect & Discover", desc: "Authorize GitHub via OAuth. Select one target repository to index without bloating your workspace." },
              { num: "02", title: "Analyze & Report", desc: "Extract AST symbols, detect runtime frameworks, and generate a 20-Section Engineering Report." },
              { num: "03", title: "Plan & Approve", desc: "Surgical implementation plan formulated with human approval required before modifying files." },
              { num: "04", title: "Verify & Ship", desc: "Execute pytest/npm test in isolated sandbox, review Monaco diffs, and create branch/PR." },
            ].map((step) => (
              <div key={step.num} className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-cyan-500/40 transition-all group">
                <span className="font-mono text-3xl font-black text-cyan-500/30 group-hover:text-cyan-400 transition-colors">{step.num}</span>
                <h3 className="text-base font-bold text-white mt-3">{step.title}</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. GITHUB INTEGRATION & REPOSITORY INTELLIGENCE */}
      <section id="intelligence" className="px-6 py-20 border-t border-slate-800 bg-[#080d18]/60">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/30 text-xs font-mono text-purple-300 mb-3">
              <Layers className="w-3.5 h-3.5" />
              <span>REPOSITORY INTELLIGENCE ENGINE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-1">20-Section Engineering Reports</h2>
            <p className="text-sm text-slate-400 mt-4 leading-relaxed">
              DevPilot inspects file trees, languages, package dependencies, entry points, and test harnesses. Sensitive files (.env, keys, certificates) are strictly shielded from AI context.
            </p>
            <div className="mt-6 space-y-3 text-xs text-slate-300 font-mono">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Zero PAT Token Copy-Pasting Required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Sensitive Configuration Shielding (.env, *.pem, secrets)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Standard Finding Schema: ID, Severity, File, Line, Evidence, Why It Matters</span>
              </div>
            </div>
          </div>

          <div className="terminal-panel rounded-2xl p-6 font-mono text-xs text-slate-300 shadow-2xl border border-purple-500/30 space-y-3">
            <div className="flex items-center justify-between text-slate-500 text-[11px] border-b border-slate-800 pb-2">
              <span>analyzer_service.py</span>
              <span className="text-purple-400 font-bold">20 SECTIONS</span>
            </div>
            <div className="text-cyan-300">$ repo --analyze --target demo-repo</div>
            <div className="bg-[#080d19] p-4 rounded-xl border border-slate-800 space-y-2 text-[11px]">
              <div className="text-emerald-400 font-bold">✓ 20 Standard Sections Formulated</div>
              <div className="text-slate-400 pl-3">↳ Auth: Inverted timestamp comparison detected</div>
              <div className="text-slate-400 pl-3">↳ Tests: Pytest unit suite failing</div>
              <div className="text-emerald-400 font-bold mt-2">✓ User Approval Gate Armed</div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SANDBOX & MONACO DIFF REVIEW */}
      <section id="sandbox" className="px-6 py-20 border-t border-slate-800">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="terminal-panel rounded-2xl p-6 font-mono text-xs text-slate-300 shadow-2xl border border-cyan-500/30 space-y-3">
            <div className="flex items-center justify-between text-slate-500 text-[11px] border-b border-slate-800 pb-2">
              <span>DiffViewer.tsx</span>
              <span className="text-emerald-400 font-bold">+12 / -4 lines</span>
            </div>
            <div className="bg-[#080d19] p-4 rounded-xl border border-slate-800 space-y-2 text-[11px]">
              <div className="text-rose-400 bg-rose-950/30 p-2 rounded border border-rose-900/40">
                - return current_timestamp &lt; (token.created_at + expires_in)
              </div>
              <div className="text-emerald-400 bg-emerald-950/30 p-2 rounded border border-emerald-900/40">
                + return current_timestamp &gt; (token.created_at + expires_in)
              </div>
            </div>
          </div>

          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-xs font-mono text-cyan-300 mb-3">
              <Code2 className="w-3.5 h-3.5" />
              <span>ISOLATED SANDBOX & MONACO</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-1">Review Every Line in Monaco</h2>
            <p className="text-sm text-slate-400 mt-4 leading-relaxed">
              Modifications take place in an isolated workspace. No changes touch your main branch without approval. Side-by-side Monaco diffs display exact additions (+green) and deletions (-red) with file summaries and risk ratings.
            </p>
          </div>
        </div>
      </section>

      {/* 7. VERIFICATION & BOUNDED SELF-HEALING */}
      <section id="verification" className="px-6 py-20 border-t border-slate-800 bg-[#080d18]/60">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-xs font-mono text-emerald-300 mb-3">
            <Terminal className="w-3.5 h-3.5" />
            <span>TRUTHFUL VERIFICATION ENGINE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white mt-1">Never Claim "Fixed" Without Test Proof</h2>
          <p className="text-sm text-slate-400 mt-2 max-w-xl mx-auto">
            DevPilot detects the testing framework, runs the real test suite in an execution sandbox, and reports truthful pass/fail states with full terminal tracebacks.
          </p>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-emerald-500/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-mono font-bold mb-4 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                ✓
              </div>
              <h3 className="text-base font-bold text-white">Truthful States</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Distinguishes NOT_RUN, RUNNING, PASSED, FAILED, and BLOCKED. Unknown states are never converted into false successes.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-cyan-500/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-mono font-bold mb-4 shadow-[0_0_12px_rgba(0,240,255,0.2)]">
                3x
              </div>
              <h3 className="text-base font-bold text-white">Bounded Self-Healing</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                If tests fail, the agent analyzes the failure traceback, formulates a targeted fix, and re-tests with a strict 3-attempt bound to avoid loops.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-purple-500/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-mono font-bold mb-4 shadow-[0_0_12px_rgba(139,92,246,0.2)]">
                PR
              </div>
              <h3 className="text-base font-bold text-white">Verifiable PR Evidence</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Pull requests automatically embed the exact test exit code, runner outputs, files modified, and risk assessments for peer review.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. ARCHITECTURE & ZERO-TRUST SECURITY */}
      <section id="architecture" className="px-6 py-20 border-t border-slate-800">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="terminal-panel rounded-2xl p-6 space-y-4 border border-rose-500/30">
            <div className="flex items-center gap-2 text-rose-400 text-xs font-mono font-bold">
              <Lock className="w-4 h-4" />
              <span>ISOLATION & PERMISSION TIERS</span>
            </div>
            <div className="space-y-2 text-xs font-mono">
              <div className="p-3 rounded-xl bg-[#080d19] border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300">READ (list_files, read_file)</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded font-bold">NO APPROVAL</span>
              </div>
              <div className="p-3 rounded-xl bg-[#080d19] border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300">WRITE (edit_file, create_file)</span>
                <span className="text-[10px] text-amber-400 bg-amber-950 px-2 py-0.5 rounded font-bold">APPROVAL REQUIRED</span>
              </div>
              <div className="p-3 rounded-xl bg-[#080d19] border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300">EXTERNAL (create_pr)</span>
                <span className="text-[10px] text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded font-bold">CONFIRMATION REQUIRED</span>
              </div>
              <div className="p-3 rounded-xl bg-[#080d19] border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300">DESTRUCTIVE (delete_file)</span>
                <span className="text-[10px] text-rose-400 bg-rose-950 px-2 py-0.5 rounded font-bold">EXPLICIT CONFIRMATION</span>
              </div>
            </div>
          </div>

          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-xs font-mono text-cyan-300 mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ZERO-PAT ARCHITECTURE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-1">Enterprise Security Guarantees</h2>
            <p className="text-sm text-slate-400 mt-4 leading-relaxed">
              We never expose private secrets, OAuth tokens, or database credentials to AI models. All shell executions are isolated in a sandbox with strictly allowlisted commands and process execution timeouts.
            </p>
          </div>
        </div>
      </section>

      {/* 9. FAQ */}
      <section id="faq" className="px-6 py-20 border-t border-slate-800 bg-[#080d18]/60">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-white">Frequently Asked Questions</h2>
            <p className="text-sm text-slate-400 mt-2">Everything you need to know about Pasha DevPilot</p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "Do I have to generate or paste a GitHub Personal Access Token (PAT)?",
                a: "No, never. DevPilot uses standard GitHub App / OAuth authorization. You simply click 'Connect GitHub', authorize the app, and your repositories become available.",
              },
              {
                q: "How does DevPilot prevent making unwanted code changes?",
                a: "DevPilot requires explicit Human Approval before writing any file or creating pull requests. You inspect the implementation plan, affected files, unified diffs, and risks before changes are applied.",
              },
              {
                q: "Which AI models are supported?",
                a: "DevPilot features a decoupled provider abstraction. The default development model is DeepSeek V4 Flash, with a high-quality verification mode supporting configurable Groq models (such as Llama 3.3 70B).",
              },
            ].map((faq, idx) => (
              <div key={idx} className="glass-panel p-6 rounded-2xl border border-slate-800">
                <h3 className="text-sm font-bold text-white">{faq.q}</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. FINAL CTA */}
      <section className="px-6 py-24 border-t border-slate-800 text-center max-w-4xl mx-auto">
        <h2 className="text-3xl sm:text-5xl font-black text-white">Ready to empower your software engineering workflow?</h2>
        <p className="text-sm sm:text-base text-slate-400 mt-4 max-w-xl mx-auto">
          Connect a GitHub repository. DevPilot understands your codebase, plans changes, verifies the implementation, and helps you ship with confidence.
        </p>
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleConnectGitHub}
            disabled={isConnecting}
            className="flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-sm shadow-[0_0_30px_rgba(0,240,255,0.4)] transition-all active:scale-95"
          >
            <Zap className="w-4 h-4 fill-slate-950" />
            <span>Connect GitHub (Zero PAT)</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 px-6 text-center text-xs text-slate-500 font-mono">
        <p>Pasha DevPilot — Your AI Software Engineer. Understand. Analyze. Plan. Build. Verify. Review. Ship.</p>
        <p className="mt-1">Brand: Pasha Dev · Product: Pasha DevPilot</p>
      </footer>
    </div>
  );
}
