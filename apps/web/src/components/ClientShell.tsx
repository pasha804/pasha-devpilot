"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { CommandPalette } from "./CommandPalette";
import { NewTaskModal } from "./NewTaskModal";
import { api, RepositoryItem } from "@/lib/api";
import { ErrorBoundary } from "./ErrorBoundary";
import { ToastProvider } from "./Toast";

export function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLandingPage = pathname === "/";

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [repositories, setRepositories] = useState<RepositoryItem[]>([]);

  useEffect(() => {
    // Preload repositories for quick task modal
    if (!isLandingPage) {
      api.getRepositories()
        .then((repos) => setRepositories(repos))
        .catch(() => {});
    }
  }, [isLandingPage]);

  // Global Ctrl+K keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <ErrorBoundary>
      <ToastProvider>
        {isLandingPage ? (
          <main className="min-h-screen bg-[#070b14]">{children}</main>
        ) : (
          <div className="flex h-screen w-screen overflow-hidden bg-[#070b14] text-slate-100">
            <Sidebar />
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              <main className="flex-1 overflow-y-auto bg-[#070b14]">
                {children}
              </main>
            </div>

            <CommandPalette
              isOpen={isCommandPaletteOpen}
              onClose={() => setIsCommandPaletteOpen(false)}
              onOpenNewTaskModal={() => setIsNewTaskModalOpen(true)}
            />

            <NewTaskModal
              isOpen={isNewTaskModalOpen}
              onClose={() => setIsNewTaskModalOpen(false)}
              repositories={repositories}
              onTaskCreated={(taskId) => {
                router.push(`/tasks/${taskId}`);
              }}
            />
          </div>
        )}
      </ToastProvider>
    </ErrorBoundary>
  );
}
