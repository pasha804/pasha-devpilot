/**
 * Pasha DevPilot — Frontend API Client
 * Interfaces with FastAPI backend for repositories, tasks, agent execution, and verification.
 */

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface UserProfile {
  id: string;
  username: string;
  name?: string;
  email?: string;
  avatar_url?: string;
  is_active: boolean;
  workspace_id: string;
  workspace_name: string;
}

export interface RepositoryItem {
  id: string;
  name: string;
  owner: string;
  full_name: string;
  default_branch: string;
  primary_language?: string;
  detected_frameworks: string[];
  detected_test_runners: string[];
  is_private: boolean;
  local_path?: string;
  indexed_at?: string;
  created_at: string;
  file_count?: number;
}

export interface GitHubRepoItem {
  id?: number | string;
  name: string;
  full_name: string;
  owner: { login: string } | string;
  private?: boolean;
  description?: string;
  language?: string;
  default_branch?: string;
  stargazers_count?: number;
  stars?: number;
  forks?: number;
  updated_at?: string;
  clone_url?: string;
  local_path?: string;
  html_url?: string;
}

export interface FileTreeNode {
  name: string;
  path: string;
  is_dir: boolean;
  size_bytes?: number;
  language?: string;
  is_sensitive?: boolean;
  children?: FileTreeNode[];
}

export interface VerificationRun {
  id: string;
  attempt_number: number;
  runner: string;
  command: string;
  state: string;
  exit_code: number | null;
  output: string | null;
  duration_ms: number;
  executed_at?: string;
}

export interface TaskItem {
  id: string;
  repository_id: string;
  title: string;
  description: string;
  classification: string;
  state: string;
  current_mode: string;
  branch_name?: string;
  plan_markdown?: string;
  is_approved: boolean;
  requires_approval: boolean;
  created_at: string;
  updated_at: string;
  steps: {
    id: string;
    step_number: number;
    name: string;
    status: string;
    description?: string;
  }[];
  file_changes: {
    file_path: string;
    change_type: string;
    unified_diff: string;
    original_content?: string;
    new_content?: string;
    is_reverted: boolean;
  }[];
  verification_passed?: boolean;
  latest_verification?: VerificationRun | null;
  verification_runs?: VerificationRun[];
}

export interface SearchMatch {
  file_path: string;
  line_number: number;
  line_content: string;
  match_score: number;
  symbol_name?: string;
}

export interface PullRequestItem {
  id: string;
  task_id: string;
  title: string;
  body: string;
  head_branch: string;
  base_branch: string;
  pr_number?: number;
  pr_url?: string;
  status: string;
  created_at: string;
}

export interface PlatformSettings {
  app_name: string;
  app_version: string;
  ai_provider: string;
  ai_base_url?: string;
  ai_model_name: string;
  masked_api_key: string;
  execution_mode: string;
  sandbox_timeout_seconds: number;
  max_self_healing_attempts: number;
}

export interface ProjectMemory {
  id: string;
  key: string;
  value: string;
  category: string;
  is_active: boolean;
}

// Token helper
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("devpilot_token");
}

export function removeAuthToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("devpilot_token");
  }
}

