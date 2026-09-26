"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Cpu,
  Brain,
  Plus,
  Trash2,
  Check,
  LogOut,
  Unlink,
  ShieldCheck,
  ExternalLink,
  AlertTriangle,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { Topbar } from "@/components/Topbar";
import { api, PlatformSettings, ProjectMemory, UserProfile } from "@/lib/api";

function GitHubIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [memories, setMemories] = useState<ProjectMemory[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newCategory, setNewCategory] = useState("architecture");

  const [aiProvider, setAiProvider] = useState("cleanapis");
  const [aiBaseUrl, setAiBaseUrl] = useState("https://cleanapis.com/v1");
  const [apiKey, setApiKey] = useState("");
  const [modelName, setModelName] = useState("deepseek-v4-flash-0731");
  const [executionMode, setExecutionMode] = useState("local_safe");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [disconnectSuccess, setDisconnectSuccess] = useState(false);

  const loadSettingsAndMemories = async () => {
    try {
      const [s, m] = await Promise.all([api.getSettings(), api.getMemories()]);
      setSettings(s);
      setMemories(m);
      setAiProvider(s.ai_provider || "cleanapis");
      setAiBaseUrl(s.ai_base_url || "https://cleanapis.com/v1");
      setModelName(s.ai_model_name || "deepseek-v4-flash-0731");
      setExecutionMode(s.execution_mode);
    } catch (err) {
      console.error("Failed to load settings:", err);
    }

    try {
      const u = await api.getCurrentUser();
      setUserProfile(u);
    } catch {
      setUserProfile(null);
    }
  };

  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleDisconnectGitHub = async () => {
    try {
      await api.disconnectGitHub();
      setUserProfile(null);
      setDisconnectSuccess(true);
      setTimeout(() => setDisconnectSuccess(false), 3000);
    } catch (err) {
      console.error("Disconnect GitHub failed:", err);
    }
  };

  const handleResetDemo = async () => {
    if (!window.confirm("Are you sure you want to completely erase all tasks, repositories, symbols, and demo data? This gives you a 100% clean slate for recording your demo.")) {
      return;
    }
    setIsResetting(true);
    try {
      await api.resetDemoData();
      setResetSuccess(true);
      setUserProfile(null);
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    } catch (err) {
      console.error("Reset demo failed:", err);
    } finally {
      setIsResetting(false);
    }
  };

  useEffect(() => {
    loadSettingsAndMemories();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const updated = await api.updateSettings({
        ai_provider: aiProvider,
        ai_base_url: aiBaseUrl,
        ai_model_name: modelName,
        execution_mode: executionMode,
        ai_api_key: apiKey || undefined,
      });
      setSettings(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Save settings error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim() || !newValue.trim()) return;

    try {
      const mem = await api.addMemory(newKey.trim(), newValue.trim(), newCategory);
      setMemories((prev) => [mem, ...prev]);
      setNewKey("");
      setNewValue("");
    } catch (err) {
      console.error("Add memory failed:", err);
    }
  };

  const handleDeleteMemory = async (id: string) => {
    try {
      await api.deleteMemory(id);
      setMemories((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error("Delete memory failed:", err);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar
        title="Settings & Project Memories"
        subtitle="AI Model Providers, Execution Sandbox, and Explicit Architecture Context"
      />

      <div className="p-6 space-y-8 max-w-5xl mx-auto w-full">
        {/* Section 0: GitHub Account Integration */}
        <div className="p-6 rounded-xl bg-[#0b1220] border border-[#1a2944] space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#16233a]">
            <div className="flex items-center gap-2.5">
              <GitHubIcon className="w-5 h-5 text-slate-100" />
              <div>
                <h3 className="text-sm font-bold text-slate-100">GitHub Integration & Access</h3>
                <p className="text-xs text-slate-400">
                  Manage your authenticated GitHub account session and repository permissions.
                </p>
              </div>
            </div>
            {userProfile ? (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-800 text-[11px] text-emerald-400 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                CONNECTED
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-[11px] text-slate-400 font-mono">
                NOT CONNECTED
              </span>
            )}
          </div>

          {disconnectSuccess && (
            <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800 text-xs text-emerald-300">
              GitHub account disconnected successfully. Stored tokens and active sessions purged.
            </div>
          )}

          {userProfile ? (
            <div className="flex items-center justify-between p-4 rounded-lg bg-[#070b14] border border-[#16233a]">
              <div className="flex items-center gap-3">
                {userProfile.avatar_url ? (
                  <img
                    src={userProfile.avatar_url}
                    alt={userProfile.username}
                    className="w-10 h-10 rounded-full border border-slate-700"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold text-xs">
                    {userProfile.username[0]?.toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="text-xs font-bold text-slate-100 flex items-center gap-2">
                    <span>{userProfile.name || userProfile.username}</span>
                    <span className="text-[11px] text-slate-500 font-mono">@{userProfile.username}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Workspace: <span className="text-slate-300 font-mono">{userProfile.workspace_name}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/repositories"
                  className="px-3 py-1.5 rounded-lg bg-[#0f172a] hover:bg-[#1e293b] border border-slate-700 text-slate-300 text-xs font-medium transition-colors"
                >
                  Manage Repos
                </Link>
                <button
                  onClick={handleDisconnectGitHub}
                  className="px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 text-xs font-medium transition-colors flex items-center gap-1.5"
                >
                  <Unlink className="w-3.5 h-3.5" />
                  <span>Disconnect</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 rounded-lg bg-[#070b14] border border-[#16233a]">
              <div>
                <p className="text-xs font-semibold text-slate-200">No GitHub Account Connected</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Connect your GitHub account to access private repositories and open automated Pull Requests.
                </p>
              </div>
              <Link
                href="/auth"
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors"
              >
                <GitHubIcon className="w-3.5 h-3.5" />
                <span>Connect GitHub</span>
              </Link>
            </div>
          )}
        </div>

        {/* Section 0.5: Demo Recording Reset & Clean Slate */}
        <div className="p-6 rounded-xl bg-gradient-to-r from-purple-950/20 via-[#0b1220] to-indigo-950/20 border border-purple-800/40 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#16233a]">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <div>
                <h3 className="text-sm font-bold text-slate-100">🎬 Demo Video Mode & Clean Slate Reset</h3>
                <p className="text-xs text-slate-400">
                  Wipe all stored database records (tasks, repos, diffs, sessions) to record a fresh, authentic demo video.
                </p>
              </div>
            </div>
            <button
              onClick={handleResetDemo}
              disabled={isResetting}
              className="px-4 py-2 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-200 text-xs font-semibold flex items-center gap-2 transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? "animate-spin" : ""}`} />
              <span>{isResetting ? "Erasing Database..." : "Reset All Demo Data & Sign Out"}</span>
            </button>
          </div>

          {resetSuccess && (
            <div className="p-3 rounded-lg bg-emerald-950/50 border border-emerald-800 text-xs text-emerald-300 font-medium">
              ✅ All demo data, tasks, repositories, and active sessions have been wiped! Redirecting to home page...
            </div>
          )}

          <div className="p-4 rounded-lg bg-[#070b14] border border-[#16233a] space-y-3">
            <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-purple-900/60 text-purple-300 flex items-center justify-center text-[10px] font-mono">ℹ</span>
              How to Record the Real GitHub Authorization Step in Your Video:
            </h4>
            <div className="space-y-2 text-xs text-slate-300">
              <p>
                <strong>Step 1:</strong> Click the red <strong>&ldquo;Reset All Demo Data &amp; Sign Out&rdquo;</strong> button above to wipe all database state.
              </p>
              <p>
                <strong>Step 2:</strong> Because GitHub remembers past authorizations, open your GitHub Authorized Apps settings and click <strong>&ldquo;Revoke&rdquo;</strong> on Pasha DevPilot:
              </p>
              <div className="pt-1">
                <a
                  href="https://github.com/settings/applications"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0f172a] hover:bg-[#1e293b] border border-slate-700 text-sky-400 hover:text-sky-300 text-xs font-medium transition-colors"
                >
                  <GitHubIcon className="w-3.5 h-3.5" />
                  <span>Open GitHub Authorized OAuth Apps (Revoke DevPilot)</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-slate-400 text-[11px] pt-1">
                <strong>Step 3:</strong> Click <strong>&ldquo;Connect GitHub&rdquo;</strong> on the home or auth page. GitHub will now show the full green <strong>&ldquo;Authorize Pasha DevPilot&rdquo;</strong> screen for your video recording!
              </p>
            </div>
          </div>
        </div>

        {/* Section 1: AI Provider Configuration */}
        <div className="p-6 rounded-xl bg-[#0b1220] border border-[#1a2944] space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#16233a]">
            <div className="flex items-center gap-2.5">
              <Cpu className="w-5 h-5 text-sky-400" />
              <div>
                <h3 className="text-sm font-bold text-slate-100">AI Model Provider Configuration</h3>
                <p className="text-xs text-slate-400">Decoupled provider abstraction (Section 7 & 66)</p>
              </div>
            </div>
            {saveSuccess && (
              <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded border border-emerald-800">
                <Check className="w-3.5 h-3.5" />
                Settings Saved
              </span>
            )}
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  AI Provider Selection
                </label>
                <select
                  value={aiProvider}
                  onChange={(e) => {
                    const p = e.target.value;
                    setAiProvider(p);
                    if (p === "cleanapis") {
                      setAiBaseUrl("https://cleanapis.com/v1");
                      setModelName("deepseek-v4-flash-0731");
                    } else if (p === "openai") {
                      setAiBaseUrl("https://api.openai.com/v1");
                      setModelName("gpt-4o");
                    }
                  }}
                  className="w-full px-3 py-2 bg-[#060a14] border border-[#1e2f4f] rounded-lg text-xs text-slate-100 focus:outline-none focus:border-sky-400 font-medium"
                >
                  <option value="cleanapis">CleanAPIs (DeepSeek, Claude, GPT — Recommended)</option>
                  <option value="openai">OpenAI Direct (GPT-4o, o1, o3-mini)</option>
                  <option value="anthropic">Anthropic Direct (Claude 3.5 Sonnet)</option>
                  <option value="gemini">Google Gemini (Gemini 1.5 Pro, 2.0)</option>
                  <option value="mock">Deterministic Local Mock (Offline & Testing)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Model Identifier
                </label>
                <input
                  type="text"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#060a14] border border-[#1e2f4f] rounded-lg text-xs text-slate-100 focus:outline-none focus:border-sky-400 font-mono"
                />
              </div>
            </div>

            {aiProvider === "cleanapis" && (
              <div className="p-3 rounded-lg bg-[#070d1a] border border-[#16253f] space-y-2">
                <span className="text-[11px] font-semibold text-sky-400 font-mono">
                  CLEANAPIS RECOMMENDED MODELS (Optimized for DevPilot):
                </span>
                <div className="flex flex-wrap gap-2 text-xs">
                  {[
                    { id: "deepseek-v4-flash-0731", label: "deepseek-v4-flash-0731 ($0.000115/1k · Ultra Low Cost)" },
                    { id: "deepseek-v4-pro-0813", label: "deepseek-v4-pro-0813 ($0.000552/1k · Top Code Reasoning)" },
                    { id: "gemini-3.7-flash", label: "gemini-3.7-flash ($0.001242/1k · 1M Context)" },
                    { id: "claude-sonnet-5", label: "claude-sonnet-5 ($0.0033235/1k · Architecture & Diffs)" },
                  ].map((preset) => (
                    <button
                      type="button"
                      key={preset.id}
                      onClick={() => setModelName(preset.id)}
                      className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors ${
                        modelName === preset.id
                          ? "bg-sky-500/20 text-sky-300 border border-sky-500/50 font-bold"
                          : "bg-[#0c1424] text-slate-400 hover:text-slate-200 border border-[#1a2b47]"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Endpoint Base URL
                </label>
                <input
                  type="text"
                  value={aiBaseUrl}
                  onChange={(e) => setAiBaseUrl(e.target.value)}
                  placeholder="https://cleanapis.com/v1"
                  className="w-full px-3 py-2 bg-[#060a14] border border-[#1e2f4f] rounded-lg text-xs text-slate-100 focus:outline-none focus:border-sky-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  API Key (Stored locally in environment)
                </label>
                <input
                  type="password"
                  placeholder={settings?.masked_api_key || "Enter provider API key"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full px-3 py-2 bg-[#060a14] border border-[#1e2f4f] rounded-lg text-xs text-slate-100 focus:outline-none focus:border-sky-400 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Execution Mode
                </label>
                <select
                  value={executionMode}
                  onChange={(e) => setExecutionMode(e.target.value)}
                  className="w-full px-3 py-2 bg-[#060a14] border border-[#1e2f4f] rounded-lg text-xs text-slate-100 focus:outline-none focus:border-sky-400"
                >
                  <option value="local_safe">Local Safe Sandbox (Allowlisted binaries)</option>
                  <option value="sandbox">Isolated Subprocess Jail</option>
                  <option value="mock">Dry Run / Simulation</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-sky-600/20 transition-all disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Provider Configuration"}
              </button>
            </div>
          </form>
        </div>

        {/* Section 2: Project-Level Memories */}
        <div className="p-6 rounded-xl bg-[#0b1220] border border-[#1a2944] space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#16233a]">
            <div className="flex items-center gap-2.5">
              <Brain className="w-5 h-5 text-indigo-400" />
              <div>
                <h3 className="text-sm font-bold text-slate-100">Project-Level Memories (Inspectable & Editable)</h3>
                <p className="text-xs text-slate-400">
                  Explicit conventions passed to agent context. Does not override ground-truth repository evidence.
                </p>
              </div>
            </div>
            <span className="font-mono text-xs text-slate-400">{memories.length} memories stored</span>
          </div>

          {/* Add New Memory Form */}
          <form onSubmit={handleAddMemory} className="p-4 rounded-lg bg-[#070b14] border border-[#16233a] space-y-3">
            <h4 className="text-xs font-semibold text-slate-200">Record New Architecture Memory</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <input
                  type="text"
                  placeholder="Key (e.g. TestFramework)"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#0b1220] border border-[#1e2f4f] rounded text-xs text-slate-200 font-mono focus:outline-none focus:border-sky-400"
                />
              </div>

              <div className="sm:col-span-2 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Value (e.g. Project uses pytest with asyncio mode)"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-[#0b1220] border border-[#1e2f4f] rounded text-xs text-slate-200 focus:outline-none focus:border-sky-400"
                />

                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="px-2 py-1.5 bg-[#0b1220] border border-[#1e2f4f] rounded text-xs text-slate-300"
                >
                  <option value="architecture">Architecture</option>
                  <option value="testing">Testing</option>
                  <option value="auth">Auth</option>
                </select>

                <button
                  type="submit"
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-medium transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>
          </form>

          {/* Existing Memories List */}
          <div className="space-y-2">
            {memories.map((m) => (
              <div
                key={m.id}
                className="p-3 rounded-lg bg-[#070b14] border border-[#152033] flex items-center justify-between text-xs font-mono"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 uppercase">
                    {m.category}
                  </span>
                  <span className="text-sky-300 font-semibold">{m.key}:</span>
                  <span className="text-slate-300 font-sans">{m.value}</span>
                </div>

                <button
                  onClick={() => handleDeleteMemory(m.id)}
                  className="p-1 hover:bg-rose-950/60 rounded text-slate-500 hover:text-rose-400 transition-colors"
                  title="Delete memory"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
