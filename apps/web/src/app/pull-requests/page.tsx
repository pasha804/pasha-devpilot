"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  GitPullRequest,
  ExternalLink,
  RotateCw,
  GitBranch,
  Clock,
} from "lucide-react";
import { Topbar } from "@/components/Topbar";
import { api, PullRequestItem } from "@/lib/api";

export default function PullRequestsPage() {
  const [pullRequests, setPullRequests] = useState<PullRequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadPullRequests = async () => {
    setIsLoading(true);
    try {
      const data = await api.getPullRequests();
      setPullRequests(data);
    } catch (err) {
      console.error("Failed to load PRs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPullRequests();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar
        title="Pull Requests"
        subtitle="Automated, Verified Pull Requests Prepared by DevPilot"
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-400">
            Pull requests generated after passing verification in isolated test sandboxes.
          </p>
          <button
            onClick={() => loadPullRequests()}
            className="p-2 rounded-lg bg-[#0c1322] hover:bg-[#121c2e] border border-[#1a2944] text-slate-400 hover:text-slate-200 transition-colors"
            title="Refresh PRs"
          >
            <RotateCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {pullRequests.length === 0 ? (
          <div className="p-12 rounded-xl bg-[#0b1220] border border-[#1a2944] text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <GitPullRequest className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-200">No pull requests prepared yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              When an engineering task is verified, you can open a pull request with one click.
            </p>
            <Link
              href="/tasks"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              <span>View Tasks</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {pullRequests.map((pr) => (
              <div
                key={pr.id}
                className="p-5 rounded-xl bg-[#0b1220] border border-[#1a2944] shadow-sm space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-md bg-purple-950/80 text-purple-400 border border-purple-800">
                      <GitPullRequest className="w-4 h-4" />
                    </span>
                    <h3 className="text-sm font-bold text-slate-100">{pr.title}</h3>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                      VERIFIED PASS
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link
                      href={`/tasks/${pr.task_id}`}
                      className="text-xs text-sky-400 hover:text-sky-300 font-medium"
                    >
                      View Linked Task
                    </Link>

                    {pr.pr_url && (
                      <a
                        href={pr.pr_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 px-3 py-1.5 bg-[#121c2e] hover:bg-[#18263e] border border-[#1e2f4f] rounded text-xs text-slate-200 transition-colors"
                      >
                        <span>GitHub PR #{pr.pr_number || 42}</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#070b14] border border-[#16233a] font-mono text-xs text-slate-300 whitespace-pre-wrap max-h-36 overflow-y-auto">
                  {pr.body}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-2 border-t border-[#16233a]">
                  <div className="flex items-center gap-2 text-slate-400">
                    <GitBranch className="w-3.5 h-3.5 text-sky-400" />
                    <span>{pr.head_branch}</span>
                    <span>→</span>
                    <span>{pr.base_branch}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(pr.created_at).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
