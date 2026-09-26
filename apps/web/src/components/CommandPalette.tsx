"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  FolderGit2,
  ListTodo,
  Sliders,
  GitPullRequest,
  Terminal,
  Plus,
  X,
  ArrowRight,
  Sparkles,
  Play,
  FileCode,
  Zap,
} from "lucide-react";
import { API_BASE } from "@/lib/api";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenNewTaskModal?: () => void;
  onOpenCodeSearchModal?: () => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  onOpenNewTaskModal,
  onOpenCodeSearchModal,
}: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent toggles
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Section 54 Actions
  const actions = [
    {
      id: "connect-github",
      title: "Connect GitHub",
      category: "Integration",
      icon: Zap,
      run: () => {
        onClose();
        router.push("/repositories");
      },
    },
    {
      id: "open-repo",
      title: "Open Repository",
      category: "Navigation",
      icon: FolderGit2,
      run: () => {
        onClose();
        router.push("/repositories");
      },
    },
    {
      id: "new-task",
      title: "Create Task",
      category: "Engineering",
      icon: Plus,
      run: () => {
        onClose();
        if (onOpenNewTaskModal) onOpenNewTaskModal();
        else router.push("/tasks");
      },
    },
    {
      id: "analyze-repo",
      title: "Analyze Repository (Engineering Report)",
      category: "Intelligence",
      icon: Sparkles,
      run: () => {
        onClose();
        router.push("/repositories");
      },
    },
    {
      id: "search-code",
      title: "Search Code (Exact / Symbol / Semantic)",
      category: "Intelligence",
      icon: Search,
      run: () => {
        onClose();
        if (onOpenCodeSearchModal) onOpenCodeSearchModal();
        else router.push("/repositories");
      },
    },
    {
      id: "open-changes",
      title: "Open Changes & Review Workspace",
      category: "Review",
      icon: FileCode,
      run: () => {
        onClose();
        router.push("/tasks");
      },
    },
    {
      id: "run-tests",
      title: "Run Tests & Verification",
      category: "Verification",
      icon: Play,
      run: () => {
        onClose();
        router.push("/tasks");
      },
    },
    {
      id: "prs",
      title: "Open Pull Requests",
      category: "Git Workflow",
      icon: GitPullRequest,
      run: () => {
        onClose();
        router.push("/pull-requests");
      },
    },
    {
      id: "settings",
      title: "Settings & AI Provider Router",
      category: "Settings",
      icon: Sliders,
      run: () => {
        onClose();
        router.push("/settings");
      },
    },
    {
      id: "api-docs",
      title: "Open FastAPI Swagger Documentation",
      category: "Developer",
      icon: Terminal,
      run: () => {
        onClose();
        window.open(`${API_BASE}/docs`, "_blank");
      },
    },
  ];

  const filtered = actions.filter((a) =>
    a.title.toLowerCase().includes(query.toLowerCase()) ||
    a.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center pt-24 px-4 animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-[#0c1322] border border-[#1e2e4a] rounded-xl shadow-2xl overflow-hidden">
        {/* Search bar */}
        <div className="px-4 py-3.5 border-b border-[#1e2e4a] flex items-center gap-3">
          <Search className="w-4 h-4 text-sky-400" />
          <input
            autoFocus
            type="text"
            placeholder="Type a command or search action (Ctrl+K)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-xs text-slate-100 placeholder-slate-500 focus:outline-none font-mono"
          />
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results list */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-500 font-mono">
              No matching commands found.
            </div>
          ) : (
            filtered.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={action.run}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-[#131e33] text-left transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded bg-[#16233a] flex items-center justify-center text-slate-300 group-hover:text-sky-400 group-hover:bg-sky-950/60 transition-colors">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-slate-200 group-hover:text-white">
                        {action.title}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {action.category}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-sky-400 opacity-0 group-hover:opacity-100 transition-all" />
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-[#090e1a] border-t border-[#1e2e4a] flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span>Navigate with arrows or mouse</span>
          <div className="flex items-center gap-2">
            <span>ESC to close</span>
            <span>·</span>
            <span>↵ to select</span>
          </div>
        </div>
      </div>
    </div>
  );
}
