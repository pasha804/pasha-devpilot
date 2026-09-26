"""
Unit and Integration Tests for Pasha DevPilot API and Agent Core
"""

import pytest
import asyncio
from datetime import datetime, timezone
from pathlib import Path

from apps.api.core.security import (
    create_access_token,
    decode_access_token,
    contains_secret,
    mask_secret,
    generate_oauth_state,
    verify_oauth_state,
)
from apps.api.services.indexer_service import RepositoryIndexer
from apps.api.services.search_service import CodeSearchService
from apps.api.services.context_engine import ContextEngine
from apps.api.services.sandbox_service import ExecutionSandbox
from apps.api.services.git_workflow_service import GitWorkflowService
from packages.agent_core.providers.mock_provider import MockAIProvider
from packages.agent_core.providers.base import AgentMessage
from packages.agent_core.tools import get_default_tool_registry
from packages.agent_core.tools.base import ToolPermission
from packages.agent_core.orchestrator import AgentOrchestrator, TaskState, TaskClassification


@pytest.mark.asyncio
async def test_security_token_and_secrets():
    # Test JWT token issuance & decode
    token = create_access_token({"sub": "user_123", "username": "pasha"})
    decoded = decode_access_token(token)
    assert decoded is not None
    assert decoded["sub"] == "user_123"
    assert decoded["username"] == "pasha"

    # Test OAuth CSRF state generation and validation
    state = generate_oauth_state()
    assert verify_oauth_state(state) is True
    assert verify_oauth_state("tampered:state:sig") is False
    assert verify_oauth_state("") is False

    # Test secret masking
    assert mask_secret("sk-1234567890abcdef1234") == "sk-1...1234"
    assert mask_secret("short") == "********"

    # Test secret detection
    assert contains_secret("GITHUB_TOKEN = 'ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'") is True
    assert contains_secret("normal_variable = 'hello world'") is False


@pytest.mark.asyncio
async def test_repository_indexer_on_demo_repo():
    indexer = RepositoryIndexer("demo-repo")
    frameworks = indexer.detect_frameworks()
    runners = indexer.detect_test_runners()

    assert "pytest" in runners
    # Test sensitive file filter
    assert indexer.is_sensitive_file(".env") is True
    assert indexer.is_sensitive_file(".env.production") is True
    assert indexer.is_sensitive_file("server.key") is True
    assert indexer.is_sensitive_file("main.py") is False


@pytest.mark.asyncio
async def test_code_search_service():
    search = CodeSearchService("demo-repo")
    exact = await search.exact_search("AuthService", limit=5)
    assert len(exact) > 0
    assert any("auth_service.py" in m.file_path for m in exact)

    # Test semantic intent search
    semantic = await search.semantic_intent_search("Where is auth and token expiration handled?", limit=5)
    assert len(semantic) > 0
    assert any("auth_service.py" in m.file_path for m in semantic)


@pytest.mark.asyncio
async def test_context_engine():
    engine = ContextEngine("demo-repo")
    ctx = await engine.build_context_for_task("Fix the token expiration bug in authentication service", "BUG_FIX")
    assert "assembled_context" in ctx
    assert len(ctx["included_files"]) > 0
    assert any("auth_service.py" in f for f in ctx["included_files"])


@pytest.mark.asyncio
async def test_execution_sandbox_security():
    sandbox = ExecutionSandbox("demo-repo", timeout_seconds=10)

    # Allowlisted safe command
    res = await sandbox.execute_safe_command(["python", "--version"])
    assert res["state"] in ("PASSED", "FAILED")
    assert "Python" in res["output"]

    # Blocked dangerous command
    blocked_res = await sandbox.execute_safe_command(["rm", "-rf", "/"])
    assert blocked_res["state"] == "BLOCKED"
    assert "Security Sandbox Error" in blocked_res["output"]


@pytest.mark.asyncio
async def test_agent_orchestrator_planning_and_tools():
    provider = MockAIProvider()
    tools = get_default_tool_registry()
    orchestrator = AgentOrchestrator(provider, tools)

    # Task classification
    assert orchestrator.classify_task("Fix broken authentication token") == TaskClassification.BUG_FIX
    assert orchestrator.classify_task("Add new route for billing export") == TaskClassification.FEATURE
    assert orchestrator.classify_task("Refactor database queries") == TaskClassification.REFACTOR

    # Tool permissions
    read_tool = tools.get("read_file")
    assert read_tool.permission == ToolPermission.READ

    edit_tool = tools.get("edit_file")
    assert edit_tool.permission == ToolPermission.WRITE

    delete_tool = tools.get("delete_file")
    assert delete_tool.permission == ToolPermission.DESTRUCTIVE

    # Unapproved write attempt must fail
    res_unapproved = await tools.execute("edit_file", {"file_path": "test.txt", "new_content": "abc"}, {"approved": False})
    assert res_unapproved.success is False
    assert "Approval required" in res_unapproved.error

    # Approved planning flow
    plan_res = await orchestrator.run_investigation_and_plan(
        task_id="task_test_01",
        description="Fix authentication token expiry",
        repo_path="demo-repo",
    )
    assert plan_res["state"] == TaskState.WAITING_FOR_APPROVAL
    assert "Implementation Plan" in plan_res["plan"]


