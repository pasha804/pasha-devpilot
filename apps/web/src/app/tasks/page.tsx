"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ListTodo,
  Plus,
  Search,
  RotateCw,
  GitBranch,
  ArrowRight,
  Clock,
  Activity,
  Trophy,
  CheckCircle2,
} from "lucide-react";
import { Topbar } from "@/components/Topbar";
import { StatusIndicator } from "@/components/StatusIndicator";
import { NewTaskModal } from "@/components/NewTaskModal";
import { api, TaskItem, RepositoryItem } from "@/lib/api";

export default function TasksListPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [repositories, setRepositories] = useState<RepositoryItem[]>([]);
  const [filterState, setFilterState] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [allTasks, allRepos] = await Promise.all([
        api.getTasks(),
        api.getRepositories(),
      ]);
      setTasks(allTasks);
      setRepositories(allRepos);
    } catch (err) {
      console.error("Failed to load tasks:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const isTaskCompleted = (t: TaskItem) =>
    t.state === "COMPLETED" ||
    t.state === "READY_TO_SHIP" ||
    (t.verification_passed === true && t.file_changes && t.file_changes.length > 0);

  const activeTasks = tasks.filter(
    (t) => !isTaskCompleted(t) && t.state !== "CANCELLED"
  );

  const completedTasks = tasks.filter(isTaskCompleted);

  const filtered = tasks.filter((t) => {
    const matchesQuery =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.classification.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesQuery) return false;

    if (filterState === "ALL") return true;
    if (filterState === "ACTIVE")
      return !isTaskCompleted(t) && t.state !== "CANCELLED";
    if (filterState === "DONE")
      return isTaskCompleted(t);
    if (filterState === "APPROVAL")
      return t.state === "WAITING_FOR_APPROVAL";

    return true;
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar
        title="Tasks & Agent Runs"
        subtitle="Autonomous Engineering Tasks, Live Work in Flight & Shipped Work"
        onNewTask={() => setIsNewTaskOpen(true)}
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[#0c1322] border border-amber-500/30 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs font-mono text-slate-400">ACTIVE WORK IN PROGRESS</p>
              <p className="text-2xl font-bold text-amber-400 mt-1">{activeTasks.length}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Tasks currently in flight</p>
            </div>
            <div className="p-2.5 rounded-lg bg-amber-950/60 border border-amber-800 text-amber-400">
              <Activity className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0c1322] border border-emerald-800/40 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs font-mono text-emerald-400">TOTAL WORK DONE</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">{completedTasks.length}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Finished, verified & ready to ship</p>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-400">
              <Trophy className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0c1322] border border-[#1a2944] flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs font-mono text-slate-400">ALL REGISTERED TASKS</p>
              <p className="text-2xl font-bold text-white mt-1">{tasks.length}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Total agent lifecycle history</p>
            </div>
            <div className="p-2.5 rounded-lg bg-sky-950/60 border border-sky-800 text-sky-400">
              <ListTodo className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 max-w-lg">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search tasks by title, classification, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#0c1322] border border-[#1a2944] rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center bg-[#0c1322] border border-[#1a2944] rounded-lg p-1 text-xs">
              {[
                { id: "ALL", label: `All (${tasks.length})` },
                { id: "ACTIVE", label: `Active (${activeTasks.length})` },
                { id: "DONE", label: `Done (${completedTasks.length})` },
                { id: "APPROVAL", label: "Approval" },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setFilterState(st.id)}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                    filterState === st.id
                      ? "bg-sky-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => loadData()}
              className="p-2 rounded-lg bg-[#0c1322] hover:bg-[#121c2e] border border-[#1a2944] text-slate-400 hover:text-slate-200 transition-colors"
              title="Refresh"
            >
              <RotateCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>

            <button
              onClick={() => setIsNewTaskOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-sky-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>New Task</span>
            </button>
          </div>
        </div>

        {/* Tasks List */}
        {filtered.length === 0 ? (
          <div className="p-12 rounded-xl bg-[#0b1220] border border-[#1a2944] text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <ListTodo className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-200">No matching engineering tasks</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {filterState === "ACTIVE"
                ? "No active tasks are currently running. All work has finished or been shipped."
                : "Launch a new task to let Pasha DevPilot investigate and resolve an issue."}
            </p>
            <button
              onClick={() => setIsNewTaskOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Task</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((task) => {
              const isDone = task.state === "COMPLETED" || task.state === "READY_TO_SHIP";
              return (
                <Link
                  key={task.id}
                  href={`/tasks/${task.id}`}
                  className={`block p-5 rounded-xl bg-[#0b1220] hover:bg-[#10192e] border transition-all group ${
                    isDone
                      ? "border-emerald-800/40 hover:border-emerald-500/50"
                      : "border-amber-500/30 hover:border-amber-500/60"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span
                          className={`font-mono text-[10px] px-2 py-0.5 rounded border ${
                            isDone
                              ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                              : "bg-amber-950 text-amber-300 border-amber-800"
                          }`}
                        >
                          {isDone ? "WORK DONE" : "ACTIVE WORK"}
                        </span>
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {task.classification}
                        </span>
                        <span className="text-sm font-bold text-slate-100 group-hover:text-sky-300 transition-colors">
                          {task.title}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 line-clamp-1 max-w-2xl">
                        {task.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <StatusIndicator status={task.state} size="sm" />
                      <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#16233a] flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-slate-400">
                        <GitBranch className="w-3.5 h-3.5 text-sky-400/80" />
                        {task.branch_name || "Branch queued"}
                      </span>
                      <span>•</span>
                      <span>Mode: <strong className="text-slate-300">{task.current_mode}</strong></span>
                      {task.verification_passed && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> VERIFIED
                          </span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>Updated: {new Date(task.updated_at).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
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
