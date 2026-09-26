"use client";

import React from "react";

interface StatusIndicatorProps {
  status: string;
  size?: "sm" | "md" | "lg";
}

export function StatusIndicator({ status, size = "md" }: StatusIndicatorProps) {
  const s = status.toUpperCase();

  let colorClasses = "bg-slate-800 text-slate-300 border-slate-700";
  let dotColor = "bg-slate-400";
  let pulse = false;

  if (s === "PASSED" || s === "COMPLETED" || s === "READY_TO_SHIP") {
    colorClasses = "bg-emerald-950/70 text-emerald-300 border-emerald-800/80";
    dotColor = "bg-emerald-400";
  } else if (s === "RUNNING" || s === "INVESTIGATING" || s === "PLANNING" || s === "IMPLEMENTING" || s === "VERIFYING") {
    colorClasses = "bg-sky-950/70 text-sky-300 border-sky-800/80";
    dotColor = "bg-sky-400";
    pulse = true;
  } else if (s === "WAITING_FOR_APPROVAL") {
    colorClasses = "bg-amber-950/70 text-amber-300 border-amber-800/80";
    dotColor = "bg-amber-400";
    pulse = true;
  } else if (s === "FAILED" || s === "BLOCKED" || s === "TIMEOUT") {
    colorClasses = "bg-rose-950/70 text-rose-300 border-rose-800/80";
    dotColor = "bg-rose-400";
  }

  const sizeClasses =
    size === "sm"
      ? "text-[11px] px-2 py-0.5 gap-1.5"
      : size === "lg"
      ? "text-sm px-3.5 py-1.5 gap-2.5"
      : "text-xs px-2.5 py-1 gap-2";

  return (
    <span
      className={`inline-flex items-center rounded-full font-mono font-medium border tracking-wide uppercase ${sizeClasses} ${colorClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor} ${pulse ? "animate-ping opacity-85" : ""}`} />
      <span>{status.replace(/_/g, " ")}</span>
    </span>
  );
}
