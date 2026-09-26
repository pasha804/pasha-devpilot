"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

interface ToastContextValue {
  showToast: (toast: Omit<ToastMessage, "id">) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type, title, description }: Omit<ToastMessage, "id">) => {
      const id = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setToasts((prev) => [...prev, { id, type, title, description }]);

      setTimeout(() => {
        removeToast(id);
      }, 4500);
    },
    [removeToast]
  );

  const success = useCallback(
    (title: string, description?: string) => showToast({ type: "success", title, description }),
    [showToast]
  );

  const error = useCallback(
    (title: string, description?: string) => showToast({ type: "error", title, description }),
    [showToast]
  );

  const info = useCallback(
    (title: string, description?: string) => showToast({ type: "info", title, description }),
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, success, error, info }}>
      {children}

      {/* Toast Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-2xl backdrop-blur-md transition-all animate-in slide-in-from-bottom-5 duration-200 ${
              toast.type === "success"
                ? "bg-[#071318]/95 border-emerald-500/50 text-emerald-200 shadow-emerald-950/40"
                : toast.type === "error"
                ? "bg-[#180a10]/95 border-rose-500/50 text-rose-200 shadow-rose-950/40"
                : "bg-[#0a1220]/95 border-cyan-500/50 text-cyan-200 shadow-cyan-950/40"
            }`}
          >
            {toast.type === "success" && (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            )}
            {toast.type === "error" && (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            )}
            {toast.type === "info" && (
              <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            )}

            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-white tracking-tight">{toast.title}</h4>
              {toast.description && (
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug break-words">
                  {toast.description}
                </p>
              )}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-1 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    // Fallback if rendered outside ToastProvider
    return {
      showToast: () => {},
      success: (msg: string) => console.log("[Toast Success]", msg),
      error: (msg: string) => console.error("[Toast Error]", msg),
      info: (msg: string) => console.info("[Toast Info]", msg),
    };
  }
  return context;
}
