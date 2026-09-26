"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
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
  Cog,
  FileCheck,
  ExternalLink,
} from "lucide-react";
import { api } from "@/lib/api";
import { DevPilotLogo } from "@/components/DevPilotLogo";

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
      badge: "IBM Bob & CleanAPIs",
      category: "INTELLIGENCE",
      desc: "Read-only AST symbol parsing produces 20-Section Engineering Report with verifiable findings.",
      actionPreview: "POST /api/analysis/generate --model=bob-code-plus",
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
    <div className="min-h-screen bg-[#030611] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden">
      {/* ─────────────────────────────────────────────────────────────
          1. CINEMATIC NAVBAR
      ───────────────────────────────────────────────────────────── */}
      <nav className="border-b border-[#0f1b33] bg-[#030611]/85 backdrop-blur-xl sticky top-0 z-50 px-6 sm:px-12 py-3.5 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <DevPilotLogo size="md" showText={true} />

        {/* Center Nav Links */}
        <div className="hidden md:flex items-center gap-8 text-[13px] font-medium text-slate-300">
          <Link
            href="/"
            className="text-white hover:text-cyan-300 transition-colors relative py-1"
          >
            Home
            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-sky-400 to-blue-600 rounded-full" />
          </Link>
          <a href="#features" className="hover:text-cyan-300 transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="hover:text-cyan-300 transition-colors">
            How It Works
          </a>
          <a href="#security" className="hover:text-cyan-300 transition-colors">
            Security
          </a>
          <a href="#docs" className="hover:text-cyan-300 transition-colors">
            Docs
          </a>
        </div>

        {/* Right CTA Group */}
        <div className="flex items-center gap-3">
          <Link
            href="#demo"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-700/80 bg-slate-900/60 hover:bg-slate-800/80 text-xs font-semibold text-slate-200 transition-all shadow-sm"
          >
            <Play className="w-3 h-3 text-cyan-400 fill-cyan-400" />
            <span>Demo</span>
          </Link>

          <button
            onClick={handleConnectGitHub}
            disabled={isConnecting}
            className="group relative flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs shadow-[0_0_24px_rgba(2,132,199,0.5)] transition-all active:scale-95"
          >
            {/* GitHub Octocat Icon */}
            <svg
              className="w-4 h-4 fill-current shrink-0"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
            <span>{isConnecting ? "Connecting..." : "Connect GitHub"}</span>
          </button>
        </div>
      </nav>

      {/* ─────────────────────────────────────────────────────────────
          2. CINEMATIC HERO SECTION WITH MOUNTAINS & FLOATING UI
      ───────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center justify-center px-6 sm:px-12 py-16 overflow-hidden">
        {/* Cinematic Backdrop: Mountain Silhouettes & Sky Light Beam */}
        <div className="absolute inset-0 pointer-events-none select-none z-0">
          <Image
            src="/hero-mountains.jpg"
            alt="Pasha DevPilot Cinematic Landscape"
            fill
            priority
            className="object-cover object-bottom opacity-40 mix-blend-screen"
          />
          {/* Radial Top Deep Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[550px] bg-gradient-to-b from-sky-600/20 via-blue-900/10 to-transparent blur-[140px]" />
          {/* Horizon Rim Glow */}
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#030611] via-[#030611]/80 to-transparent" />
        </div>

        {/* Hero Content Grid (2 Columns: Value Proposition + Floating UI Card) */}
        <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column (Typography, Badges, CTAs) */}
          <div className="lg:col-span-6 space-y-6 text-left">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-sky-500/30 text-xs text-sky-300 font-mono shadow-[0_0_16px_rgba(56,189,248,0.2)]">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
              <span className="font-bold tracking-wider uppercase text-[11px]">
                ✨ AI POWERED DEVELOPER WORKFLOW
              </span>
            </div>

            {/* Monumental Headline */}
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white leading-[1.05]">
                Pasha{" "}
                <span className="bg-gradient-to-r from-sky-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent drop-shadow-[0_0_24px_rgba(56,189,248,0.4)]">
                  DevPilot
                </span>
              </h1>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Your AI Software Engineer.
              </h2>
              <p className="text-base sm:text-xl font-semibold text-sky-200/90 tracking-wide font-mono pt-1">
                Understand. Plan. Build. Verify. Ship.
              </p>
            </div>

            {/* Subtitle Description */}
            <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed font-sans">
              Connect a real repository, investigate real engineering problems, review
              AI-generated changes, verify them, and ship with control.
            </p>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button
                onClick={handleConnectGitHub}
                disabled={isConnecting}
                className="flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-sm shadow-[0_0_30px_rgba(2,132,199,0.5)] transition-all active:scale-95"
              >
                <svg
                  className="w-4 h-4 fill-current"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
                <span>Connect GitHub</span>
              </button>

              <a
                href="#demo"
                className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-slate-900/80 hover:bg-slate-800/90 border border-slate-700/80 text-slate-200 hover:text-white font-semibold text-sm transition-all shadow-lg backdrop-blur-sm"
              >
                <Play className="w-3.5 h-3.5 text-sky-400 fill-sky-400" />
                <span>Explore Demo</span>
              </a>
            </div>

            {/* 3 Feature Badges in Row */}
            <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-slate-800/80">
              <div className="flex items-start gap-2.5">
                <div className="p-2 rounded-lg bg-sky-950/80 border border-sky-800/60 text-sky-400 shrink-0">
                  <FolderGit2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Real GitHub Integration</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Your actual repositories</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="p-2 rounded-lg bg-indigo-950/80 border border-indigo-800/60 text-indigo-400 shrink-0">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">AI-Powered Analysis</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Evidence-based insights</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Secure & Controlled</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Your data, your rules</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Floating 3D Perspective DevPilot Glass Card */}
          <div className="lg:col-span-6 relative">
            {/* Ambient Backlight Glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-sky-500/20 via-blue-600/20 to-purple-600/20 rounded-3xl blur-2xl opacity-75 -z-10" />

            {/* Outer Mockup Card Container */}
            <div className="rounded-2xl border border-sky-500/30 bg-[#070c1a]/90 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden font-sans">
              {/* Card Topbar */}
              <div className="px-4 py-3 border-b border-[#14213d] bg-[#050914] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DevPilotLogo size="sm" showText={true} clickable={false} />
                </div>

                <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Pasha Dev / nexora</span>
                  <span className="text-slate-500">▾</span>
                </div>
              </div>

              {/* Task Header & Stepper */}
              <div className="p-5 border-b border-[#14213d] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                      <span>Fix authentication redirect issue</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-950 text-sky-300 border border-sky-600/50 font-bold">
                        In Progress
                      </span>
                    </h3>
                    <p className="text-[11px] font-mono text-slate-400 mt-0.5">#task-7f3a2</p>
                  </div>
                </div>

                {/* Stepper Timeline */}
                <div className="grid grid-cols-6 gap-1 relative font-mono text-[10px]">
                  <div className="flex flex-col items-center gap-1.5 text-sky-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-400 ring-2 ring-sky-400/40" />
                    <span>Investigating</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5 text-sky-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-400 ring-2 ring-sky-400/40" />
                    <span>Planning</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5 text-sky-300 font-bold">
                    <span className="w-3 h-3 rounded-full bg-sky-400 animate-ping" />
                    <span>Building</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5 text-slate-500">
                    <span className="w-2 h-2 rounded-full border border-slate-600 bg-slate-800" />
                    <span>Testing</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5 text-slate-500">
                    <span className="w-2 h-2 rounded-full border border-slate-600 bg-slate-800" />
                    <span>Review</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5 text-slate-500">
                    <span className="w-2 h-2 rounded-full border border-slate-600 bg-slate-800" />
                    <span>Complete</span>
                  </div>
                </div>
              </div>

              {/* 2-Column Split: AI Agent Activity & Code Diff View */}
              <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-[#14213d]">
                {/* Left Inner Card: AI Agent Activity */}
                <div className="md:col-span-5 p-4 space-y-3 bg-[#060a17]/60 font-mono text-xs">
                  <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between pb-1 border-b border-slate-800/80">
                    <span>AI Agent Activity</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                  </div>

                  <div className="space-y-2 text-[11px]">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Analyzing repository structure...</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-400">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Identifying relevant files...</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-400">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Generating implementation plan...</span>
                    </div>
                    <div className="flex items-center gap-2 text-sky-300 font-bold bg-sky-950/40 p-1.5 rounded border border-sky-800/50">
                      <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping shrink-0" />
                      <span>Applying code changes...</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <span className="w-2.5 h-2.5 rounded-full border border-slate-700 shrink-0" />
                      <span>Running tests...</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <span className="w-2.5 h-2.5 rounded-full border border-slate-700 shrink-0" />
                      <span>Preparing pull request...</span>
                    </div>
                  </div>
                </div>

                {/* Right Inner Card: Diff Preview */}
                <div className="md:col-span-7 p-4 bg-[#030712] font-mono text-[11px]">
                  {/* File Tabs */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-[10px] text-slate-400">
                    <div className="flex items-center gap-3">
                      <span className="text-white font-bold pb-1 border-b border-sky-400">
                        Changes (3)
                      </span>
                      <span className="hover:text-white cursor-pointer">Diff</span>
                      <span className="hover:text-white cursor-pointer">Terminal</span>
                    </div>
                    <span className="text-sky-400 truncate max-w-[130px]">src/middleware/auth.ts</span>
                  </div>

                  {/* Syntax Highlighted Diff */}
                  <div className="py-2.5 space-y-1 font-mono text-[10px] leading-relaxed">
                    <div className="text-slate-500">45   if (session) &#123;</div>
                    <div className="text-slate-500">46     return redirect('/login')</div>
                    <div className="text-slate-500">47   &#125;</div>
                    <div className="bg-rose-950/40 text-rose-300 px-1 rounded border-l-2 border-rose-500">
                      48 - if (session || !session.user) &#123;
                    </div>
                    <div className="bg-rose-950/40 text-rose-300 px-1 rounded border-l-2 border-rose-500">
                      49 -   return redirect('/login')
                    </div>
                    <div className="bg-rose-950/40 text-rose-300 px-1 rounded border-l-2 border-rose-500">
                      50 - &#125;
                    </div>
                    <div className="bg-emerald-950/50 text-emerald-300 px-1 rounded border-l-2 border-emerald-400">
                      51 + if (!session || !session.user) &#123;
                    </div>
                    <div className="bg-emerald-950/50 text-emerald-300 px-1 rounded border-l-2 border-emerald-400">
                      52 +   return redirect('/login')
                    </div>
                    <div className="bg-emerald-950/50 text-emerald-300 px-1 rounded border-l-2 border-emerald-400">
                      53 + &#125;
                    </div>
                    <div className="text-slate-500">54   const user = await getUser(session.user.id)</div>
                    <div className="text-slate-500">55   return NextResponse.next()</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. HOW IT WORKS SECTION (Matching Image Layout)
      ───────────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="px-6 sm:px-12 py-24 border-t border-[#0f1b33] bg-[#02050f]/80 relative">
        <div className="max-w-7xl mx-auto space-y-16">
          {/* Header */}
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              How It{" "}
              <span className="bg-gradient-to-r from-sky-400 to-blue-600 bg-clip-text text-transparent">
                Works
              </span>
            </h2>
            <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
              From your codebase to production, in a few simple steps.
            </p>
          </div>

          {/* 5-Step Horizontal Interactive Pipeline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 relative">
            {[
              {
                title: "Connect GitHub",
                desc: "Authorize with your GitHub account",
                icon: (
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                  </svg>
                ),
              },
              {
                title: "Analyze Repository",
                desc: "Get AI-powered insights about your codebase",
                icon: <Code2 className="w-5 h-5 text-sky-400" />,
              },
              {
                title: "Create Task",
                desc: "Describe what you want to change",
                icon: <FileCheck className="w-5 h-5 text-sky-400" />,
              },
              {
                title: "Build & Verify",
                desc: "AI makes changes, runs tests, and validates",
                icon: <Cog className="w-5 h-5 text-sky-400" />,
              },
              {
                title: "Review & Ship",
                desc: "Review the diff, create a PR, and deploy with confidence",
                icon: <GitPullRequest className="w-5 h-5 text-sky-400" />,
              },
            ].map((step, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center text-center p-6 rounded-2xl bg-[#070d1e]/70 border border-[#14223d] hover:border-sky-500/40 transition-all group relative"
              >
                {/* Glowing Circle Icon */}
                <div className="w-14 h-14 rounded-full bg-gradient-to-b from-[#0a1838] to-[#050b1a] border border-sky-500/40 flex items-center justify-center text-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.25)] group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(56,189,248,0.4)] transition-all mb-4">
                  {step.icon}
                </div>

                <h3 className="text-sm font-bold text-white mb-1.5">{step.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          {/* Bottom Pill Bar: Built For Modern Developers */}
          <div className="pt-8 flex flex-col items-center space-y-4">
            <span className="text-[11px] font-mono text-sky-400 uppercase tracking-widest font-semibold">
              BUILT FOR MODERN DEVELOPERS
            </span>

            <div className="flex flex-wrap items-center justify-center gap-3">
              {[
                { label: "GitHub Integration", icon: <FolderGit2 className="w-3.5 h-3.5 text-sky-400" /> },
                { label: "AI Agent", icon: <Sparkles className="w-3.5 h-3.5 text-purple-400" /> },
                { label: "Real Repository Analysis", icon: <Layers className="w-3.5 h-3.5 text-emerald-400" /> },
                { label: "Automated Testing", icon: <Terminal className="w-3.5 h-3.5 text-amber-400" /> },
                { label: "Pull Request Workflow", icon: <GitPullRequest className="w-3.5 h-3.5 text-sky-400" /> },
                { label: "Secure & Scalable", icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> },
              ].map((pill, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#070c1a] border border-slate-800 text-xs font-mono text-slate-300 hover:border-sky-500/30 transition-colors shadow-sm"
                >
                  {pill.icon}
                  <span>{pill.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. INTERACTIVE 9-STAGE LIVING PIPELINE SIMULATOR
      ───────────────────────────────────────────────────────────── */}
      <section id="demo" className="px-6 sm:px-12 py-24 border-t border-[#0f1b33] relative">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950/80 border border-sky-500/40 text-xs font-mono text-sky-300">
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              <span>THE 9-STAGE LIVING PIPELINE SIMULATOR</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Watch Every Stage of Autonomous Execution
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl mx-auto">
              Inspect how DevPilot isolates defects, awaits developer authorization, runs tests in a sandbox, and prepares a Pull Request.
            </p>
          </div>

          {/* Master Flow Container */}
          <div className="rounded-2xl p-6 sm:p-8 border border-sky-500/25 bg-[#060a17]/90 backdrop-blur-xl relative overflow-hidden shadow-2xl">
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
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-950/60 border border-sky-500/40 text-xs font-mono text-sky-300 hover:bg-sky-900/60 transition-colors"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Next Stage</span>
                </button>

                <span className="text-[11px] font-mono px-3 py-1 rounded-lg bg-sky-950 border border-sky-400 text-sky-300 font-bold shadow-[0_0_10px_rgba(56,189,248,0.3)]">
                  STAGE {demoStep + 1} OF 9: {activeDemo.category}
                </span>
              </div>
            </div>

            {/* Stepper Grid */}
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
                          ? "bg-[#0d1629] border-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.35)] ring-1 ring-sky-400/60 scale-105 z-20"
                          : isPassed
                          ? "bg-[#09151e]/80 border-emerald-500/40 text-emerald-400 hover:border-emerald-400"
                          : "bg-[#080d1a]/80 border-slate-800/80 text-slate-500 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className={`text-[10px] font-bold ${isActive ? "text-sky-300" : isPassed ? "text-emerald-400" : "text-slate-500"}`}>
                          {step.stepNum}
                        </span>
                        {isPassed ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : isActive ? (
                          <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                        )}
                      </div>

                      <div>
                        <p className={`text-xs font-bold truncate leading-tight ${isActive ? "text-white" : isPassed ? "text-emerald-200" : "text-slate-400"}`}>
                          {step.title}
                        </p>
                        <p className="text-[9px] text-slate-400 truncate mt-0.5">
                          {step.badge}
                        </p>
                      </div>

                      {isActive && (
                        <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
                          <div className="w-full h-full bg-gradient-to-r from-sky-400 to-indigo-500 animate-pulse shadow-[0_0_8px_#38bdf8]" />
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

            {/* Active Stage Terminal Demonstration */}
            <div className="mt-8 rounded-xl p-5 border border-sky-500/30 bg-[#050814] font-mono text-xs relative z-10 shadow-2xl">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800 text-slate-400 text-[11px]">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-sky-400" />
                  <span className="text-white font-bold">{activeDemo.actionPreview}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sky-400 font-semibold">{activeDemo.badge}</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-[10px]">
                    VERIFIED EXECUTION
                  </span>
                </div>
              </div>

              <div className="py-4 space-y-3">
                <div className="text-slate-300 text-sm font-sans flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <span>{activeDemo.desc}</span>
                </div>

                {activeDemo.payloadType === "analysis" && (
                  <div className="bg-[#080d19] rounded-lg p-3.5 border border-sky-500/20 text-[11px] space-y-1.5">
                    <div className="text-sky-400 font-bold">20-SECTION ENGINEERING REPORT FORMULATED:</div>
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
                  <div className="bg-[#080d19] rounded-lg p-3.5 border border-sky-500/30 text-[11px] space-y-1.5">
                    <div className="text-sky-300 font-bold flex items-center justify-between">
                      <span>PULL REQUEST #142: fix(auth): enforce valid expiration check in AuthService</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px]">
                        PASSED VERIFICATION
                      </span>
                    </div>
                    <div className="text-slate-400 text-[10px]">
                      Branch: <span className="text-white">devpilot/fix-auth-expiration-1042</span> ➔ Base: <span className="text-white">main</span>
                    </div>
                    <div className="text-slate-300 text-[10px] pt-1">
                      ✓ 2/2 Pytest tests verified in sandbox · 0 regressions · Conventional commit verified
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-slate-400 text-[11px]">
                  <div className="flex items-center gap-1.5 text-sky-300 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                    <span>{activeDemo.statusText}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Stage Latency: ~1.2s · Zero PAT Leakage
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. FEATURES & IBM BOB ARCHITECTURE SECTION
      ───────────────────────────────────────────────────────────── */}
      <section id="features" className="px-6 sm:px-12 py-24 border-t border-[#0f1b33] bg-[#02050f]/80">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-3">
            <span className="text-xs font-mono text-sky-400 uppercase tracking-widest font-semibold">
              ENGINEERED FOR PRODUCTION
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Enterprise Features. Zero Gimmicks.
            </h2>
            <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
              Built as an official IBM Bob extension with real sandbox isolation, AST parsing, and truthful test verification.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-7 rounded-2xl bg-[#060a17] border border-[#14213d] hover:border-sky-500/40 transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-sky-950/80 border border-sky-800 text-sky-400 flex items-center justify-center">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">IBM Bob Core Engine</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Integrated with IBM Bob (`bob-code-plus`) and CleanAPIs DeepSeek V4 Flash for multi-stage reasoning, deep semantic context, and surgical diff generation.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-[#060a17] border border-[#14213d] hover:border-sky-500/40 transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Isolated Execution Sandbox</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Enforces strict command allowlists (`pytest`, `npm test`, `cargo test`). Blocks dangerous commands (`rm`, `curl | bash`, `force push`) and prevents path traversal.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-[#060a17] border border-[#14213d] hover:border-sky-500/40 transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-purple-950/80 border border-purple-800 text-purple-400 flex items-center justify-center">
                <GitBranch className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">1-Click Push & Pull Request</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Review verified code changes in Monaco Editor, then publish clean branches and rich GitHub Pull Requests with a single click.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. SECURITY SECTION
      ───────────────────────────────────────────────────────────── */}
      <section id="security" className="px-6 sm:px-12 py-24 border-t border-[#0f1b33]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-xs font-mono text-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ZERO-PAT ARCHITECTURE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white">Enterprise Security Guarantees</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              We never expose private secrets, OAuth tokens, or database credentials to AI models. All shell executions are isolated in a sandbox with strictly allowlisted commands and process execution timeouts.
            </p>
            <div className="pt-2 space-y-2.5 text-xs font-mono text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Zero manual PAT token copy-pasting</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Sensitive file exclusion (.env, *.pem, *.key)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Human-in-the-loop approval before any disk write</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl p-6 bg-[#060a17] border border-slate-800 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-500 text-[11px]">
              <span>sandbox_guard.py</span>
              <span className="text-emerald-400 font-bold">ACTIVE</span>
            </div>
            <div className="space-y-2 text-[11px]">
              <div className="p-3 rounded-lg bg-[#030612] border border-slate-800 flex justify-between items-center">
                <span className="text-slate-300">READ (AST parse, file scan)</span>
                <span className="text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded text-[10px] font-bold">ALLOWED</span>
              </div>
              <div className="p-3 rounded-lg bg-[#030612] border border-slate-800 flex justify-between items-center">
                <span className="text-slate-300">WRITE (Apply unified diff)</span>
                <span className="text-amber-400 bg-amber-950 px-2 py-0.5 rounded text-[10px] font-bold">NEEDS APPROVAL</span>
              </div>
              <div className="p-3 rounded-lg bg-[#030612] border border-slate-800 flex justify-between items-center">
                <span className="text-slate-300">EXTERNAL (Push branch & PR)</span>
                <span className="text-sky-400 bg-sky-950 px-2 py-0.5 rounded text-[10px] font-bold">USER TRIGGERED</span>
              </div>
              <div className="p-3 rounded-lg bg-[#030612] border border-slate-800 flex justify-between items-center">
                <span className="text-slate-300">DESTRUCTIVE (rm -rf, git force)</span>
                <span className="text-rose-400 bg-rose-950 px-2 py-0.5 rounded text-[10px] font-bold">BLOCKED</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          7. FINAL CALL TO ACTION
      ───────────────────────────────────────────────────────────── */}
      <section className="px-6 sm:px-12 py-24 border-t border-[#0f1b33] text-center max-w-4xl mx-auto space-y-6">
        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Ready to empower your software engineering workflow?
        </h2>
        <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
          Connect a GitHub repository. DevPilot understands your codebase, plans changes, verifies the implementation, and helps you ship with confidence.
        </p>
        <div className="pt-4 flex justify-center">
          <button
            onClick={handleConnectGitHub}
            disabled={isConnecting}
            className="flex items-center gap-2.5 px-8 py-4 rounded-full bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-blue-500 text-white font-black text-sm shadow-[0_0_35px_rgba(2,132,199,0.6)] transition-all active:scale-95"
          >
            <Zap className="w-4 h-4 fill-white" />
            <span>Connect GitHub (Zero PAT)</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          8. FOOTER
      ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-[#0f1b33] py-8 px-6 text-center text-xs text-slate-500 font-mono space-y-2">
        <div className="flex justify-center mb-2">
          <DevPilotLogo size="sm" showText={true} />
        </div>
        <p>Pasha DevPilot — Your AI Software Engineer. Understand. Plan. Build. Verify. Ship.</p>
        <p>Brand: Pasha Dev · Product: Pasha DevPilot · IBM Bob Extension</p>
      </footer>
    </div>
  );
}
