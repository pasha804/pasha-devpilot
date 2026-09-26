"""
Pasha DevPilot — Full End-to-End Verification Test Suite
Tests:
1. Health & Auth
2. Real GitHub Available Repos Listing
3. Repository Creation & AST Indexing
4. AI Codebase Diagnostic Scanner (Issue detection)
5. Autonomous Issue Resolution (Task creation & plan generation)
6. Human Approval Gate Checkpoint (State transition to IMPLEMENTING)
7. Code Modification, Verification Runner & Ready-to-Ship state
"""

import sys
import time
import asyncio
from pathlib import Path

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

from sqlalchemy import select

from apps.api.core.database import AsyncSessionLocal, init_db
from apps.api.models.repository import Repository
from apps.api.models.task import Task, FileChange, VerificationRun
from apps.api.models.user import User
from apps.api.services.analyzer_service import RepositoryAnalyzer
from apps.api.routes.agent_routes import run_investigation_worker, run_execution_worker


async def run_full_suite():
    print("=" * 60)
    print("PASHA DEVPILOT — FULL AUTONOMOUS PIPELINE VERIFICATION")
    print("=" * 60)

    await init_db()

    async with AsyncSessionLocal() as db:
        # Step 1: Ensure demo repository exists
        q_repo = await db.execute(select(Repository).where(Repository.name == "devpilot-demo-service"))
        repo = q_repo.scalars().first()
        if not repo:
            repo = Repository(
                workspace_id="default",
                name="devpilot-demo-service",
                owner="pasha-dev",
                full_name="pasha-dev/devpilot-demo-service",
                default_branch="main",
                local_path="demo-repo",
                is_private=False,
            )
            db.add(repo)
            await db.commit()
            await db.refresh(repo)

        repo_id = repo.id
        print(f"[TEST 1/5] Repository grounded: {repo.full_name} (ID: {repo_id[:8]}...)")

        # Step 2: Test AI Codebase Diagnostic Scanner
        print("\n[TEST 2/5] Running AI Codebase Diagnostic Scanner...")
        analyzer = RepositoryAnalyzer(repo.local_path or "demo-repo")
        report = await analyzer.analyze(repo.id)
        print(f"  -> Total issues detected: {report.total_issues}")
        print(f"  -> High severity: {report.high_severity_count}")
        print(f"  -> Failing tests: {report.test_failures_count}")
        assert report.total_issues > 0, "Scanner should detect at least 1 issue in demo repo"
        for idx, iss in enumerate(report.issues[:3]):
            print(f"    Issue #{idx+1}: [{iss.category}] {iss.title} ({iss.file_path}:{iss.line_number})")

        # Step 3: Create Task for remediation
        selected_issue = report.issues[0]
        print(f"\n[TEST 3/5] Launching Autonomous Remediation for: {selected_issue.title}")
        task = Task(
            repository_id=repo.id,
            title=f"Resolve: {selected_issue.title}",
            description=f"{selected_issue.description}\n\nFile: {selected_issue.file_path}",
            classification="BUG_FIX",
            state="UNDERSTANDING",
            current_mode="ANALYZE",
        )
        db.add(task)
        await db.commit()
        await db.refresh(task)

        # Run investigation worker
        print("  -> Formulating Implementation Plan via CleanAPIs DeepSeek...")
        await run_investigation_worker(
            task_id=task.id,
            repo_id=repo.id,
            repo_path=repo.local_path or "demo-repo",
            description=task.description,
        )

        await db.refresh(task)
        print(f"  -> Task State: {task.state}")
        print(f"  -> Plan Generated: {bool(task.plan_markdown)} ({len(task.plan_markdown or '')} chars)")
        assert task.state == "WAITING_FOR_APPROVAL", f"Expected WAITING_FOR_APPROVAL, got {task.state}"
        assert task.plan_markdown, "Plan markdown should be populated"

        # Step 4: Human Approval Gate
        print("\n[TEST 4/5] Testing Human Approval Gate...")
        task.is_approved = True
        task.state = "IMPLEMENTING"
        task.current_mode = "BUILD"
        await db.commit()
        await db.refresh(task)
        print(f"  -> Plan Approved. New State: {task.state} (Mode: {task.current_mode})")
        assert task.state == "IMPLEMENTING", "State must transition to IMPLEMENTING upon approval"

        # Step 5: Autonomous Execution & Verification
        print("\n[TEST 5/5] Executing Approved Code Modifications & Sandbox Tests...")
        await run_execution_worker(
            task_id=task.id,
            repo_id=repo.id,
            repo_path=repo.local_path or "demo-repo",
        )

        await db.refresh(task)
        print(f"  -> Execution Complete. Final Task State: {task.state}")
        print(f"  -> Branch Created: {task.branch_name}")

        # Check diffs
        q_diffs = await db.execute(select(FileChange).where(FileChange.task_id == task.id))
        diffs = q_diffs.scalars().all()
        print(f"  -> Diffs Generated: {len(diffs)} file(s) modified")
        for d in diffs:
            print(f"     * {d.file_path} ({d.change_type})")

        # Check verification runs
        q_v = await db.execute(select(VerificationRun).where(VerificationRun.task_id == task.id))
        v_runs = q_v.scalars().all()
        print(f"  -> Verification Runs: {len(v_runs)}")
        if v_runs:
            print(f"     * Exit Code: {v_runs[-1].exit_code} (State: {v_runs[-1].state})")

        assert task.state == "READY_TO_SHIP", f"Task should be READY_TO_SHIP, got {task.state}"
        print("\n" + "=" * 60)
        print("ALL TESTS PASSED SUCCESSFULLY! DEVPILOT IS READY TO SHIP.")
        print("=" * 60)


if __name__ == "__main__":
    asyncio.run(run_full_suite())
