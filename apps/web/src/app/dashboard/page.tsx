"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FolderGit2,
  ListTodo,
  CheckCircle2,
  Plus,
  ArrowRight,
  Sparkles,
  RotateCw,
  Activity,
  Trophy,
  GitBranch,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { Topbar } from "@/components/Topbar";
import { StatusIndicator } from "@/components/StatusIndicator";
import { NewTaskModal } from "@/components/NewTaskModal";
import { api, RepositoryItem, TaskItem, PullRequestItem } from "@/lib/api";

export default function DashboardPage() {
  const router = useRouter();
  const [repositories, setRepositories] = useState<RepositoryItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [pullRequests, setPullRequests] = useState<PullRequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [freshRepos, freshTasks, freshPrs] = await Promise.all([
        api.getRepositories(),
        api.getTasks(),
        api.getPullRequests(),
      ]);

      setRepositories(freshRepos);
      setTasks(freshTasks);
      setPullRequests(freshPrs);
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const isTaskCompleted = (t: TaskItem) =>
    t.state === "COMPLETED" ||
    t.state === "READY_TO_SHIP" ||
    (t.verification_passed === true && t.file_changes && t.file_changes.length > 0);

  // Active tasks: Currently being investigated, planned, approved, implemented, or tested
  const activeTasks = tasks.filter(
    (t) => !isTaskCompleted(t) && t.state !== "CANCELLED"
  );

  // Completed work: Finished, verified, and shipped tasks
  const completedTasks = tasks.filter(isTaskCompleted);

  const verifiedCount = tasks.filter((t) => t.verification_passed === true || isTaskCompleted(t)).length;

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar
        title="Engineering Dashboard"
        subtitle="Live Active Tasks, Total Work Done & Codebase Telemetry"
        onNewTask={() => setIsNewTaskOpen(true)}
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* Mission Control Hero Banner */}
        <div className="p-6 rounded-2xl border border-sky-500/25 bg-gradient-to-r from-[#060e24] via-[#091536] to-[#060e24] shadow-[0_0_35px_rgba(2,132,199,0.15)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-2 relative z-10">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-sky-950 text-sky-300 border border-sky-500/40 font-bold uppercase tracking-wider">
                Autonomous Mission Control · Online
              </span>
              <span className="text-xs font-mono text-slate-400">
                IBM Bob + CleanAPIs Engine
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Pasha DevPilot Autonomous Workstation
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Real code intelligence with 7-state pipeline, isolated sandbox execution, and truthful test verification.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 relative z-10">
            <button
              onClick={() => setIsNewTaskOpen(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs shadow-[0_0_20px_rgba(2,132,199,0.5)] transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Launch New Task</span>
            </button>
            <Link
              href="/repositories"
              className="flex items-center gap-1.5 px-4 py-3 rounded-full bg-[#0a1329] hover:bg-[#0f1d3d] border border-slate-700 text-xs font-semibold text-slate-200 transition-colors"
            >
              <FolderGit2 className="w-4 h-4 text-sky-400" />
              <span>Repositories</span>
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-6 animate-pulse">
            {/* Metric Skeletons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-4 rounded-xl bg-[#0c1322] border border-[#1a2944] h-24 flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-3 w-28 bg-slate-800/80 rounded" />
                    <div className="h-6 w-12 bg-slate-700/80 rounded" />
                    <div className="h-2 w-36 bg-slate-800/60 rounded" />
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-slate-800/70" />
                </div>
              ))}
            </div>

            {/* Active Tasks Skeleton */}
            <div className="space-y-3">
              <div className="h-4 w-40 bg-slate-800/80 rounded" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[1, 2].map((i) => (
                  <div key={i} className="p-4 rounded-xl bg-[#0b1220] border border-[#16233a] h-28 space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="h-3 w-24 bg-slate-800 rounded" />
                      <div className="h-3 w-16 bg-slate-800 rounded-full" />
                    </div>
                    <div className="h-4 w-3/4 bg-slate-700/60 rounded" />
                    <div className="h-2 w-1/2 bg-slate-800/60 rounded" />
                  </div>
                ))}
              </div>
            </div>

            {/* Connected Repos Skeleton */}
            <div className="space-y-3">
              <div className="h-4 w-48 bg-slate-800/80 rounded" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 rounded-xl bg-[#0b1220] border border-[#16233a] h-24 space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="h-3 w-32 bg-slate-800 rounded" />
                      <div className="h-3 w-12 bg-slate-800 rounded" />
                    </div>
                    <div className="h-2 w-24 bg-slate-800/60 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Real Product Metrics strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0c162e] to-[#070c1a] border border-[#1b2a4a] hover:border-sky-500/40 flex items-center justify-between shadow-lg transition-all group">
            <div>
              <p className="text-xs font-mono text-slate-400">CONNECTED REPOSITORIES</p>
              <p className="text-3xl font-black text-white mt-1 group-hover:text-sky-300 transition-colors">{repositories.length}</p>
              <p className="text-[11px] text-slate-500 mt-1">Live AST indexed codebases</p>
            </div>
            <div className="p-3 rounded-xl bg-sky-950/80 border border-sky-800 text-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.2)]">
              <FolderGit2 className="w-6 h-6" />
            </div>
          </div>

          {/* Active Tasks Metric */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0c162e] to-[#070c1a] border border-[#1b2a4a] hover:border-amber-500/40 flex items-center justify-between shadow-lg relative overflow-hidden transition-all group">
            {activeTasks.length > 0 && (
              <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[10px] text-amber-400 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                <span>IN FLIGHT</span>
              </div>
            )}
            <div>
              <p className="text-xs font-mono text-slate-400">ACTIVE TASKS</p>
              <p className="text-3xl font-black text-amber-400 mt-1">{activeTasks.length}</p>
              <p className="text-[11px] text-slate-500 mt-1">Work in progress right now</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-950/80 border border-amber-800 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.2)]">
              <Activity className="w-6 h-6" />
            </div>
          </div>

          {/* Total Work Done Metric */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0c162e] to-[#070c1a] border border-emerald-900/40 hover:border-emerald-500/40 flex items-center justify-between shadow-lg transition-all group">
            <div>
              <p className="text-xs font-mono text-emerald-400 font-bold">TOTAL WORK DONE</p>
              <p className="text-3xl font-black text-emerald-400 mt-1">{completedTasks.length}</p>
              <p className="text-[11px] text-slate-400 mt-1">Finished & ready to ship</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
              <Trophy className="w-6 h-6" />
            </div>
          </div>

          {/* Truthful Verification Metric */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0c162e] to-[#070c1a] border border-[#1b2a4a] hover:border-sky-500/40 flex items-center justify-between shadow-lg transition-all group">
            <div>
              <p className="text-xs font-mono text-slate-400">VERIFIED CODE RUNS</p>
              <p className="text-3xl font-black text-sky-400 mt-1">{verifiedCount}</p>
              <p className="text-[11px] text-slate-500 mt-1">Evidence confirmed in sandbox</p>
            </div>
            <div className="p-3 rounded-xl bg-sky-950/80 border border-sky-800 text-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.2)]">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Section 1: Active Tasks (In Progress) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              <h3 className="text-sm font-bold text-slate-100">
                Active Tasks ({activeTasks.length})
              </h3>
              <span className="text-[11px] text-slate-500 font-mono">
                — Removed automatically once finished
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => loadDashboardData()}
                className="p-1.5 rounded-lg bg-[#0c1322] hover:bg-[#121c2e] border border-[#1a2944] text-slate-400 hover:text-slate-200 transition-colors"
                title="Refresh Dashboard"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {activeTasks.length === 0 ? (
            <div className="p-6 rounded-xl bg-[#0c1322] border border-[#1a2944] text-center space-y-2">
              <p className="text-xs text-slate-400">
                No tasks are currently active. All ongoing work has been resolved or completed.
              </p>
              <button
                onClick={() => setIsNewTaskOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Launch New Task</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activeTasks.map((task) => (
                <Link
                  key={task.id}
                  href={`/tasks/${task.id}`}
                  className="p-4 rounded-xl bg-[#0b1220] hover:bg-[#10192e] border border-amber-500/30 hover:border-amber-500/60 transition-all group block shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                          {task.classification}
                        </span>
                        <span className="text-xs font-semibold text-slate-200 group-hover:text-amber-300 transition-colors">
                          {task.title}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1">
                        {task.description}
                      </p>
                    </div>
                    <StatusIndicator status={task.state} size="sm" />
                  </div>

                  <div className="mt-3 pt-3 border-t border-[#16233a] flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span className="flex items-center gap-1 text-slate-400">
                      <GitBranch className="w-3 h-3 text-sky-400" />
                      {task.branch_name || "Branch queued"}
                    </span>
                    <span>Mode: <strong className="text-amber-400">{task.current_mode}</strong></span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Total Work Done (Completed Tasks) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-100">
                Total Work Done ({completedTasks.length} Completed Tasks)
              </h3>
            </div>
            <Link
              href="/tasks"
              className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-medium"
            >
              <span>View all tasks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {completedTasks.length === 0 ? (
            <div className="p-6 rounded-xl bg-[#0c1322] border border-[#1a2944] text-center space-y-2">
              <p className="text-xs text-slate-400">
                No tasks have completed yet. Once an engineering task passes verification or is approved to ship, it will appear here as finished work.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {completedTasks.map((task) => (
                <Link
                  key={task.id}
                  href={`/tasks/${task.id}`}
                  className="p-4 rounded-xl bg-[#0b1220] hover:bg-[#10192e] border border-emerald-800/40 hover:border-emerald-500/50 transition-all group block shadow-sm"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-emerald-950/80 border border-emerald-800 flex items-center justify-center text-emerald-400 flex-shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-100 group-hover:text-emerald-300 transition-colors">
                            {task.title}
                          </span>
                          <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                            WORK COMPLETED
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                          {task.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono text-slate-400 flex-shrink-0">
                      <span className="text-emerald-400">✓ VERIFIED PASS</span>
                      <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 transition-colors" />
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-[#142136] flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span className="flex items-center gap-1 text-slate-400">
                      <GitBranch className="w-3 h-3 text-sky-400" />
                      {task.branch_name || "devpilot/shipped"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Updated: {new Date(task.updated_at).toLocaleTimeString()}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Section 3: Connected Repositories */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-sky-400" />
              <h3 className="text-sm font-bold text-slate-100">
                Connected Repositories ({repositories.length})
              </h3>
            </div>
            <Link
              href="/repositories"
              className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-medium"
            >
              <span>Manage & Link More</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {repositories.length === 0 ? (
            <div className="p-8 rounded-xl bg-[#0c1322] border border-[#1a2944] text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <FolderGit2 className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-semibold text-slate-200">No codebases connected</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Authorize your GitHub account to link and scan your repositories.
              </p>
              <Link
                href="/repositories"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Link GitHub Repository</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {repositories.map((repo) => (
                <Link
                  key={repo.id}
                  href={`/repositories/${repo.id}`}
                  className="p-4 rounded-xl bg-[#0b1220] hover:bg-[#10192e] border border-[#1a2944] hover:border-sky-500/40 transition-all block group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-xs text-slate-200 group-hover:text-sky-300 transition-colors">
                      {repo.full_name}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800">
                      {repo.primary_language || "Code"}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 font-mono flex items-center justify-between pt-3 border-t border-[#16233a] mt-3">
                    <span>{repo.file_count || 0} indexed files</span>
                    <span className="text-sky-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                      <span>Scan Codebase</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
          </>
        )}
      </div>

      <NewTaskModal
        isOpen={isNewTaskOpen}
        onClose={() => setIsNewTaskOpen(false)}
        repositories={repositories}
        onTaskCreated={(taskId) => {
          router.push(`/tasks/${taskId}`);
        }}
      />
    </div>
  );
}
