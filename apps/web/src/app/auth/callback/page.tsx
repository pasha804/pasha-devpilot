"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { API_BASE, setAuthToken } from "@/lib/api";

/**
 * GitHub OAuth Callback Content
 * Receives the OAuth code from GitHub, exchanges it for a JWT, and redirects to dashboard.
 */
function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCallback = useCallback(async (code: string, state?: string | null) => {
    try {
      const res = await fetch(`${API_BASE}/auth/github/callback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, state: state || undefined }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Auth failed: ${err}`);
      }

      const data = await res.json();
      setAuthToken(data.access_token);
      setStatus("success");

      // Short pause then redirect to repository hub
      setTimeout(() => router.push("/repositories"), 800);
    } catch (err: unknown) {
      setStatus("error");
      const message = err instanceof Error ? err.message : "Authentication failed. Please try again.";
      setErrorMsg(message);
    }
  }, [router]);

  const hasTriggeredRef = React.useRef(false);

  useEffect(() => {
    const directToken = searchParams.get("token");
    if (directToken) {
      setAuthToken(directToken);
      setStatus("success");
      setTimeout(() => router.push("/repositories"), 800);
      return;
    }

    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");
    const errorDesc = searchParams.get("error_description");

    if (error) {
      setStatus("error");
      setErrorMsg(errorDesc || `GitHub OAuth denied: ${error}`);
      return;
    }

    if (!code) {
      setStatus("error");
      setErrorMsg("No authorization code received from GitHub.");
      return;
    }

    if (hasTriggeredRef.current) return;
    hasTriggeredRef.current = true;

    handleCallback(code, state);
  }, [searchParams, handleCallback]);

  return (
    <div className="min-h-screen bg-[#070b14] flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6 text-center">
        {/* Brand */}
        <div className="flex items-center justify-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/25">
            <span className="text-white font-bold text-sm">PD</span>
          </div>
          <span className="text-lg font-bold text-white tracking-tight">Pasha DevPilot</span>
        </div>

        {/* Status panel */}
        <div className="p-8 rounded-2xl bg-[#0c1322] border border-[#1a2944] shadow-xl space-y-5">
          {status === "loading" && (
            <>
              <div className="w-14 h-14 rounded-full bg-sky-950/60 border border-sky-800 flex items-center justify-center mx-auto">
                <Loader2 className="w-7 h-7 text-sky-400 animate-spin" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-100">Authenticating with GitHub</h2>
                <p className="text-xs text-slate-400 mt-1.5">
                  Exchanging authorization code for secure session token...
                </p>
              </div>
              <div className="space-y-1.5 text-xs text-slate-500 font-mono text-left bg-[#070b14] p-3 rounded-lg border border-[#16233a]">
                <p>→ Receiving OAuth authorization code</p>
                <p>→ Exchanging code for access token</p>
                <p>→ Fetching GitHub user profile</p>
                <p>→ Establishing secure JWT session</p>
              </div>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-14 h-14 rounded-full bg-emerald-950/60 border border-emerald-800 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-100">Authentication Successful</h2>
                <p className="text-xs text-slate-400 mt-1.5">
                  Redirecting to your DevPilot workstation...
                </p>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-400 font-mono">
                <Sparkles className="w-3.5 h-3.5" />
                <span>GitHub connected successfully</span>
              </div>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-14 h-14 rounded-full bg-rose-950/60 border border-rose-800 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-7 h-7 text-rose-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-100">Authentication Failed</h2>
                <p className="text-xs text-rose-400 mt-1.5 font-mono bg-rose-950/30 border border-rose-800/50 p-2 rounded">
                  {errorMsg}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => router.push("/")}
                  className="flex-1 px-4 py-2 bg-[#111a2e] hover:bg-[#18243e] border border-[#1e2f4f] text-slate-300 rounded-lg text-xs font-medium transition-colors"
                >
                  Return to Home
                </button>
                <button
                  onClick={() => router.push("/dashboard")}
                  className="flex-1 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-medium shadow-md shadow-sky-600/20 transition-all"
                >
                  Try Dev Mode
                </button>
              </div>
            </>
          )}
        </div>

        <p className="text-[11px] text-slate-600 font-mono">
          Pasha DevPilot · Secure OAuth 2.0
        </p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#070b14] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
