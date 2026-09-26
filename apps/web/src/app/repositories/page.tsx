"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FolderGit2,
  Search,
  RotateCw,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Globe,
  Sparkles,
  ExternalLink,
  Zap,
  User,
  Shield,
  X,
  AlertCircle,
  Check,
  Cpu,
  Terminal,
  Code2,
  Key,
  Layers,
  HelpCircle,
  LogOut,
  Copy,
} from "lucide-react";
import { Topbar } from "@/components/Topbar";
import { api, RepositoryItem, UserProfile, GitHubRepoItem } from "@/lib/api";

function RepositoriesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [repositories, setRepositories] = useState<RepositoryItem[]>([]);
  const [githubAvailable, setGithubAvailable] = useState<GitHubRepoItem[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [searchFilter, setSearchFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "public" | "private" | "sandbox">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [connectingRepo, setConnectingRepo] = useState<GitHubRepoItem | null>(null);
  const [cloningStep, setCloningStep] = useState<string>("");
  const [authError, setAuthError] = useState<string | null>(null);

  // GitHub Authorization Modal states
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"oauth" | "pat">("oauth");
  const [oauthConfigured, setOauthConfigured] = useState(false);
  const [oauthUrl, setOauthUrl] = useState<string | null>(null);
  const [registerAppUrl, setRegisterAppUrl] = useState<string>("");
  const [generatePatUrl, setGeneratePatUrl] = useState<string>("");
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [personalToken, setPersonalToken] = useState("");
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [authModalError, setAuthModalError] = useState<string | null>(null);
  const [authSuccessMsg, setAuthSuccessMsg] = useState<string | null>(null);
  const [copiedCallback, setCopiedCallback] = useState(false);

  const loadData = useCallback(async (customUser?: string) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const [user, authInfo] = await Promise.all([
        api.getCurrentUser().catch(() => null),
        api.getGitHubAuthUrl().catch(() => null),
      ]);

      setCurrentUser(user);

      if (authInfo) {
        setOauthConfigured(!!authInfo.is_configured);
        setOauthUrl(authInfo.url || null);
        if (authInfo.register_app_url) setRegisterAppUrl(authInfo.register_app_url);
        if (authInfo.generate_pat_url) setGeneratePatUrl(authInfo.generate_pat_url);
      }

      const usernameToQuery = customUser || user?.username || undefined;

      const [repos, ghRepos] = await Promise.all([
        api.getRepositories().catch(() => []),
        api.getGitHubAvailable(usernameToQuery).catch(() => []),
      ]);

      setRepositories(repos);
      setGithubAvailable(ghRepos);
    } catch (err) {
      console.error("Failed to load repositories:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (searchParams && searchParams.get("connect") === "true") {
      setShowAuthModal(true);
    }
  }, [searchParams]);

  /**
   * Main "Connect GitHub" Click Handler
   * If real GitHub OAuth Client ID is registered, redirect to GitHub.
   * If not configured yet, open the official OAuth setup modal.
   */
  const handleConnectGitHubClick = async () => {
    setAuthError(null);
    setAuthModalError(null);
    try {
      const authInfo = await api.getGitHubAuthUrl();
      setOauthConfigured(!!authInfo.is_configured);
      setOauthUrl(authInfo.url || null);
      if (authInfo.register_app_url) setRegisterAppUrl(authInfo.register_app_url);
      if (authInfo.generate_pat_url) setGeneratePatUrl(authInfo.generate_pat_url);

      if (authInfo.is_configured && authInfo.url) {
        // Live production OAuth flow: redirect to GitHub
        window.location.href = authInfo.url;
      } else {
        setShowAuthModal(true);
      }
    } catch {
      setShowAuthModal(true);
    }
  };

  /**
   * Save & Configure GitHub OAuth credentials, then redirect straight to GitHub
   */
  const handleConfigureOAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId.trim() || !clientSecret.trim()) {
      setAuthModalError("Please provide both Client ID and Client Secret.");
      return;
    }
    setIsAuthorizing(true);
    setAuthModalError(null);
    try {
      const res = await api.configureGitHubOAuth({
        client_id: clientId.trim(),
        client_secret: clientSecret.trim(),
      });
      setAuthSuccessMsg("GitHub OAuth credentials saved! Redirecting to GitHub...");
      setTimeout(() => {
        window.location.href = res.url;
      }, 700);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to configure GitHub OAuth.";
      setAuthModalError(msg);
      setIsAuthorizing(false);
    }
  };

  /**
   * Perform direct 1-Click GitHub PAT Authorization
   */
  const handlePersonalTokenAuthorize = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanToken = personalToken.trim();
    if (!cleanToken) {
      setAuthModalError("Please paste a valid GitHub Personal Access Token.");
      return;
    }
    setIsAuthorizing(true);
    setAuthModalError(null);

    try {
      const res = await api.connectGitHubToken(cleanToken);
      setAuthSuccessMsg(`Successfully authenticated with GitHub as @${res.username}!`);
      setTimeout(async () => {
        setShowAuthModal(false);
        setAuthSuccessMsg(null);
        setPersonalToken("");
        await loadData();
      }, 700);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "GitHub token authentication failed. Please verify token permissions.";
      setAuthModalError(msg);
    } finally {
      setIsAuthorizing(false);
    }
  };

  /**
   * Disconnect current GitHub account
   */
  const handleDisconnect = async () => {
    await api.logout();
    setCurrentUser(null);
    await loadData();
  };

  /**
   * Select a repository and pull/clone it into the isolated sandbox
   */
  const handleSelectRepository = async (ghRepo: GitHubRepoItem) => {
    setConnectingRepo(ghRepo);
    setCloningStep("1/3 Initializing isolated sandbox jail...");

    try {
      await new Promise((r) => setTimeout(r, 400));
      setCloningStep("2/3 Pulling repository files into sandbox...");

      const ownerStr = typeof ghRepo.owner === "object" && ghRepo.owner !== null
        ? ghRepo.owner.login
        : String(ghRepo.owner || "user");

      const connected = await api.connectRepository({
        name: ghRepo.name,
        owner: ownerStr,
        local_path: ghRepo.local_path || (ghRepo.name === "devpilot-demo-service" ? "demo-repo" : `repos/${ownerStr}_${ghRepo.name}`),
        clone_url: ghRepo.clone_url || undefined,
        is_private: ghRepo.private || false,
      });

      setCloningStep("3/3 Indexing AST symbol graph & test harnesses...");
      await new Promise((r) => setTimeout(r, 400));

      await loadData();
      router.push(`/repositories/${connected.id}`);
    } catch (err) {
      console.error("Failed to select repository:", err);
      const msg = err instanceof Error ? err.message : "Failed to clone repository into sandbox.";
      alert(msg);
      setConnectingRepo(null);
    }
  };

  const isRepoLinked = (ghRepoFullName: string) => {
    return repositories.some(
      (r) => r.full_name.toLowerCase() === ghRepoFullName.toLowerCase()
    );
  };

  const getLinkedRepoId = (ghRepoFullName: string) => {
    const found = repositories.find(
      (r) => r.full_name.toLowerCase() === ghRepoFullName.toLowerCase()
    );
    return found ? found.id : null;
  };

  const copyCallbackUrl = () => {
    navigator.clipboard.writeText("http://localhost:3000/auth/callback");
    setCopiedCallback(true);
    setTimeout(() => setCopiedCallback(false), 2000);
  };

  const filteredGitHub = githubAvailable.filter((r) => {
    const query = searchFilter.toLowerCase();
    const fullName = (r.full_name || "").toLowerCase();
    const lang = (r.language || "").toLowerCase();
    const desc = (r.description || "").toLowerCase();
    const matchesSearch = fullName.includes(query) || lang.includes(query) || desc.includes(query);

    if (!matchesSearch) return false;
    if (activeFilter === "public") return !r.private;
    if (activeFilter === "private") return !!r.private;
    if (activeFilter === "sandbox") return isRepoLinked(r.full_name);
    return true;
  });

  return (
    <div className="flex flex-col min-h-screen cyber-bg text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      <Topbar
        title="GitHub Repository Hub"
        subtitle="Connect GitHub, pull repositories into isolated sandbox, and analyze with AI"
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto w-full relative">
        {/* GitHub Integration Status Banner */}
        <div className="p-6 rounded-2xl glass-panel-elevated border border-cyan-500/30 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-cyan-500/10 via-transparent to-transparent pointer-events-none" />

          <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-400 flex-shrink-0 shadow-[0_0_20px_rgba(0,240,255,0.25)]">
              <FolderGit2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-base font-extrabold text-white tracking-tight">GitHub Workspace Authorization</h2>
                {currentUser?.username ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[10px] text-emerald-300 font-mono font-bold shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>AUTHORIZED (@{currentUser.username})</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-[10px] text-cyan-300 font-mono font-bold shadow-[0_0_8px_rgba(0,240,255,0.2)]">
                    <Zap className="w-3.5 h-3.5 text-cyan-400" />
                    <span>REAL GITHUB OAUTH 2.0</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1.5 max-w-2xl leading-relaxed">
                {currentUser?.username
                  ? `Authorized as @${currentUser.username}. Both your public and private repositories are listed below. Click "Pull into Sandbox" on any repo to begin AI analysis.`
                  : "Connect with GitHub to authenticate and discover all your public and private repositories."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto relative z-10">
            {currentUser?.username ? (
              <>
                <button
                  onClick={handleConnectGitHubClick}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-mono transition-all"
                >
                  <FolderGit2 className="w-3.5 h-3.5" />
                  <span>Switch Account</span>
                </button>
                <button
                  onClick={handleDisconnect}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/80 text-rose-300 rounded-xl text-xs font-mono transition-all"
                  title="Disconnect GitHub session"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Disconnect</span>
                </button>
              </>
            ) : (
              <button
                onClick={handleConnectGitHubClick}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black rounded-xl text-xs shadow-[0_0_25px_rgba(0,240,255,0.4)] transition-all active:scale-95"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>Connect GitHub</span>
              </button>
            )}
          </div>
        </div>

        {authError && (
          <div className="p-3.5 bg-rose-950/40 border border-rose-800/60 rounded-xl text-xs text-rose-300 font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        {/* Security Shield Guarantee Banner */}
        <div className="px-5 py-3 glass-panel border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2.5 text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 shadow-[0_0_8px_#10b981]" />
            <span>Sandbox Isolation: Sensitive keys (.env, *.pem, secrets) are shielded from AI context.</span>
          </div>
          <span className="text-[11px] text-cyan-400/80">Local Sandbox Jail Guard Active</span>
        </div>

        {/* Search, Filter, and Repository Discovery Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search repositories by name, language, or stack..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-[#080d19] border border-slate-800 focus:border-cyan-400 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Quick Filter Badges */}
            <div className="hidden lg:flex items-center gap-1.5 bg-[#080d19] p-1 rounded-xl border border-slate-800 text-[11px] font-mono">
              {(["all", "public", "private", "sandbox"] as const).map((filterKey) => (
                <button
                  key={filterKey}
                  onClick={() => setActiveFilter(filterKey)}
                  className={`px-3 py-1 rounded-lg capitalize transition-colors ${
                    activeFilter === filterKey
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {filterKey}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 justify-between sm:justify-end">
            <span className="text-xs font-mono text-slate-400">
              Repositories: <strong className="text-cyan-400">{filteredGitHub.length}</strong> | In Sandbox:{" "}
              <strong className="text-emerald-400">{repositories.length}</strong>
            </span>
            <button
              onClick={() => loadData()}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-cyan-300 transition-colors"
              title="Refresh Repository List"
            >
              <RotateCw className={`w-4 h-4 ${isLoading ? "animate-spin text-cyan-400" : ""}`} />
            </button>
          </div>
        </div>

        {/* Repositories Cards Grid */}
        {filteredGitHub.length === 0 ? (
          <div className="p-12 rounded-2xl glass-panel-elevated border border-slate-800 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center mx-auto text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
              <FolderGit2 className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">No Repositories Connected</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                Authorize your GitHub account to load all your public and private repositories automatically.
              </p>
            </div>
            <button
              onClick={handleConnectGitHubClick}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 text-slate-950 font-black rounded-xl text-xs shadow-[0_0_20px_rgba(0,240,255,0.35)] transition-all active:scale-95"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>Connect GitHub</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredGitHub.map((repo) => {
              const linked = isRepoLinked(repo.full_name);
              const linkedId = getLinkedRepoId(repo.full_name);
              const isCloningThis = connectingRepo?.full_name === repo.full_name;

              return (
                <div
                  key={repo.id || repo.full_name}
                  className={`rounded-2xl glass-panel-elevated border p-5 flex flex-col justify-between transition-all group relative overflow-hidden ${
                    linked
                      ? "border-emerald-500/40 hover:border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                      : "border-slate-800/90 hover:border-cyan-500/50 hover:shadow-[0_0_25px_rgba(0,240,255,0.15)]"
                  }`}
                >
                  <div>
                    {/* Header info */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${
                            repo.private
                              ? "bg-amber-950/60 text-amber-300 border-amber-800/80 font-bold"
                              : "bg-slate-800 text-slate-300 border-slate-700"
                          }`}
                        >
                          {repo.private ? (
                            <span className="flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" /> PRIVATE
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <Globe className="w-2.5 h-2.5" /> PUBLIC
                            </span>
                          )}
                        </span>

                        {linked && (
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 flex items-center gap-1 shadow-[0_0_6px_rgba(16,185,129,0.3)]">
                            <CheckCircle2 className="w-2.5 h-2.5" /> IN SANDBOX
                          </span>
                        )}

                        {repo.name === "devpilot-demo-service" && (
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-500/40 flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5 text-purple-400" /> DEMO REPO
                          </span>
                        )}
                      </div>

                      <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-full bg-[#080d19] text-cyan-300 border border-slate-800">
                        {repo.language || "Code"}
                      </span>
                    </div>

                    {/* Repo Name */}
                    <h3 className="text-sm font-extrabold text-white group-hover:text-cyan-300 transition-colors flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span className="truncate">{repo.full_name}</span>
                    </h3>

                    <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                      {repo.description || "GitHub repository ready for sandbox indexing and AI bug detection."}
                    </p>

                    <div className="flex items-center gap-3 mt-4 text-[11px] text-slate-500 font-mono">
                      <span>
                        Branch: <strong className="text-slate-300">{repo.default_branch || "main"}</strong>
                      </span>
                      {repo.stargazers_count !== undefined && (
                        <span>★ {repo.stargazers_count}</span>
                      )}
                    </div>
                  </div>

                  {/* Card Action Footer */}
                  <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex items-center justify-between">
                    {repo.html_url && (
                      <a
                        href={repo.html_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-500 hover:text-slate-300 text-[11px] flex items-center gap-1 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>GitHub</span>
                      </a>
                    )}

                    {linked ? (
                      <Link
                        href={`/repositories/${linkedId}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-950/90 hover:bg-emerald-900 border border-emerald-500/50 text-xs font-bold text-emerald-300 transition-colors shadow-[0_0_12px_rgba(16,185,129,0.25)]"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Open Sandbox & Analyze</span>
                        <ArrowRight className="w-3 h-3 ml-0.5" />
                      </Link>
                    ) : (
                      <button
                        onClick={() => handleSelectRepository(repo)}
                        disabled={!!connectingRepo}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 text-slate-950 text-xs font-black shadow-[0_0_15px_rgba(0,240,255,0.35)] transition-all active:scale-95 disabled:opacity-50"
                      >
                        <FolderGit2 className="w-3.5 h-3.5" />
                        <span>{isCloningThis ? "Cloning..." : "Pull into Sandbox"}</span>
                        <ArrowRight className="w-3 h-3 ml-0.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CLONING & SANDBOX INITIALIZATION OVERLAY */}
      {connectingRepo && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-panel-elevated border border-cyan-500/40 rounded-2xl p-7 text-center space-y-5 shadow-2xl relative">
            <div className="w-16 h-16 rounded-2xl bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center mx-auto text-cyan-400 shadow-[0_0_25px_rgba(0,240,255,0.35)]">
              <Cpu className="w-8 h-8 animate-pulse" />
            </div>

            <div>
              <h3 className="text-base font-black text-white">Pulling into Sandbox Workspace</h3>
              <p className="text-xs text-cyan-300 font-mono mt-1">{connectingRepo.full_name}</p>
            </div>

            <div className="p-3.5 bg-[#080d19] border border-slate-800 rounded-xl text-left space-y-2 text-xs font-mono text-slate-400">
              <p className="text-cyan-400 font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                {cloningStep}
              </p>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full w-3/4 animate-pulse rounded-full" />
              </div>
              <p className="text-[10px] text-slate-500 pt-1">
                Jailing filesystem · Applying sensitive file shield · Building AST index
              </p>
            </div>
          </div>
        </div>
      )}

      {/* REAL GITHUB AUTHORIZATION MODAL */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg glass-panel-elevated border border-cyan-500/40 rounded-2xl p-6 space-y-5 shadow-2xl relative">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-slate-950 font-black shadow-[0_0_12px_rgba(0,240,255,0.3)]">
                  PD
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white">Authorize Pasha DevPilot with GitHub</h3>
                  <p className="text-[11px] text-slate-400">Real GitHub Authorization · Public & Private Repositories</p>
                </div>
              </div>
              <button
                onClick={() => setShowAuthModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mode Tabs */}
            <div className="flex border-b border-slate-800 gap-2">
              <button
                onClick={() => setAuthMode("oauth")}
                className={`px-3 py-2 text-xs font-mono border-b-2 -mb-[1px] transition-colors ${
                  authMode === "oauth"
                    ? "border-cyan-400 text-cyan-300 font-bold"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                Official GitHub OAuth 2.0
              </button>
              <button
                onClick={() => setAuthMode("pat")}
                className={`px-3 py-2 text-xs font-mono border-b-2 -mb-[1px] transition-colors ${
                  authMode === "pat"
                    ? "border-cyan-400 text-cyan-300 font-bold"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                GitHub Token (PAT) — 1-Click
              </button>
            </div>

            {authModalError && (
              <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-xs text-rose-300 font-mono flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{authModalError}</span>
              </div>
            )}

            {authSuccessMsg && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-xs text-emerald-300 font-mono flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{authSuccessMsg}</span>
              </div>
            )}

            {/* TAB 1: OFFICIAL GITHUB OAUTH 2.0 */}
            {authMode === "oauth" && (
              <div className="space-y-4">
                {oauthConfigured && oauthUrl ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-[#080d19] border border-emerald-500/30 rounded-xl space-y-2">
                      <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold font-mono">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>GitHub OAuth App is Configured</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Clicking the button below will redirect you directly to <strong>github.com</strong>.
                        GitHub will present its official consent screen asking to authorize Pasha DevPilot.
                      </p>
                    </div>

                    <a
                      href={oauthUrl}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#238636] hover:bg-[#2ea043] text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-900/30 transition-all active:scale-95"
                    >
                      <FolderGit2 className="w-4 h-4" />
                      <span>Authorize on GitHub (Redirect to github.com) ↗</span>
                    </a>
                  </div>
                ) : (
                  <form onSubmit={handleConfigureOAuth} className="space-y-4">
                    <div className="p-3.5 bg-[#080d19] border border-cyan-500/30 rounded-xl text-xs space-y-2.5">
                      <p className="text-slate-200 font-bold flex items-center gap-2">
                        <Shield className="w-4 h-4 text-cyan-400" />
                        <span>Step 1: Register OAuth App on GitHub (Takes 30 seconds)</span>
                      </p>
                      <p className="text-slate-400 text-[11px] leading-relaxed">
                        GitHub requires an OAuth App to show GitHub&apos;s official authorization consent screen.
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <a
                          href={registerAppUrl || "https://github.com/settings/applications/new?oauth_application[name]=Pasha+DevPilot&oauth_application[url]=http://localhost:3000&oauth_application[callback_url]=http://localhost:3000/auth/callback"}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 rounded-lg text-xs font-mono font-bold transition-all"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>1-Click: Open GitHub App Registration Page ↗</span>
                        </a>
                      </div>
                      <div className="p-2 bg-black border border-slate-800 rounded-lg text-[10px] font-mono text-slate-400 flex items-center justify-between">
                        <span>Callback URL: <strong className="text-cyan-300">http://localhost:3000/auth/callback</strong></span>
                        <button
                          type="button"
                          onClick={copyCallbackUrl}
                          className="text-slate-400 hover:text-white p-1"
                          title="Copy callback URL"
                        >
                          {copiedCallback ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-mono text-slate-300 mb-1 font-bold">
                          Step 2: Paste Client ID
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Ov23li... or Client ID from GitHub"
                          value={clientId}
                          onChange={(e) => setClientId(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-[#080d19] border border-slate-700 focus:border-cyan-400 rounded-xl text-xs text-white placeholder-slate-500 font-mono focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono text-slate-300 mb-1 font-bold">
                          Client Secret
                        </label>
                        <input
                          type="password"
                          placeholder="Paste Client Secret generated on GitHub"
                          value={clientSecret}
                          onChange={(e) => setClientSecret(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-[#080d19] border border-slate-700 focus:border-cyan-400 rounded-xl text-xs text-white placeholder-slate-500 font-mono focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAuthModal(false)}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isAuthorizing}
                        className="px-6 py-2.5 bg-[#238636] hover:bg-[#2ea043] text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-900/30 flex items-center gap-2 transition-all disabled:opacity-50"
                      >
                        <FolderGit2 className="w-4 h-4" />
                        <span>{isAuthorizing ? "Connecting..." : "Save & Continue to GitHub Authorization ↗"}</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* TAB 2: GITHUB PERSONAL ACCESS TOKEN (PAT) */}
            {authMode === "pat" && (
              <form onSubmit={handlePersonalTokenAuthorize} className="space-y-4">
                <div className="p-3.5 bg-[#080d19] border border-slate-800 rounded-xl text-xs space-y-2">
                  <p className="text-slate-200 font-bold flex items-center gap-2">
                    <Key className="w-4 h-4 text-cyan-400" />
                    <span>Instant Connection via GitHub Token</span>
                  </p>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Connect directly without creating an OAuth app. Required scopes: <code className="text-cyan-300 font-mono">repo</code>, <code className="text-cyan-300 font-mono">read:user</code>.
                  </p>
                  <div className="pt-1">
                    <a
                      href={generatePatUrl || "https://github.com/settings/tokens/new?scopes=repo,read:user,user:email&description=Pasha+DevPilot"}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 rounded-lg text-xs font-mono font-bold transition-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>1-Click: Generate GitHub Token (Pre-Selected Scopes) ↗</span>
                    </a>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1.5 font-bold">
                    Paste Personal Access Token
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="password"
                      placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                      value={personalToken}
                      onChange={(e) => setPersonalToken(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-[#080d19] border border-slate-700 focus:border-cyan-400 rounded-xl text-xs text-white placeholder-slate-500 font-mono focus:outline-none"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1.5">
                    This token is validated directly against api.github.com to fetch both public and private repositories.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAuthModal(false)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isAuthorizing}
                    className="px-6 py-2.5 bg-[#238636] hover:bg-[#2ea043] text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-900/30 flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isAuthorizing ? "Authenticating..." : "Authorize & Load Repositories"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function RepositoriesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen cyber-bg flex items-center justify-center text-cyan-400 font-mono text-xs">
          Loading repositories...
        </div>
      }
    >
      <RepositoriesContent />
    </Suspense>
  );
}
