"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  KeyRound,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RotateCcw,
} from "lucide-react";
import { api, API_BASE, setAuthToken } from "@/lib/api";

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

export default function AuthPage() {
  const router = useRouter();
  const [oauthConfig, setOauthConfig] = useState<{
    url: string | null;
    is_configured: boolean;
    register_app_url?: string;
    generate_pat_url?: string;
  } | null>(null);

  const [patInput, setPatInput] = useState("");
  const [isLoadingOAuth, setIsLoadingOAuth] = useState(false);
  const [isLoadingPAT, setIsLoadingPAT] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function fetchOAuthConfig() {
      try {
        const res = await fetch(`${API_BASE}/auth/github/url`);
        if (res.ok) {
          const data = await res.json();
          setOauthConfig(data);
        }
      } catch (err) {
        console.error("Failed to fetch OAuth config:", err);
      }
    }
    fetchOAuthConfig();
  }, []);

  const handleConnectGitHub = async () => {
    setIsLoadingOAuth(true);
    setStatusMessage(null);
    try {
      const res = await fetch(`${API_BASE}/auth/github?redirect=false`);
      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
          return;
        }
      }
      if (oauthConfig?.url) {
        window.location.href = oauthConfig.url;
      } else {
        setStatusMessage({
          type: "error",
          text: "GitHub OAuth credentials not configured on the backend. Please use a Personal Access Token below or configure GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET.",
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to initiate GitHub OAuth";
      setStatusMessage({ type: "error", text: msg });
    } finally {
      setIsLoadingOAuth(false);
    }
  };

  const handlePATLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patInput.trim()) return;

    setIsLoadingPAT(true);
    setStatusMessage(null);
    try {
      await api.connectGitHubToken(patInput.trim());
      setStatusMessage({ type: "success", text: "Authenticated successfully! Redirecting..." });
      setTimeout(() => router.push("/repositories"), 800);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid Personal Access Token. Check scopes: repo, read:user";
      setStatusMessage({ type: "error", text: msg });
    } finally {
      setIsLoadingPAT(false);
    }
  };

  const handleDevLogin = async () => {
    setStatusMessage(null);
    try {
      await api.developerLogin();
      setStatusMessage({ type: "success", text: "Logged in with Developer profile. Redirecting..." });
      setTimeout(() => router.push("/repositories"), 800);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Developer login failed";
      setStatusMessage({ type: "error", text: msg });
    }
  };

  const [isResetting, setIsResetting] = useState(false);

  const handleResetDemo = async () => {
    if (!window.confirm("Erase all stored user sessions, tasks, and repositories to start 100% fresh?")) return;
    setIsResetting(true);
    setStatusMessage(null);
    try {
      await api.resetDemoData();
      setStatusMessage({
        type: "success",
        text: "Clean slate! All demo data, tasks, repositories, and local sessions have been completely erased.",
      });
    } catch {
      setStatusMessage({ type: "error", text: "Failed to reset demo data on server." });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-sky-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center gap-2.5 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/25">
              <span className="text-white font-bold text-sm">PD</span>
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">Pasha DevPilot</span>
          </div>
          <h1 className="text-lg font-bold text-slate-100">Sign in to DevPilot</h1>
          <p className="text-xs text-slate-400">
            Connect your GitHub account to access repositories, plan tasks, and generate pull requests.
          </p>
        </div>

        {/* Feedback message banner */}
        {statusMessage && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
              statusMessage.type === "success"
                ? "bg-emerald-950/40 border-emerald-800 text-emerald-300"
                : "bg-rose-950/40 border-rose-800 text-rose-300"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            )}
            <div className="flex-1">{statusMessage.text}</div>
          </div>
        )}

        {/* Main authentication card */}
        <div className="p-6 rounded-2xl bg-[#0c1322] border border-[#1a2944] shadow-2xl space-y-5">
          {/* Primary Action: Connect GitHub */}
          <div className="space-y-3">
            <button
              onClick={handleConnectGitHub}
              disabled={isLoadingOAuth}
              className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-white text-slate-950 font-bold text-xs flex items-center justify-center gap-2.5 transition-all shadow-md shadow-white/5 disabled:opacity-50"
            >
              {isLoadingOAuth ? (
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
              ) : (
                <GitHubIcon className="w-4 h-4 text-slate-950" />
              )}
              <span>Connect GitHub</span>
              <ArrowRight className="w-3.5 h-3.5 ml-auto text-slate-600" />
            </button>
            <p className="text-[11px] text-slate-500 text-center font-mono">
              OAuth 2.0 authorization · Scopes: repo, read:user
            </p>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-800" />
            <span className="flex-shrink mx-3 text-[10px] text-slate-500 uppercase tracking-widest font-mono">
              Or Use Personal Access Token
            </span>
            <div className="flex-grow border-t border-slate-800" />
          </div>

          {/* Alternative: PAT form */}
          <form onSubmit={handlePATLogin} className="space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="pat" className="font-medium text-slate-300 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-sky-400" />
                  GitHub Personal Access Token (PAT)
                </label>
                {oauthConfig?.generate_pat_url && (
                  <a
                    href={oauthConfig.generate_pat_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1"
                  >
                    Generate Token <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
              <input
                id="pat"
                type="password"
                value={patInput}
                onChange={(e) => setPatInput(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#070b14] border border-[#1a2944] focus:border-sky-500 text-xs text-white placeholder-slate-600 outline-none font-mono transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isLoadingPAT || !patInput.trim()}
              className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors disabled:text-slate-500"
            >
              {isLoadingPAT ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ShieldCheck className="w-3.5 h-3.5" />
              )}
              <span>Authenticate with Token</span>
            </button>
          </form>

          {/* Local developer one-click fallback */}
          <div className="pt-2 border-t border-slate-800/80">
            <button
              onClick={handleDevLogin}
              className="w-full py-2 px-3 rounded-lg bg-[#070b14] hover:bg-[#111a2e] border border-slate-800 text-slate-400 hover:text-slate-200 text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>One-Click Local Dev Mode (No Token Required)</span>
            </button>
          </div>
        </div>

        {/* Demo Video Reset & Fresh Recording Helper */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/30 via-[#0c1322] to-indigo-950/30 border border-purple-800/40 text-xs space-y-2.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-purple-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              Demo Video Reset Tool
            </span>
            <button
              onClick={handleResetDemo}
              disabled={isResetting}
              className="px-2.5 py-1 rounded-lg bg-rose-900/50 hover:bg-rose-800 border border-rose-700/60 text-rose-200 text-[11px] font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <RotateCcw className={`w-3 h-3 ${isResetting ? "animate-spin" : ""}`} />
              <span>{isResetting ? "Erasing..." : "Erase All Demo Data"}</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Want to record GitHub&apos;s green <strong>&ldquo;Authorize Pasha DevPilot&rdquo;</strong> screen on camera?
            Revoke the app once in{" "}
            <a
              href="https://github.com/settings/applications"
              target="_blank"
              rel="noreferrer"
              className="text-sky-400 underline hover:text-sky-300 inline-flex items-center gap-0.5"
            >
              GitHub Authorized Apps <ExternalLink className="w-2.5 h-2.5" />
            </a>{" "}
            before clicking Connect GitHub above.
          </p>
        </div>

        {/* Security badge & guarantee */}
        <div className="p-3.5 rounded-xl bg-[#0c1322]/50 border border-slate-800/60 text-center space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Zero-Exposure Server-Side Security</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Your GitHub tokens are handled exclusively by the server and never exposed to the browser or AI models.
          </p>
        </div>
      </div>
    </div>
  );
}