export function setAuthToken(token: string): void {
  if (typeof window !== "undefined") {
    if (!token) {
      localStorage.removeItem("devpilot_token");
    } else {
      localStorage.setItem("devpilot_token", token);
    }
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API error (${res.status}): ${errorText}`);
  }

  return res.json() as Promise<T>;
}

export interface RepositoryIssueItem {
  id: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | string;
  category: "Authentication" | "Security" | "Performance" | "Code Quality" | "Testing" | "Logic Bug" | string;
  title: string;
  description: string;
  evidence?: string;
  file?: string;
  line?: number;
  why_it_matters?: string;
  suggested_improvement?: string;
  confidence?: "High" | "Medium" | "Low" | string;
  // Backwards compatibility fields
  file_path?: string;
  line_number?: number;
  suggested_fix?: string;
  failing_test?: string;
  code_snippet?: string;
}

export interface RepositoryAnalysisReportItem {
  repository_id: string;
  repository_path: string;
  repository_name?: string;
  total_issues: number;
  high_severity_count: number;
  test_failures_count: number;
  security_findings_count?: number;
  performance_findings_count?: number;
  code_quality_findings_count?: number;
  repository_health?: string;
  architecture_health?: string;
  test_status?: string;
  build_status?: string;
  technical_debt?: string;
  sensitive_files_excluded?: string[];
  sections?: Record<string, string>;
  issues: RepositoryIssueItem[];
}

export const api = {
  async getGitHubAuthUrl(): Promise<{
    url: string | null;
    is_mock_enabled: boolean;
    is_configured?: boolean;
    client_id?: string | null;
    redirect_uri?: string;
    register_app_url?: string;
    generate_pat_url?: string;
  }> {
    return request("/auth/github/url");
  },

  async configureGitHubOAuth(payload: { client_id: string; client_secret: string }): Promise<{
    status: string;
    message: string;
    url: string;
  }> {
    return request("/auth/github/configure-oauth", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async developerLogin(): Promise<{ access_token: string; username: string }> {
    const data = await request<{ access_token: string; username: string }>("/auth/developer-login", {
      method: "POST",
    });
    setAuthToken(data.access_token);
    return data;
  },

  async connectGitHubAccount(username: string): Promise<{ access_token: string; username: string }> {
    const data = await request<{ access_token: string; username: string }>("/auth/github/connect-account", {
      method: "POST",
      body: JSON.stringify({ username }),
    });
    setAuthToken(data.access_token);
    return data;
  },

  async connectGitHubToken(token: string): Promise<{ access_token: string; username: string }> {
    const data = await request<{ access_token: string; username: string }>("/auth/github/token", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
    setAuthToken(data.access_token);
    return data;
  },

  async logout(): Promise<void> {
    try {
      await request("/auth/logout", { method: "POST" });
    } catch {
      // Ignore if already logged out
    }
    setAuthToken("");
  },

  async disconnectGitHub(): Promise<{ status: string; message: string }> {
    const res = await request<{ status: string; message: string }>("/auth/github/disconnect", { method: "POST" });
    setAuthToken("");
    return res;
  },

  async resetDemoData(username?: string): Promise<{ status: string; message: string }> {
    const query = username ? `?username=${encodeURIComponent(username)}` : "";
    let res: { status: string; message: string };
    try {
      res = await request<{ status: string; message: string }>(`/auth/reset-demo${query}`, {
        method: "POST",
      });
    } catch {
      res = { status: "error", message: "Failed to reset demo data on server" };
    }
    if (typeof window !== "undefined") {
      localStorage.clear();
      sessionStorage.clear();
    }
    return res;
  },


  async getCurrentUser(): Promise<UserProfile> {
    return request("/auth/me");
  },

  // Repositories
  async getRepositories(): Promise<RepositoryItem[]> {
    return request("/repositories");
  },

  async getGitHubAvailable(username?: string): Promise<GitHubRepoItem[]> {
    const query = username ? `?username=${encodeURIComponent(username)}` : "";
    return request<GitHubRepoItem[]>(`/repositories/github-available${query}`);
  },

  async connectRepository(payload: { name: string; owner: string; local_path?: string; clone_url?: string; is_private?: boolean }): Promise<RepositoryItem> {
    return request("/repositories", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async batchConnectRepositories(payload: {
    repositories?: Array<{ name: string; owner: string; local_path?: string; clone_url?: string; is_private?: boolean }>;
    connect_all?: boolean;
  }): Promise<RepositoryItem[]> {
    return request("/repositories/batch-connect", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async getRepository(id: string): Promise<RepositoryItem> {
    return request(`/repositories/${id}`);
  },

  async reindexRepository(id: string): Promise<{ status: string; message: string }> {
    return request(`/repositories/${id}/index`, { method: "POST" });
  },

  async getRepositoryTree(id: string): Promise<FileTreeNode[]> {
    return request(`/repositories/${id}/tree`);
  },

  async getFileContent(repoId: string, path: string): Promise<{ path: string; content: string; lines: number }> {
    return request(`/repositories/${repoId}/file?path=${encodeURIComponent(path)}`);
  },

  async searchCode(repoId: string, query: string, searchType: string = "exact"): Promise<{ query: string; total_matches: number; results: SearchMatch[] }> {
    return request(`/repositories/${repoId}/search`, {
      method: "POST",
      body: JSON.stringify({ query, search_type: searchType, limit: 30 }),
    });
  },

  // AI Diagnostic Scanner & Remediation
  async scanRepository(repoId: string): Promise<RepositoryAnalysisReportItem> {
    return request(`/repositories/${repoId}/scan`, { method: "POST" });
  },

  async getRepositoryIssues(repoId: string): Promise<RepositoryAnalysisReportItem> {
    return request(`/repositories/${repoId}/issues`);
  },

  async resolveRepositoryIssue(
    repoId: string,
    issue: RepositoryIssueItem
  ): Promise<{ status: string; task_id: string; title: string }> {
    const payload = {
      ...issue,
      id: issue.id,
      issue_id: issue.id,
      file: issue.file || issue.file_path || "src",
      file_path: issue.file || issue.file_path || "src",
      suggested_fix: issue.suggested_improvement || issue.suggested_fix || "",
      suggested_improvement: issue.suggested_improvement || issue.suggested_fix || "",
      code_snippet: issue.evidence || issue.code_snippet || "",
      evidence: issue.evidence || issue.code_snippet || "",
    };
    return request(`/repositories/${repoId}/resolve-issue`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async resolveAllRepositoryIssues(
    repoId: string,
    issues: RepositoryIssueItem[]
  ): Promise<{ status: string; total_queued: number; tasks: any[] }> {
    const mapped = issues.map((issue) => ({
      ...issue,
      id: issue.id,
      issue_id: issue.id,
      file: issue.file || issue.file_path || "src",
      file_path: issue.file || issue.file_path || "src",
      suggested_fix: issue.suggested_improvement || issue.suggested_fix || "",
      suggested_improvement: issue.suggested_improvement || issue.suggested_fix || "",
      code_snippet: issue.evidence || issue.code_snippet || "",
      evidence: issue.evidence || issue.code_snippet || "",
    }));
    return request(`/repositories/${repoId}/resolve-all`, {
      method: "POST",
      body: JSON.stringify({ issues: mapped }),
    });
  },

  async resolveAllIssues(
    repoId: string,
    issues: RepositoryIssueItem[]
  ): Promise<{ status: string; total_queued: number; tasks: any[] }> {
    return this.resolveAllRepositoryIssues(repoId, issues);
  },

  // Tasks
  async getTasks(repositoryId?: string): Promise<TaskItem[]> {
    const query = repositoryId ? `?repository_id=${repositoryId}` : "";
    return request(`/tasks${query}`);
  },

  async createTask(payload: { repository_id: string; title: string; description: string }): Promise<TaskItem> {
    return request("/tasks", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async getTask(id: string): Promise<TaskItem> {
    return request(`/tasks/${id}`);
  },

  async triggerInvestigation(taskId: string): Promise<{ status: string }> {
    return request(`/tasks/${taskId}/investigate`, { method: "POST" });
  },

  async approvePlan(taskId: string, approved: boolean, feedback?: string, editedPlan?: string): Promise<TaskItem> {
    return request(`/tasks/${taskId}/approve`, {
      method: "POST",
      body: JSON.stringify({ approved, feedback, edited_plan: editedPlan }),
    });
  },

  async triggerExecution(taskId: string): Promise<{ status: string }> {
    return request(`/tasks/${taskId}/execute`, { method: "POST" });
  },

  async cancelTask(taskId: string): Promise<TaskItem> {
    return request(`/tasks/${taskId}/cancel`, { method: "POST" });
  },

  async completeTask(taskId: string): Promise<TaskItem> {
    return request(`/tasks/${taskId}/complete`, { method: "POST" });
  },

  async runManualVerification(taskId: string, customTarget?: string): Promise<Record<string, unknown>> {
    return request(`/tasks/${taskId}/verify`, {
      method: "POST",
      body: JSON.stringify({ custom_target: customTarget }),
    });
  },

  // Pull Requests
  async createPullRequest(taskId: string, payload: { title?: string; target_branch?: string }): Promise<PullRequestItem> {
    return request(`/tasks/${taskId}/pull-request`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async getPullRequests(): Promise<PullRequestItem[]> {
    return request("/pull-requests");
  },

  // Settings & Memories
  async getSettings(): Promise<PlatformSettings> {
    return request("/settings");
  },

  async updateSettings(payload: Partial<PlatformSettings> & { ai_api_key?: string }): Promise<PlatformSettings> {
    return request("/settings", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async getMemories(): Promise<ProjectMemory[]> {
    return request("/settings/memories");
  },

  async addMemory(key: string, value: string, category: string = "architecture"): Promise<ProjectMemory> {
    return request("/settings/memories", {
      method: "POST",
      body: JSON.stringify({ key, value, category }),
    });
  },

  async deleteMemory(id: string): Promise<{ status: string }> {
    return request(`/settings/memories/${id}`, { method: "DELETE" });
  },
};
