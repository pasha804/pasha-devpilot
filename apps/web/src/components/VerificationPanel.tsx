"use client";

import React from "react";
import { Terminal, CheckCircle2, Clock, RotateCw, AlertOctagon } from "lucide-react";
import { StatusIndicator } from "./StatusIndicator";

interface VerificationPanelProps {
  state: string;
  runner?: string;
  command?: string;
  exitCode?: number | null;
  output?: string;
  durationMs?: number;
  attempt?: number;
  maxAttempts?: number;
  onRunAgain?: () => void;
  isLoading?: boolean;
}

export function VerificationPanel({
  state,
  runner = "pytest",
  command,
  exitCode,
  output,
  durationMs = 0,
  attempt = 1,
  maxAttempts = 3,
  onRunAgain,
  isLoading = false,
}: VerificationPanelProps) {
  const isPassed = state === "PASSED";
  const isFailed = state === "FAILED" || state === "BLOCKED" || state === "TIMEOUT";

  return (
    <div className="flex flex-col bg-[#080d18] border border-[#1b273f] rounded-xl overflow-hidden shadow-lg">
      {/* Panel Header */}
      <div className="px-4 py-3 bg-[#0d1424] border-b border-[#1b273f] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Terminal className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-semibold text-slate-200">Automated Verification Runner</span>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
            {runner}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
            <span>Attempt:</span>
            <span className="text-slate-200 font-bold">{attempt}</span>
            <span>/</span>
            <span>{maxAttempts}</span>
          </div>

          <StatusIndicator status={state} size="sm" />

          {onRunAgain && (
            <button
              onClick={onRunAgain}
              disabled={isLoading}
              className="flex items-center gap-1 px-2.5 py-1 text-xs rounded bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-600/40 disabled:opacity-50 transition-colors"
            >
              <RotateCw className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`} />
              <span>Re-run</span>
            </button>
          )}
        </div>
      </div>

      {/* Command & Metadata strip */}
      <div className="px-4 py-2 bg-[#0a0f1d] border-b border-[#162033] flex items-center justify-between text-xs font-mono text-slate-400">
        <div className="flex items-center gap-2 truncate">
          <span className="text-slate-500">$</span>
          <span className="text-sky-300 truncate">{command || "python -m pytest -v"}</span>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0 text-[11px]">
          {exitCode !== undefined && exitCode !== null && (
            <span>Exit Code: <strong className={isPassed ? "text-emerald-400" : "text-rose-400"}>{exitCode}</strong></span>
          )}
          {durationMs > 0 && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-500" />
              {durationMs.toFixed(0)}ms
            </span>
          )}
        </div>
      </div>

      {/* Terminal Output */}
      <div className="p-4 bg-[#05080f] font-mono text-xs text-slate-300 overflow-x-auto min-h-[160px] max-h-[300px] leading-relaxed">
        {isLoading ? (
          <div className="flex items-center gap-2 text-sky-400 py-6">
            <RotateCw className="w-4 h-4 animate-spin" />
            <span>Executing sandboxed test suite...</span>
          </div>
        ) : output ? (
          <pre className="whitespace-pre-wrap">{output}</pre>
        ) : (
          <span className="text-slate-600 italic">No verification suite output recorded yet.</span>
        )}
      </div>

      {/* Truthful footer status */}
      <div className={`px-4 py-2 border-t text-xs flex items-center gap-2 ${
        isPassed
          ? "bg-emerald-950/30 border-emerald-900/50 text-emerald-300"
          : isFailed
          ? "bg-rose-950/30 border-rose-900/50 text-rose-300"
          : "bg-[#0b1120] border-[#162033] text-slate-400"
      }`}>
        {isPassed ? (
          <>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Verification evidence confirmed: all tests passed without regression.</span>
          </>
        ) : isFailed ? (
          <>
            <AlertOctagon className="w-4 h-4 text-rose-400" />
            <span>Verification failed: agent self-healing loop analyzing traceback.</span>
          </>
        ) : (
          <span>Verification is queued for task implementation.</span>
        )}
      </div>
    </div>
  );
}
