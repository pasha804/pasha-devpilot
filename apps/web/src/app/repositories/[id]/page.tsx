"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FolderGit2,
  Search,
  RotateCw,
  Plus,
  ShieldCheck,
  Loader2,
  Sparkles,
  Bug,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  Code,
  FileText,
  Activity,
  ChevronDown,
  ChevronRight,
  Shield,
  Layers,
  Terminal,
  Cpu,
  Flame,
  Check,
  ExternalLink,
  Eye,
  Wrench,
  AlertCircle,
} from "lucide-react";
import { Topbar } from "@/components/Topbar";
import { FileTree } from "@/components/FileTree";
import { CodeEditor } from "@/components/CodeEditor";
import { CodeSearchModal } from "@/components/CodeSearchModal";
import { NewTaskModal } from "@/components/NewTaskModal";
import {
  api,
  RepositoryItem,
  FileTreeNode,
  RepositoryIssueItem,
  RepositoryAnalysisReportItem,
} from "@/lib/api";

export default function RepositoryDetailPage() {
  const params = useParams();
  const repoId = params.id as string;
  const router = useRouter();

  const [repo, setRepo] = useState<RepositoryItem | null>(null);
  const [treeNodes, setTreeNodes] = useState<FileTreeNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>("src/auth_service.py");
  const [fileContent, setFileContent] = useState<string>("");
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [isReindexing, setIsReindexing] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);

  // Active View: AI Diagnostics (Default) vs Code Explorer vs Engineering Report
  const [activeView, setActiveView] = useState<"diagnostics" | "explorer" | "report">("diagnostics");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStage, setAnalysisStage] = useState<number>(0);
  const [report, setReport] = useState<RepositoryAnalysisReportItem | null>(null);
  const [issueFilter, setIssueFilter] = useState<"ALL" | "CRITICAL" | "LOGIC" | "SECURITY" | "TESTING">("ALL");
  const [expandedSection, setExpandedSection] = useState<string | null>("Executive Summary");
  const [resolvingIssueId, setResolvingIssueId] = useState<string | null>(null);
  const [isResolvingAll, setIsResolvingAll] = useState(false);
  const [dismissedIssues, setDismissedIssues] = useState<Set<string>>(new Set());

  const loadFile = useCallback(
    async (filePath: string) => {
      setIsLoadingFile(true);
      setSelectedFile(filePath);
      try {
        const fileData = await api.getFileContent(repoId, filePath);
        setFileContent(fileData.content);
      } catch {
        setFileContent(`// Could not load file: ${filePath}`);
      } finally {
        setIsLoadingFile(false);
      }
    },
    [repoId]
  );

  const loadRepositoryDetails = useCallback(async () => {
    try {
      const [repoData, tree] = await Promise.all([
        api.getRepository(repoId),
        api.getRepositoryTree(repoId),
      ]);
      setRepo(repoData);
      setTreeNodes(tree);

      const findFirstFile = (nodes: FileTreeNode[]): string | null => {
        for (const n of nodes) {
          if (!n.is_dir && !n.is_sensitive) return n.path;
          if (n.children) {
            const f = findFirstFile(n.children);
            if (f) return f;
          }
        }
        return null;
      };

      const defaultFile = findFirstFile(tree) || "src/auth_service.py";
      setSelectedFile(defaultFile);
      loadFile(defaultFile);
    } catch (err) {
      console.error("Failed to load repo:", err);
    }
  }, [repoId, loadFile]);

  useEffect(() => {
    loadRepositoryDetails();
  }, [repoId, loadRepositoryDetails]);

  const handleReindex = async () => {
    setIsReindexing(true);
    try {
      await api.reindexRepository(repoId);
      await loadRepositoryDetails();
    } catch (err) {
      console.error("Re-index failed:", err);
    } finally {
      setIsReindexing(false);
    }
  };

  /**
   * Run Real AI Codebase Analysis & Bug Detection
   * Executes multi-stage inspection with simulated real-time progress
   */
  const handleAnalyzeRepository = async () => {
    setIsAnalyzing(true);
    setAnalysisStage(1);

    // Multi-stage visual progress
    const t1 = setTimeout(() => setAnalysisStage(2), 500);
    const t2 = setTimeout(() => setAnalysisStage(3), 1100);
    const t3 = setTimeout(() => setAnalysisStage(4), 1800);

    try {
      const rep = await api.scanRepository(repoId);
      setReport(rep);
      setActiveView("diagnostics");
    } catch (err) {
      console.error("Analysis failed:", err);
    } finally {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      setIsAnalyzing(false);
      setAnalysisStage(0);
    }
  };

  /**
   * Launch Autonomous Agent to formulate plan & fix issue
   */
  const handleCreateFixPlan = async (issue: RepositoryIssueItem) => {
    setResolvingIssueId(issue.id);
    try {
      const res = await api.resolveRepositoryIssue(repoId, issue);
      router.push(`/tasks/${res.task_id}`);
    } catch (err) {
      console.error("Failed to create plan:", err);
      alert("Failed to initialize remediation task.");
    } finally {
      setResolvingIssueId(null);
    }
  };

  /**
   * Batch Resolve All Detected Issues
   */
  const handleResolveAllIssues = async () => {
    if (!report || report.issues.length === 0) return;
    setIsResolvingAll(true);
    try {
      const res = await api.resolveAllIssues(repoId, report.issues);
      if (res.tasks && res.tasks.length > 0) {
        router.push(`/tasks/${res.tasks[0].task_id}`);
      }
    } catch (err) {
      console.error("Failed to resolve all issues:", err);
    } finally {
      setIsResolvingAll(false);
    }
  };

  const handleDismissIssue = (issueId: string) => {
    setDismissedIssues((prev) => new Set([...prev, issueId]));
  };

  const handleInspectInExplorer = (filePath?: string) => {
    if (filePath) {
      loadFile(filePath);
    }
    setActiveView("explorer");
  };

  if (!repo) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-xs text-slate-400 cyber-bg space-y-3">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        <span className="font-mono text-slate-300">Loading isolated sandbox workspace...</span>
      </div>
    );
  }

  const allVisibleIssues = (report?.issues || []).filter((i) => !dismissedIssues.has(i.id));

  const filteredIssues = allVisibleIssues.filter((i) => {
    if (issueFilter === "CRITICAL") return i.severity === "CRITICAL" || i.severity === "HIGH";
    if (issueFilter === "LOGIC") return i.category === "Logic Bug" || i.category === "Authentication";
    if (issueFilter === "SECURITY") return i.category === "Security";
    if (issueFilter === "TESTING") return i.category === "Testing";
    return true;
  });

  return (
    <div className="flex flex-col h-screen overflow-hidden cyber-bg text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      <Topbar
        title={repo.full_name}
        subtitle={`Sandbox Branch: ${repo.default_branch}`}
        onNewTask={() => setIsNewTaskOpen(true)}
      />

      {/* High-Tech Sandbox Context & Navigation Bar */}
      <div className="px-6 py-2.5 glass-panel border-b border-cyan-500/25 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-3">
          <Link
            href="/repositories"
            className="text-slate-400 hover:text-cyan-300 transition-colors flex items-center gap-1 font-semibold"
          >
            <span>Repositories</span>
          </Link>
          <span className="text-slate-600">/</span>
          <span className="flex items-center gap-1.5 text-white font-black tracking-tight">
            <FolderGit2 className="w-4 h-4 text-cyan-400" />
            {repo.name}
          </span>

          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-[10px] text-cyan-300 shadow-[0_0_8px_rgba(0,240,255,0.2)]">
            <Shield className="w-3 h-3 text-cyan-400" />
            <span>SANDBOX JAIL ACTIVE ({repo.local_path || "repos"})</span>
          </span>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center bg-[#070b14] border border-slate-800 rounded-xl p-0.5 shadow-inner">
          <button
            onClick={() => setActiveView("diagnostics")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs transition-all ${
              activeView === "diagnostics"
                ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black shadow-[0_0_12px_rgba(0,240,255,0.35)]"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Bug className="w-3.5 h-3.5" />
            <span>AI Bug Diagnostics</span>
            {allVisibleIssues.length > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeView === "diagnostics" ? "bg-slate-950 text-cyan-400" : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
              }`}>
                {allVisibleIssues.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveView("explorer")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs transition-all ${
              activeView === "explorer"
                ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black shadow-[0_0_12px_rgba(0,240,255,0.35)]"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Code Explorer</span>
          </button>

          <button
            onClick={() => {
              if (!report && !isAnalyzing) {
                handleAnalyzeRepository();
              }
              setActiveView("report");
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs transition-all ${
              activeView === "report"
                ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black shadow-[0_0_12px_rgba(0,240,255,0.35)]"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Architecture Report</span>
          </button>
        </div>

        {/* Global Sandbox Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleAnalyzeRepository}
            disabled={isAnalyzing}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 text-slate-950 font-black rounded-xl text-xs shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all active:scale-95 disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 fill-slate-950 ${isAnalyzing ? "animate-spin" : ""}`} />
            <span>{isAnalyzing ? "Analyzing Codebase..." : "Analyze with AI"}</span>
          </button>

          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 rounded-xl text-slate-300 text-xs transition-colors"
          >
            <Search className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Search Code</span>
          </button>

          <button
            onClick={handleReindex}
            disabled={isReindexing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 rounded-xl text-slate-300 text-xs transition-colors disabled:opacity-50"
            title="Re-Index Sandbox"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isReindexing ? "animate-spin text-cyan-400" : ""}`} />
          </button>

          <button
            onClick={() => setIsNewTaskOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/30 transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Sensitive Files Shield Guarantee Sub-bar */}
      <div className="px-6 py-1.5 bg-[#050811] border-b border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Sensitive files (.env, *.pem, secrets) are shielded from AI prompts. Zero Secret Leakage Guarantee.</span>
        </div>
        <span className="text-cyan-400/80 hidden md:inline">DeepSeek V4 Flash · Pytest Sandbox Runner</span>
      </div>

      {/* TAB 1: AI BUG HUNTER & DIAGNOSTICS VIEW */}
      {activeView === "diagnostics" && (
        <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Scanning In-Progress Banner */}
          {isAnalyzing && (
            <div className="p-8 rounded-2xl glass-panel-elevated border border-cyan-500/40 shadow-2xl text-center space-y-4 relative overflow-hidden">
              <div className="w-16 h-16 rounded-2xl bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center mx-auto text-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.3)]">
                <Cpu className="w-8 h-8 animate-pulse text-cyan-400" />
              </div>

              <div>
                <h3 className="text-base font-black text-white">AI Codebase Analysis & Bug Scanner Active</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  Inspecting AST syntax, executing sandbox unit tests, and detecting logic anomalies...
                </p>
              </div>

              {/* Progress Stage Tracker */}
              <div className="max-w-lg mx-auto grid grid-cols-4 gap-2 pt-2 text-[10px] font-mono text-left">
                <div className={`p-2 rounded-lg border ${analysisStage >= 1 ? "bg-cyan-950/60 border-cyan-500/50 text-cyan-300 font-bold" : "bg-slate-900 border-slate-800 text-slate-500"}`}>
                  1. AST Graph
                </div>
                <div className={`p-2 rounded-lg border ${analysisStage >= 2 ? "bg-cyan-950/60 border-cyan-500/50 text-cyan-300 font-bold" : "bg-slate-900 border-slate-800 text-slate-500"}`}>
                  2. Test Runner
                </div>
                <div className={`p-2 rounded-lg border ${analysisStage >= 3 ? "bg-cyan-950/60 border-cyan-500/50 text-cyan-300 font-bold" : "bg-slate-900 border-slate-800 text-slate-500"}`}>
                  3. Security Scan
                </div>
                <div className={`p-2 rounded-lg border ${analysisStage >= 4 ? "bg-cyan-950/60 border-cyan-500/50 text-cyan-300 font-bold" : "bg-slate-900 border-slate-800 text-slate-500"}`}>
                  4. AI Synthesis
                </div>
              </div>
            </div>
          )}

          {/* Initial Callout Hero (When not scanned yet) */}
          {!report && !isAnalyzing && (
            <div className="p-10 rounded-2xl glass-panel-elevated border border-cyan-500/30 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-[11px] font-mono text-cyan-300 font-bold shadow-[0_0_10px_rgba(0,240,255,0.25)]">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>AI Autonomous Engineering Diagnostics</span>
                </div>
                <h2 className="text-xl font-black text-white tracking-tight">
                  Discover Bugs, Test Regressions & Security Flaws in Seconds
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Pasha DevPilot inspects your repository inside this sandbox environment. It runs real unit tests, parses AST symbol definitions, detects inverted logic comparisons, and generates surgical fix recommendations.
                </p>
                <div className="flex items-center gap-4 text-xs font-mono text-slate-400 pt-1">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <Check className="w-4 h-4 text-emerald-400" /> Read-Only Inspection
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <Check className="w-4 h-4 text-emerald-400" /> Zero Host File Pollution
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <Check className="w-4 h-4 text-emerald-400" /> Human Approval Gate
                  </span>
                </div>
              </div>

              <button
                onClick={handleAnalyzeRepository}
                className="px-8 py-4 bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 text-slate-950 font-black rounded-2xl text-sm shadow-[0_0_30px_rgba(0,240,255,0.45)] transition-all active:scale-95 flex items-center gap-2.5 shrink-0"
              >
                <Bug className="w-5 h-5 fill-slate-950" />
                <span>Run AI Bug & Logic Diagnostic</span>
              </button>
            </div>
          )}

          {/* Results Summary Dashboard */}
          {report && !isAnalyzing && (
            <div className="space-y-6">
              {/* Metric Indicators */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                <div className="bg-[#080d19] border border-cyan-500/25 rounded-2xl p-4 shadow-lg">
                  <p className="text-[10px] font-mono text-slate-400 uppercase font-bold">Total Issues</p>
                  <p className="text-2xl font-black text-white mt-1">{allVisibleIssues.length}</p>
                </div>
                <div className="bg-[#080d19] border border-rose-500/30 rounded-2xl p-4 shadow-lg shadow-rose-950/20">
                  <p className="text-[10px] font-mono text-rose-400 uppercase font-bold">Critical / High</p>
                  <p className="text-2xl font-black text-rose-400 mt-1">{report.high_severity_count || 0}</p>
                </div>
                <div className="bg-[#080d19] border border-purple-500/30 rounded-2xl p-4 shadow-lg shadow-purple-950/20">
                  <p className="text-[10px] font-mono text-purple-400 uppercase font-bold">Security Risks</p>
                  <p className="text-2xl font-black text-purple-300 mt-1">{report.security_findings_count || 0}</p>
                </div>
                <div className="bg-[#080d19] border border-amber-500/30 rounded-2xl p-4 shadow-lg">
                  <p className="text-[10px] font-mono text-amber-400 uppercase font-bold">Sandbox Tests</p>
                  <p className="text-xs font-bold text-amber-300 mt-2 truncate" title={report.test_status}>
                    {report.test_status || "Not measured"}
                  </p>
                </div>
                <div className="bg-[#080d19] border border-emerald-500/30 rounded-2xl p-4 shadow-lg">
                  <p className="text-[10px] font-mono text-emerald-400 uppercase font-bold">Architecture</p>
                  <p className="text-sm font-black text-emerald-400 mt-1">{report.architecture_health || "Modular"}</p>
                </div>
                <div className="bg-[#080d19] border border-slate-800 rounded-2xl p-4 shadow-lg">
                  <p className="text-[10px] font-mono text-slate-400 uppercase font-bold">Technical Debt</p>
                  <p className="text-sm font-black text-slate-300 mt-1">{report.technical_debt || "Low"}</p>
                </div>
              </div>

              {/* Action and Filter Controls Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl glass-panel border border-slate-800">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-bold text-slate-400 mr-1">Filter:</span>
                  {(
                    [
                      { id: "ALL", label: `All (${allVisibleIssues.length})` },
                      { id: "CRITICAL", label: "Critical & High" },
                      { id: "LOGIC", label: "Logic Bugs" },
                      { id: "SECURITY", label: "Security" },
                      { id: "TESTING", label: "Test Regressions" },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setIssueFilter(tab.id)}
                      className={`px-3 py-1 rounded-xl text-xs font-mono transition-colors ${
                        issueFilter === tab.id
                          ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold"
                          : "bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-transparent"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleResolveAllIssues}
                    disabled={isResolvingAll || allVisibleIssues.length === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-purple-600/30 transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>{isResolvingAll ? "Scheduling Fixes..." : "Auto-Remediate All Issues"}</span>
                  </button>
                </div>
              </div>

              {/* Bug Finding Cards */}
              <div className="space-y-4">
                {filteredIssues.length === 0 ? (
                  <div className="p-12 text-center space-y-3 glass-panel-elevated border border-slate-800 rounded-2xl">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto shadow-[0_0_15px_#10b981]" />
                    <p className="text-sm font-bold text-slate-100">No issues matching this filter</p>
                    <p className="text-xs text-slate-400">All scanned criteria in this category are satisfied.</p>
                  </div>
                ) : (
                  filteredIssues.map((issue) => (
                    <div
                      key={issue.id}
                      className="glass-panel-elevated border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-6 shadow-xl transition-all space-y-4 relative overflow-hidden"
                    >
                      {/* Top Issue Bar */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            {/* ID */}
                            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-lg bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 font-bold shadow-[0_0_6px_rgba(0,240,255,0.2)]">
                              {issue.id}
                            </span>

                            {/* Severity */}
                            <span
                              className={`text-[10px] font-mono px-2.5 py-0.5 rounded-lg border font-bold ${
                                issue.severity === "CRITICAL" || issue.severity === "HIGH"
                                  ? "bg-rose-950/60 text-rose-400 border-rose-500/50 shadow-[0_0_8px_rgba(244,63,94,0.3)]"
                                  : "bg-amber-950/60 text-amber-300 border-amber-500/40"
                              }`}
                            >
                              {issue.severity}
                            </span>

                            {/* Category */}
                            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                              {issue.category}
                            </span>

                            {/* Location */}
                            <button
                              onClick={() => handleInspectInExplorer(issue.file || issue.file_path)}
                              className="text-xs text-cyan-400 hover:underline font-mono flex items-center gap-1 bg-[#080d19] px-2.5 py-0.5 rounded-lg border border-slate-800 hover:border-cyan-500/40 transition-colors"
                              title="Inspect in Code Explorer"
                            >
                              <Code className="w-3 h-3" />
                              <span>
                                {issue.file || issue.file_path}
                                {issue.line || issue.line_number ? `:${issue.line || issue.line_number}` : ""}
                              </span>
                            </button>
                          </div>

                          <h4 className="text-base font-extrabold text-white tracking-tight">{issue.title}</h4>
                          <p className="text-xs text-slate-400 leading-relaxed">{issue.description}</p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleDismissIssue(issue.id)}
                            className="px-3.5 py-2 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-mono transition-colors"
                          >
                            Dismiss
                          </button>

                          <button
                            onClick={() => handleInspectInExplorer(issue.file || issue.file_path)}
                            className="p-2 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 text-xs transition-colors"
                            title="Inspect in Code Explorer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleCreateFixPlan(issue)}
                            disabled={resolvingIssueId === issue.id}
                            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 text-slate-950 font-black rounded-xl text-xs shadow-[0_0_15px_rgba(0,240,255,0.35)] transition-all active:scale-95 disabled:opacity-50"
                          >
                            <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                            <span>{resolvingIssueId === issue.id ? "Formulating Plan..." : "Formulate Fix Plan"}</span>
                            <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                          </button>
                        </div>
                      </div>

                      {/* Why it Matters Callout */}
                      {issue.why_it_matters && (
                        <div className="text-xs font-mono text-slate-300 bg-[#060a14] border border-amber-500/20 p-3 rounded-xl">
                          <span className="text-amber-400 font-bold">Why it matters: </span>
                          <span>{issue.why_it_matters}</span>
                        </div>
                      )}

                      {/* Evidence Code Snippet Box */}
                      {(issue.evidence || issue.code_snippet) && (
                        <div className="bg-[#050811] border border-slate-800 rounded-xl p-3.5 font-mono text-xs overflow-x-auto space-y-1">
                          <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">
                            Evidence / Offending AST Node:
                          </span>
                          <pre className="text-cyan-300 bg-black/60 p-2.5 rounded-lg border border-slate-800/80 leading-relaxed">
                            {issue.evidence || issue.code_snippet}
                          </pre>
                        </div>
                      )}

                      {/* Suggested Fix */}
                      {(issue.suggested_improvement || issue.suggested_fix) && (
                        <div className="text-xs text-emerald-400 font-mono bg-emerald-950/30 border border-emerald-500/30 p-3 rounded-xl flex items-center gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>
                            <strong>AI Suggested Fix: </strong>
                            {issue.suggested_improvement || issue.suggested_fix}
                          </span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CODE EXPLORER VIEW */}
      {activeView === "explorer" && (
        <div className="flex-1 flex overflow-hidden">
          {/* File Tree Sidebar */}
          <div className="w-72 bg-[#060a14] border-r border-slate-800 flex flex-col">
            <div className="p-3.5 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="font-extrabold uppercase text-slate-200">Sandbox Files</span>
              <span className="text-[10px] text-cyan-400">{treeNodes.length} items</span>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              <FileTree
                nodes={treeNodes}
                selectedFilePath={selectedFile}
                onSelectFile={(path: string) => {
                  loadFile(path);
                }}
              />
            </div>
          </div>

          {/* Monaco Code Viewer */}
          <div className="flex-1 flex flex-col bg-[#070b14] overflow-hidden">
            <div className="px-5 py-2.5 bg-[#090e1c] border-b border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className="text-cyan-300 font-bold">{selectedFile}</span>
              <span className="text-slate-500">Isolated Sandbox Code Viewer</span>
            </div>
            <div className="flex-1 overflow-hidden">
              <CodeEditor
                value={fileContent}
                language={
                  selectedFile.endsWith(".py")
                    ? "python"
                    : selectedFile.endsWith(".ts") || selectedFile.endsWith(".tsx")
                    ? "typescript"
                    : "javascript"
                }
                readOnly={true}
                height="100%"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: 20-SECTION ARCHITECTURE REPORT VIEW */}
      {activeView === "report" && (
        <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-7xl mx-auto w-full">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                20-Section Architecture Assessment
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Evidence-based architectural findings, dependencies, static analysis, and health indicators.
              </p>
            </div>
            <button
              onClick={handleAnalyzeRepository}
              disabled={isAnalyzing}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isAnalyzing ? "animate-spin text-cyan-400" : ""}`} />
              <span>Re-Generate Assessment</span>
            </button>
          </div>

          {report?.sections && Object.keys(report.sections).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(report.sections).map(([title, content]) => {
                const isOpen = expandedSection === title;
                return (
                  <div
                    key={title}
                    className="border border-slate-800 bg-[#080d19] rounded-2xl p-4 transition-colors"
                  >
                    <button
                      onClick={() => setExpandedSection(isOpen ? null : title)}
                      className="w-full flex items-center justify-between text-left font-mono text-xs font-bold text-slate-200 hover:text-cyan-300"
                    >
                      <span>{title}</span>
                      {isOpen ? (
                        <ChevronDown className="w-4 h-4 text-cyan-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-500" />
                      )}
                    </button>
                    {isOpen && (
                      <p className="text-xs text-slate-400 mt-3 font-mono leading-relaxed border-t border-slate-800/80 pt-3">
                        {content}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center space-y-3 glass-panel-elevated border border-slate-800 rounded-2xl">
              <FileText className="w-10 h-10 text-slate-500 mx-auto" />
              <p className="text-xs text-slate-300 font-bold">Architecture report not yet generated</p>
              <button
                onClick={handleAnalyzeRepository}
                className="px-5 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black rounded-xl text-xs"
              >
                Generate 20-Section Architecture Report
              </button>
            </div>
          )}
        </div>
      )}

      {/* Code Search Modal */}
      {isSearchOpen && (
        <CodeSearchModal
          repoId={repoId}
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          onSelectMatch={(filePath: string) => {
            setIsSearchOpen(false);
            loadFile(filePath);
            setActiveView("explorer");
          }}
        />
      )}

      {/* New Task Modal */}
      {isNewTaskOpen && (
        <NewTaskModal
          repositories={repo ? [repo] : []}
          isOpen={isNewTaskOpen}
          onClose={() => setIsNewTaskOpen(false)}
          onTaskCreated={(createdTaskId: string) => {
            setIsNewTaskOpen(false);
            router.push(`/tasks/${createdTaskId}`);
          }}
        />
      )}
    </div>
  );
}
