"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderGit2,
  ListTodo,
  GitPullRequest,
  Sliders,
  ShieldCheck,
  ChevronRight,
  User,
  LogOut,
} from "lucide-react";
import { api, UserProfile } from "@/lib/api";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/repositories", label: "Repositories", icon: FolderGit2 },
  { href: "/tasks", label: "Tasks & Agent Runs", icon: ListTodo },
  { href: "/pull-requests", label: "Pull Requests", icon: GitPullRequest },
  { href: "/settings", label: "Settings & Memory", icon: Sliders },
];

export function Sidebar() {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    api.getCurrentUser()
      .then((u) => setCurrentUser(u))
      .catch(() => setCurrentUser(null));
  }, []);

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch {
      // ignore
    }
    window.location.href = "/auth";
  };

  // If on public marketing landing page, sidebar is hidden
  if (pathname === "/") return null;

  const displayName = currentUser?.name || currentUser?.username || "Developer";
  const displayHandle = currentUser?.username ? `@${currentUser.username}` : "Autonomous Mode";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <aside className="w-64 flex-shrink-0 h-screen bg-[#090d18] border-r border-[#1a253c] flex flex-col justify-between select-none">
      {/* Brand Header */}
      <div>
        <div className="px-5 py-4 border-b border-[#1a253c] flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform">
              PD
            </div>
            <div>
              <span className="font-bold tracking-tight text-white flex items-center gap-1.5 text-sm">
                Pasha DevPilot
                <span className="text-[10px] px-1.5 py-0.2 bg-sky-950 text-sky-400 border border-sky-800 rounded font-mono font-normal">
                  v1.0
                </span>
              </span>
              <p className="text-[11px] text-slate-400">Your AI Software Engineer</p>
            </div>
          </Link>
        </div>

        {/* Workspace Switcher */}
        <div className="px-4 py-3 border-b border-[#1a253c]/50">
          <div className="px-3 py-2 bg-[#0d1424] border border-[#1e2a44] rounded-md flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="truncate font-medium">{currentUser?.workspace_name || "Default Workspace"}</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 px-1 bg-slate-800 rounded">
              PROD
            </span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-3 space-y-1">
          <p className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Platform
          </p>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? "bg-sky-500/10 text-sky-400 border border-sky-500/30 font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-[#121b2d] border border-transparent"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-sky-400" : "text-slate-400"}`} />
                <span>{item.label}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto text-sky-400/80" />}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Status & User */}
      <div className="p-3 border-t border-[#1a253c] space-y-2">
        {/* Core Principles Pill */}
        <div className="p-2.5 rounded bg-[#0b101c] border border-[#1a253c] text-[11px] space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5 text-slate-300 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Human Gate Active
            </span>
            <span className="font-mono text-[10px] text-emerald-400">SAFE</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            Write & PR operations require explicit approval.
          </p>
        </div>

        {/* Dynamic User Bar */}
        <div className="px-3 py-2 bg-[#0c1220] rounded-md border border-[#1a253c] flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            {currentUser?.avatar_url ? (
              <img
                src={currentUser.avatar_url}
                alt={displayName}
                className="w-6 h-6 rounded-full border border-slate-600 object-cover shrink-0"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-200 shrink-0">
                {initial}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-200 leading-none truncate">{displayName}</p>
              <p className="text-[10px] text-slate-400 leading-none mt-1 truncate">{displayHandle}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
              title="Logout / Disconnect account"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
