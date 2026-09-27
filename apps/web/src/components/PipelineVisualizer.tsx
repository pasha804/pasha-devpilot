"use client";

import React, { useState } from "react";
import {
  Check,
  CircleDot,
  Sparkles,
  Zap,
  Shield,
  FileCode,
  Terminal,
  GitPullRequest,
  CheckCircle2,
  Cpu,
  ArrowRight,
  Activity,
  Layers,
  Search,
  Lock,
} from "lucide-react";

interface PipelineStep {
  name: string;
  key: string;
  category: string;
  description: string;
  activeDescription: string;
  icon: React.ElementType;
}

const STEPS: PipelineStep[] = [
  {
    name: "Understand",
    key: "UNDERSTANDING",
    category: "Intent Scope",
    description: "Task classification & scope",
    activeDescription: "Classifying task intent & mapping boundaries",
    icon: Search,
  },
  {
    name: "Investigate",
    key: "INVESTIGATING",
    category: "AST Discovery",
    description: "Symbol search & code maps",
    activeDescription: "Parsing AST symbols & ranking context",
    icon: Layers,
  },
  {
    name: "Plan",
    key: "PLANNING",
    category: "Strategy Formulation",
    description: "Formulate surgical steps",
    activeDescription: "Synthesizing audited implementation plan",
    icon: FileCode,
  },
  {
    name: "Approve",
    key: "WAITING_FOR_APPROVAL",
    category: "Human Gate",
    description: "Developer authorization checkpoint",
    activeDescription: "Awaiting developer plan authorization",
    icon: Lock,
  },
  {
    name: "Implement",
    key: "IMPLEMENTING",
    category: "Sandbox Isolation",
    description: "Targeted code modifications",
    activeDescription: "Applying surgical unified diff in sandbox",
    icon: Zap,
  },
  {
    name: "Verify",
    key: "VERIFYING",
    category: "Test Execution",
    description: "Sandbox tests & self-healing",
    activeDescription: "Running pytest suite & checking regressions",
    icon: Terminal,
  },
  {
    name: "Ship",
    key: "READY_TO_SHIP",
    category: "Git Publishing",
    description: "Branch, commit & Pull Request",
    activeDescription: "Branch published & PR ready for review",
    icon: GitPullRequest,
  },
];

