"use client";

import React from "react";
import { Search, Plus, Terminal, ExternalLink } from "lucide-react";
import { API_BASE } from "@/lib/api";

interface TopbarProps {
  title?: string;
  subtitle?: string;
  onOpenCommandPalette?: () => void;
  onNewTask?: () => void;
}

export function Topbar({
  title = "Pasha DevPilot",
  subtitle = "AI Software Engineering Platform",
  onOpenCommandPalette,
  onNewTask,
}: TopbarProps) {
  return (
    <header className="h-14 border-b border-cyan-500/20 glass-panel px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Title & Context */}
      <div className="flex items-center gap-3">
        <h1 className="text-sm font-extrabold text-white tracking-tight">{title}</h1>
        {subtitle && (
          <span className="text-xs text-slate-400 border-l border-slate-700/60 pl-3 font-mono">
            {subtitle}
          </span>
        )}
      </div>

      {/* Center Command Palette Trigger */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2.5 px-3.5 py-1.5 bg-[#080d19] hover:bg-[#0d1527] border border-slate-800 hover:border-cyan-500/40 rounded-xl text-xs text-slate-400 hover:text-slate-200 transition-all shadow-sm group"
        >
          <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
          <span className="hidden sm:inline">Search repo, symbols, or actions...</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono bg-cyan-950/80 border border-cyan-500/40 rounded text-cyan-300 shadow-[0_0_6px_rgba(0,240,255,0.2)]">
            ⌘K
          </kbd>
        </button>

        {/* New Task Button */}
        {onNewTask && (
          <button
            onClick={onNewTask}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 text-slate-950 font-bold rounded-xl text-xs shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Task</span>
          </button>
        )}

        {/* Fast Docs Link */}
        <a
          href={`${API_BASE}/docs`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-400 hover:text-cyan-300 transition-all"
          title="Open FastAPI Swagger Docs"
        >
          <Terminal className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden md:inline font-mono">API</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </a>
      </div>
    </header>
  );
}
