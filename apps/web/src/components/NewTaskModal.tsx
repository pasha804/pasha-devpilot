"use client";

import React, { useState } from "react";
import { Plus, X, Sparkles, Loader2 } from "lucide-react";
import { api, RepositoryItem } from "@/lib/api";

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  repositories: RepositoryItem[];
  onTaskCreated: (taskId: string) => void;
}

export function NewTaskModal({
  isOpen,
  onClose,
  repositories,
  onTaskCreated,
}: NewTaskModalProps) {
  const [selectedRepoId, setSelectedRepoId] = useState(repositories[0]?.id || "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRepoId || !title.trim() || !description.trim()) {
      setError("Please fill out all required fields.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const task = await api.createTask({
        repository_id: selectedRepoId,
        title: title.trim(),
        description: description.trim(),
      });
      // Automatically trigger initial investigation
      await api.triggerInvestigation(task.id);
      onTaskCreated(task.id);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create task");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreloadDemoBug = () => {
    setTitle("Fix inverted token expiration check in AuthService");
    setDescription(
      "Investigate auth_service.py in demo-repo. Freshly issued tokens fail validation because the expiration condition is inverted (current_timestamp < ... instead of > ...). Fix the logic and ensure unit tests pass."
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#0c1322] border border-[#1b2a47] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 border-b border-[#1b2a47] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/30">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Create New Engineering Task</h3>
              <p className="text-xs text-slate-400">Pasha DevPilot will investigate, plan, and verify changes.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-[#152035] rounded text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* Repository Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Target Repository *
            </label>
            <select
              value={selectedRepoId}
              onChange={(e) => setSelectedRepoId(e.target.value)}
              className="w-full px-3 py-2 bg-[#060a14] border border-[#1e2f4f] rounded-lg text-xs text-slate-100 focus:outline-none focus:border-sky-400"
            >
              {repositories.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.full_name} ({r.primary_language || "General"})
                </option>
              ))}
            </select>
          </div>

          {/* Task Title */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Task Title *
              </label>
              <button
                type="button"
                onClick={handlePreloadDemoBug}
                className="text-[11px] text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>Preload Demo Bug</span>
              </button>
            </div>
            <input
              type="text"
              placeholder="e.g. Fix token expiration logic in auth_service"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-[#060a14] border border-[#1e2f4f] rounded-lg text-xs text-slate-100 focus:outline-none focus:border-sky-400"
            />
          </div>

          {/* Task Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Detailed Task Description *
            </label>
            <textarea
              rows={4}
              placeholder="Describe the issue, expected behavior, and relevant components..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-[#060a14] border border-[#1e2f4f] rounded-lg text-xs text-slate-100 focus:outline-none focus:border-sky-400"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-[#1b2a47] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-600/20 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Launching Agent...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Start Autonomous Task</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