@pytest.mark.asyncio
async def test_git_pr_markdown_generator():
    git_svc = GitWorkflowService("demo-repo")
    from apps.api.models.task import Task, FileChange, VerificationRun

    mock_task = Task(
        id="t-12345678",
        title="Fix token expiration check",
        description="Resolve inverted expiration timestamp check",
        classification="BUG_FIX",
        state="VERIFYING",
    )
    mock_changes = [
        FileChange(file_path="src/auth_service.py", change_type="MODIFIED")
    ]
    mock_v = VerificationRun(
        task_id="t-12345678",
        attempt_number=1,
        runner="pytest",
        state="PASSED",
        exit_code=0,
        output="2 passed in 0.12s",
    )

    md = git_svc.generate_pr_markdown(mock_task, mock_changes, mock_v)
    assert "## 🚀 Pasha DevPilot Automated Pull Request" in md
    assert "Fix token expiration check" in md
    assert "src/auth_service.py" in md
    assert "**PASSED**" in md


@pytest.mark.asyncio
async def test_cleanapis_and_deepseek_provider_routing():
    from packages.agent_core.providers.router import ModelRouter
    from packages.agent_core.providers.deepseek_provider import DeepSeekProvider
    from packages.agent_core.providers.groq_provider import GroqProvider

    # Test DeepSeek routing
    dev_provider = ModelRouter.get_development_provider()
    assert isinstance(dev_provider, DeepSeekProvider)
    assert dev_provider.model_name == "deepseek-v4-flash-0731"

    # Test Groq routing
    groq_provider = ModelRouter.get_provider(
        provider_name="groq",
        api_key="gsk_mock_test_key",
        model_name="llama-3.3-70b-versatile",
    )
    assert isinstance(groq_provider, GroqProvider)
    assert groq_provider.model_name == "llama-3.3-70b-versatile"
    assert groq_provider.base_url == "https://api.groq.com/openai/v1"


@pytest.mark.asyncio
async def test_20_section_engineering_report():
    from apps.api.services.analyzer_service import RepositoryAnalyzer

    analyzer = RepositoryAnalyzer("demo-repo")
    report = await analyzer.analyze("test-repo-id")

    # Verify report sections count (Prompt Section 16)
    assert len(report.sections) == 20
    assert "Executive Summary" in report.sections
    assert "Technology Stack" in report.sections
    assert "Architecture Overview" in report.sections
    assert "Testing" in report.sections
    assert "Security Findings" in report.sections
    assert "Recommendations" in report.sections
    assert "Priority Actions" in report.sections

    # Verify restrained health indicators (Prompt Section 18)
    assert report.repository_health in ("Stable", "Attention Needed", "Degraded", "Not measured")
    assert report.architecture_health in ("Modular", "Inconsistent", "Monolithic", "Not measured")
    assert report.build_status != ""

    # Verify sensitive files shield (Prompt Section 8)
    assert isinstance(report.sensitive_files_excluded, list)

    # Verify standard finding format (Prompt Section 17)
    assert report.total_issues > 0
    first_issue = report.issues[0]
    assert first_issue.id != ""
    assert first_issue.severity in ("CRITICAL", "HIGH", "MEDIUM", "LOW")
    assert first_issue.category in ("Authentication", "Security", "Performance", "Code Quality", "Testing", "Logic Bug")
    assert first_issue.title != ""
    assert first_issue.file != ""
    assert first_issue.why_it_matters != ""
    assert first_issue.confidence in ("High", "Medium", "Low")


@pytest.mark.asyncio
async def test_truthful_git_pull_request_without_fake_url():
    from apps.api.services.github_service import GitHubService

    # When no OAuth token is provided, must not fabricate a fake github.com/pull/42 URL (Prompt Section 71)
    gh = GitHubService(token=None)
    pr = await gh.create_pull_request(
        owner="pasha-dev",
        repo="demo-repo",
        title="fix(auth): fix token expiration check",
        body="PR Description with test evidence",
        head="devpilot/task-1234",
    )
    assert pr["html_url"] is None
    assert pr["state"] == "LOCAL_BRANCH_PREPARED"
    assert "requires active GitHub OAuth" in pr["status_message"]