export function PipelineVisualizer({
  currentState,
  hasPlan,
  modelName = "Grok-4.6 (CleanAPIs)",
}: {
  currentState: string;
  hasPlan?: boolean;
  modelName?: string;
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const stateUpper = (currentState || "NEW").toUpperCase();

  const getStepIndex = (key: string): number => {
    switch (key) {
      case "NEW":
      case "UNDERSTANDING":
        return hasPlan ? 3 : 0;
      case "INVESTIGATING":
        return hasPlan ? 3 : 1;
      case "PLANNING":
        return hasPlan ? 3 : 2;
      case "WAITING_FOR_APPROVAL":
        return 3;
      case "IMPLEMENTING":
        return 4;
      case "VERIFYING":
        return 5;
      case "REVIEWING":
      case "READY_TO_SHIP":
      case "COMPLETED":
      case "SHIPPED":
        return 6;
      default:
        return 0;
    }
  };

  const currentIndex = getStepIndex(stateUpper);
  const currentStep = STEPS[currentIndex] || STEPS[0];
  const isCompleted = stateUpper === "COMPLETED" || stateUpper === "SHIPPED";

  return (
    <div className="w-full glass-panel-elevated rounded-2xl p-5 border border-cyan-500/20 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top HUD Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-800/80 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Activity className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs uppercase tracking-wider text-slate-200">
                Living Pipeline Flow
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                STAGE {currentIndex + 1} OF {STEPS.length}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {isCompleted ? "All pipeline stages successfully executed & verified" : currentStep.activeDescription}
            </p>
          </div>
        </div>

        {/* Live Telemetry Chips */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] font-mono text-slate-300">
            <Cpu className="w-3 h-3 text-cyan-400" />
            <span className="text-slate-400">Model:</span>
            <span className="text-cyan-300 font-semibold">{modelName}</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] font-mono text-slate-300">
            <Shield className="w-3 h-3 text-emerald-400" />
            <span className="text-slate-400">Sandbox:</span>
            <span className="text-emerald-300 font-semibold">Isolated</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-[11px] font-mono text-cyan-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            {currentState.replace(/_/g, " ")}
          </div>
        </div>
      </div>

      {/* Connected Flow Rail */}
      <div className="relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 relative">
          {STEPS.map((step, idx) => {
            const isDone = idx < currentIndex || isCompleted;
            const isActive = idx === currentIndex && !isCompleted;
            const isFuture = idx > currentIndex && !isCompleted;
            const StepIcon = step.icon;

            return (
              <div key={step.key} className="relative flex flex-col">
                {/* Horizontal Laser Connector Line for Desktop */}
                {idx < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-[28px] -right-[14px] w-[28px] h-[3px] z-0 overflow-hidden">
                    {/* Background track */}
                    <div className="w-full h-full bg-slate-800/80" />

                    {/* Green connection if past */}
                    {isDone && idx < currentIndex - 1 && (
                      <div className="absolute inset-0 bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                    )}

                    {/* Animated laser beam if traveling from current to next */}
                    {(isActive || (isDone && idx === currentIndex - 1)) && (
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-indigo-500 animate-laser-flow shadow-[0_0_12px_#00f0ff]" />
                    )}
                  </div>
                )}

                {/* Step Card */}
                <div
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className={`relative z-10 flex flex-col justify-between p-3.5 rounded-xl border transition-all duration-300 min-h-[110px] ${
                    isActive
                      ? "bg-[#0c1427] border-cyan-400 shadow-[0_0_24px_rgba(0,240,255,0.25)] ring-1 ring-cyan-400/50 scale-[1.02]"
                      : isDone
                      ? "bg-[#09151e]/90 border-emerald-500/40 hover:border-emerald-400/60 shadow-[0_0_12px_rgba(16,185,129,0.1)]"
                      : "bg-[#080d1a]/80 border-slate-800/80 hover:border-slate-700 opacity-60 hover:opacity-100"
                  }`}
                >
                  {/* Active Radar Aura Indicator */}
                  {isActive && (
                    <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 blur-sm pointer-events-none -z-10 animate-pulse" />
                  )}

                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                          isActive
                            ? "bg-cyan-500 text-slate-950 font-bold shadow-[0_0_10px_#00f0ff]"
                            : isDone
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        <StepIcon className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-mono text-[10px] text-slate-400 font-semibold">
                        0{idx + 1}
                      </span>
                    </div>

                    {/* Status Pill */}
                    <div>
                      {isDone ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
                          <Check className="w-2.5 h-2.5" />
                          DONE
                        </span>
                      ) : isActive ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono bg-cyan-950/90 border border-cyan-400 text-cyan-300 shadow-[0_0_8px_rgba(0,240,255,0.4)]">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                          ACTIVE
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono text-slate-500">PENDING</span>
                      )}
                    </div>
                  </div>

                  {/* Step Title & Details */}
                  <div className="mt-1">
                    <p
                      className={`text-xs font-bold tracking-tight ${
                        isActive
                          ? "text-cyan-200"
                          : isDone
                          ? "text-emerald-200"
                          : "text-slate-300"
                      }`}
                    >
                      {step.name}
                    </p>
                    <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                      {isActive ? step.activeDescription : step.description}
                    </p>
                  </div>

                  {/* Active Progress Bar Shimmer */}
                  {isActive && (
                    <div className="w-full h-1 bg-slate-800 rounded-full mt-2.5 overflow-hidden">
                      <div className="w-full h-full bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 animate-laser-flow shadow-[0_0_8px_#00f0ff]" />
                    </div>
                  )}

                  {isDone && (
                    <div className="w-full h-0.5 bg-emerald-500/60 rounded-full mt-2.5" />
                  )}

                  {isFuture && (
                    <div className="w-full h-0.5 bg-slate-800 rounded-full mt-2.5" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Active Step Detail Ribbon */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 relative z-10">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Current Focus:
          </span>
          <span className="font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded">
            {currentStep.category}
          </span>
          <span className="text-slate-400 hidden md:inline">
            — {currentStep.activeDescription}
          </span>
        </div>

        <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block shadow-[0_0_6px_#10b981]" />
            Verified & Gated
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block animate-pulse shadow-[0_0_6px_#00f0ff]" />
            Active Laser Rail
          </span>
        </div>
      </div>
    </div>
  );
}
