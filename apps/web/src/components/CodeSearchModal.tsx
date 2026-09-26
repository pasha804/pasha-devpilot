"use client";

import React, { useState } from "react";
import { Search, X, Code, FileText, Sparkles, Loader2 } from "lucide-react";
import { api, SearchMatch } from "@/lib/api";

interface CodeSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  repoId: string;
  onSelectMatch: (filePath: string, line: number) => void;
}

export function CodeSearchModal({
  isOpen,
  onClose,
  repoId,
  onSelectMatch,
}: CodeSearchModalProps) {
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState<"exact" | "symbol" | "semantic">("exact");
  const [results, setResults] = useState<SearchMatch[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  if (!isOpen) return null;

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const data = await api.searchCode(repoId, query.trim(), searchType);
      setResults(data.results || []);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-start justify-center pt-20 px-4">
      <div className="w-full max-w-2xl bg-[#0b1220] border border-[#1b2a47] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header & Modes */}
        <div className="p-4 border-b border-[#1b2a47] space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Search className="w-4 h-4 text-sky-400" />
              Repository Code Intelligence Search
            </h3>
            <button onClick={onClose} className="p-1 hover:bg-[#152035] rounded text-slate-400">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="flex-1 relative">
              <input
                autoFocus
                type="text"
                placeholder={
                  searchType === "semantic"
                    ? "Ask in natural language: e.g. Where is auth token verification handled?"
                    : searchType === "symbol"
                    ? "Enter class or function symbol name: e.g. AuthService"
                    : "Enter exact string or regex pattern..."
                }
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-3 pr-8 py-2 bg-[#060a14] border border-[#1e2f4f] rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-400 font-mono"
              />
              {isSearching && (
                <Loader2 className="w-3.5 h-3.5 text-sky-400 animate-spin absolute right-3 top-2.5" />
              )}
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-medium transition-colors"
            >
              Search
            </button>
          </form>

          {/* Strategy Tabs */}
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[11px] text-slate-400 mr-1">Mode:</span>
            {[
              { id: "exact" as const, label: "Exact Text", icon: Code },
              { id: "symbol" as const, label: "Symbol AST", icon: FileText },
              { id: "semantic" as const, label: "Semantic Intent", icon: Sparkles },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = searchType === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSearchType(tab.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-colors ${
                    isActive
                      ? "bg-sky-500/20 text-sky-300 border border-sky-500/40 font-semibold"
                      : "bg-[#10192e] text-slate-400 hover:text-slate-200 border border-[#192742]"
                  }`}
                >
                  <Icon className="w-3 h-3 text-sky-400" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {results.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              {query ? "No matching files or symbols found." : "Enter a query above to search codebase."}
            </div>
          ) : (
            results.map((res, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onSelectMatch(res.file_path, res.line_number);
                  onClose();
                }}
                className="w-full text-left p-3 rounded-lg bg-[#0e1628] hover:bg-[#142038] border border-[#1b2a47] transition-all group"
              >
                <div className="flex items-center justify-between text-xs font-mono mb-1">
                  <span className="text-sky-300 font-semibold group-hover:underline">
                    {res.file_path}:{res.line_number}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Match Score: {(res.match_score * 100).toFixed(0)}%
                  </span>
                </div>
                <p className="font-mono text-xs text-slate-300 bg-[#070b14] p-2 rounded border border-[#17243c] truncate">
                  {res.line_content}
                </p>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
