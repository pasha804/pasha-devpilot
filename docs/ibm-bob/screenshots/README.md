# IBM Bob Demo Walkthrough & Visual Proof

> **Project:** Pasha DevPilot — "Your AI Software Engineer."  
> **Topic:** Visual Proof & Screen Walkthroughs  

---

## Visual Demonstration Assets

The following core views and workflows were captured during end-to-end evaluation:

1. **Dashboard & Repository Hub (`/dashboard`, `/repositories`):**
   - Live repository list retrieved directly from GitHub API.
   - Zero mock data; dynamic repository stats (stars, forks, open issues, language badge).

2. **Repository Intelligence & Diagnostic Center (`/repositories/[id]`):**
   - AST symbol tree indexing, structural topology, and detected test runners.
   - Real-time diagnostic scan identifying unhandled exceptions and test gaps.

3. **Autonomous Task Workspace (`/tasks/[id]`):**
   - 7-State pipeline visualizer tracking `UNDERSTANDING` ➔ `INVESTIGATING` ➔ `PLANNING` ➔ `WAITING_FOR_APPROVAL` ➔ `BUILDING` ➔ `TESTING` ➔ `REVIEWING`.
   - Human-in-the-loop approval banner requiring explicit user sign-off before write operations.
   - Live Monaco diff editor comparing before/after source changes.
   - Truthful verification results panel displaying actual command, runner, exit code, and stdout.

4. **GitHub Pull Request Integration (`/pull-requests`):**
   - Automated git commit, branch push (`devpilot/<task-slug>-<task-id>`), and GitHub Pull Request creation.

---

*Note: For the live video recording and demo walk-through, refer to [HACKATHON_GUIDE.md](file:///e:/Pasha-devpolit/HACKATHON_GUIDE.md).*
