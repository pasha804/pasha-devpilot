"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RotateCw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in Pasha DevPilot component:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#070b14] flex items-center justify-center p-6 text-slate-100">
          <div className="max-w-md w-full bg-[#0c1322] border border-rose-500/40 rounded-2xl p-8 shadow-2xl space-y-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-rose-950/60 border border-rose-500/50 flex items-center justify-center mx-auto text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.3)]">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-bold text-white tracking-tight">Something Went Wrong</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                An unexpected error occurred in the DevPilot client application. The isolated sandbox and backend remain safe.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-[#060a14] border border-slate-800 rounded-xl text-left text-xs font-mono text-rose-300 overflow-x-auto max-h-32">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <a
                href="/dashboard"
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Return Home</span>
              </a>

              <button
                onClick={this.handleReset}
                className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-cyan-500/25 transition-all"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Reload Page</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
