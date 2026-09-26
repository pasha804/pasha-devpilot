# Pasha DevPilot — IBM Bob Hackathon Hardening Plan

## Overview

The goal is to transform the existing Pasha DevPilot project into a clean, production-quality
hackathon submission for the IBM Bob 2.0 competition on lablab.ai. The backend architecture,
agent orchestrator, database models, SSE event bus, and AI provider abstraction are all solid
and will be preserved. This plan focuses exclusively on **removing fake/demo data, fixing the
golden path, tightening security, polishing the frontend, and ensuring the IBM Bob integration
is showcased correctly**.

The golden path is:
`GitHub OAuth → repo picker → connect repo → create task → agent investigates → human approves → agent implements → tests run → Monaco diff → PR created`

---

## Sub-Task 1 — Remove All Fake/Demo Data from Production Flow

**Status:** `[x] completed`

### Intent
Every fake credential, mock profile, auto-injected demo repository, and hardcoded `pasha-dev`
username check must be removed from the live production code path. These are the single biggest
risk of embarrassing a demo in front of judges: the system appears to always show the same
"pasha-dev" user regardless of who is actually authenticated.

### Expected Outcomes
- `GitHubService.exchange_code_for_token()` no longer returns a mock token for `mock_client_id`; instead it raises a clear `HTTPException` instructing the operator to set real `GITHUB_CLIENT_ID` env vars.
- `GitHubService.get_user_profile()` no longer falls back to the hardcoded `pasha-dev` profile; if the token is missing or real API call fails it raises `HTTPException(401)`.
- `GitHubService.list_repositories()` no longer injects the `devpilot-demo-service` fake repo unconditionally. The demo repo is **only added** when `EXECUTION_MODE=mock` and no real repos are returned.
- `repo_routes.py` line 87: the `username != "pasha-dev"` guard is removed; username is resolved from the authenticated user record without any special-casing.
- `repositories/page.tsx` line 63: the `user.username !== "pasha-dev"` check is removed.
- The `POST /auth/github/configure` endpoint that writes credentials to `.env` at runtime is **removed entirely** — OAuth credentials belong only in environment variables.
- The `POST /auth/developer-login` endpoint that calls the full OAuth callback with a fake code is gated to `EXECUTION_MODE=mock` only; if `EXECUTION_MODE != mock` it returns `404`.

### Todo List
1. Edit `apps/api/services/github_service.py`:
   - Remove the `if settings.GITHUB_CLIENT_ID == "mock_client_id": return f"gho_devpilot_local_mock_token_..."` block in `exchange_code_for_token`.
   - Replace it with `if not settings.GITHUB_CLIENT_ID or settings.GITHUB_CLIENT_ID == "mock_client_id": raise HTTPException(status_code=503, detail="GitHub OAuth is not configured. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in your .env file.")`.
   - Remove the `if not self.token or "mock" in self.token: return {hardcoded pasha-dev dict}` block in `get_user_profile`. If token missing, raise `HTTPException(401)`. Keep only the real API call path.
   - In `list_repositories`, change the demo repo injection block: wrap it in `if settings.EXECUTION_MODE == "mock" and not repos:` instead of `if not has_demo:`.
   - Remove the `if not repos and username and username != "pasha-dev":` check — simplify to just call public repos if no authenticated repos returned.
2. Edit `apps/api/routes/auth_routes.py`:
   - Delete the entire `POST /auth/github/configure` endpoint (lines 24-81).
   - Delete the `GitHubOAuthConfigRequest` Pydantic model.
   - Gate `developer-login` endpoint: add `if settings.EXECUTION_MODE != "mock": raise HTTPException(status_code=404)` as the first line of the function body.
3. Edit `apps/api/routes/repo_routes.py`:
   - Remove the `u.username != "pasha-dev"` guard on line 87; resolve `resolved_username = u.username`.
4. Edit `apps/web/src/app/repositories/page.tsx`:
   - Remove the `user.username !== "pasha-dev"` ternary on line 63; simplify to `usernameToQuery = customUser || user?.username`.

### Relevant Context
- `apps/api/services/github_service.py`: lines 30-32 (mock token), 52-77 (mock profile), 154-179 (demo repo injection)
- `apps/api/routes/auth_routes.py`: lines 24-81 (`/configure`), 322-326 (`developer-login`)
- `apps/api/routes/repo_routes.py`: line 87 (`pasha-dev` guard)
- `apps/web/src/app/repositories/page.tsx`: line 63 (`pasha-dev` check)

---

## Sub-Task 2 — Fix Session Expiry and Token Security

**Status:** `[x] completed`

### Intent
The `Session` model has an `expires_at` column but `decode_access_token` in `security.py` never
validates it. The JWT library's built-in expiry (`exp` claim) does work, but the session record
is never checked. Also, `session_rec.expires_at` is set to `datetime.now(timezone.utc)` (i.e.
immediately expired) in every login handler — this is clearly a bug. The GitHub token is stored
plaintext in the `User.github_access_token` column.

### Expected Outcomes
- Every call to `github_auth_callback`, `github_token_login`, and `connect_github_account` sets `session_rec.expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)`.
- `decode_access_token` lets PyJWT handle expiry via `options={"verify_exp": True}` (already default — just ensure it is explicit).
- The `github_access_token` column is documented with a `# TODO: encrypt at rest` comment (full field-level encryption is out of scope for hackathon but must be noted).

### Todo List
1. Edit `apps/api/routes/auth_routes.py`:
   - In `github_auth_callback` (line 147), change `expires_at=datetime.now(timezone.utc)` to `expires_at=datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)`.
   - Add `from datetime import timedelta` import if not present.
   - Apply the same fix to `github_token_login` (line 305) and `connect_github_account` (line 233).
2. Edit `apps/api/core/security.py`:
   - In `decode_access_token`, explicitly pass `options={"verify_exp": True}` to `jwt.decode` to make the intent clear.
3. Edit `apps/api/models/user.py`:
   - Add inline comment on `github_access_token` column: `# TODO: encrypt at rest — use Fernet symmetric encryption before production deployment`.

### Relevant Context
- `apps/api/routes/auth_routes.py`: lines 147, 233, 305 (broken `expires_at` values)
- `apps/api/core/security.py`: line 56 (`jwt.decode` call)
- `apps/api/models/user.py`: line 25 (plaintext token column)

---

## Sub-Task 3 — IBM Bob Integration — Verify BobProvider is Wired and Showcased

**Status:** `[x] completed`

### Intent
IBM Bob is the primary AI provider for the hackathon. The `BobProvider` class was created in
a previous session. This sub-task verifies it is correctly wired end-to-end: registered in the
router, exported from the package, and that the `AI_PROVIDER=bob` path in `config.py` routes
to it. Also verifies the landing page and README correctly attribute IBM Bob.

### Expected Outcomes
- `packages/agent_core/providers/bob_provider.py` exists and implements `BaseAIProvider`.
- `packages/agent_core/providers/router.py` routes `AI_PROVIDER == "bob"` to `BobProvider`.
- `packages/agent_core/providers/__init__.py` exports `BobProvider`.
- `.env.example` has `BOB_API_KEY`, `BOB_BASE_URL`, `BOB_MODEL` documented.
- `config.py` `AI_PROVIDER` default is either `"bob"` or `"cleanapis"` with a comment explaining the Bob integration.
- `HACKATHON_GUIDE.md` opens with IBM Bob as the AI backbone.
- No claim that IBM Bob IS the product — it is the AI engine POWERING the product.

### Todo List
1. Read `packages/agent_core/providers/bob_provider.py` to verify it implements `complete()` and `stream()`.
2. Read `packages/agent_core/providers/router.py` to verify `"bob"` case exists and instantiates `BobProvider`.
3. Read `packages/agent_core/providers/__init__.py` to verify `BobProvider` is exported.
4. Read `.env.example` to confirm `BOB_*` vars are present.
5. If any of the above are missing or broken, fix them.
6. Verify `HACKATHON_GUIDE.md` opens with IBM Bob framing (read first 30 lines).

### Relevant Context
- `packages/agent_core/providers/` directory
- `apps/api/core/config.py` (AI_PROVIDER field)
- `.env.example`
- `HACKATHON_GUIDE.md`

---

## Sub-Task 4 — Frontend: Error States, Empty States, Loading Skeletons

**Status:** `[x] completed`

### Intent
The frontend currently has no global error boundary, no toast/notification system for API
errors, and no skeleton loaders. When GitHub OAuth is not configured judges will see a broken
blank page instead of a helpful message. Empty states (no repos connected, no tasks yet) need
clear CTAs.

### Expected Outcomes
- `apps/web/src/app/layout.tsx` wraps the app in an error boundary component.
- A simple `useToast` hook or inline toast component exists and is used by `repositories/page.tsx` and `tasks/[id]/page.tsx` for API error messages.
- `repositories/page.tsx` shows a skeleton loader while repos are loading.
- `repositories/page.tsx` shows a proper empty state with a GitHub OAuth CTA when no repos are available and GitHub is not configured.
- `tasks/[id]/page.tsx` shows a skeleton loader while task data loads.
- Dashboard shows a "No repositories connected yet" empty state card when `repos.length === 0` (it already uses real DB data, so just needs the empty state UI).

### Todo List
1. Create `apps/web/src/components/ErrorBoundary.tsx` — a React class component that catches render errors and shows a friendly fallback UI.
2. Create `apps/web/src/components/Toast.tsx` — a lightweight self-dismissing toast component and `useToast` hook (no external library needed).
3. Edit `apps/web/src/app/layout.tsx` to wrap `{children}` in `<ErrorBoundary>`.
4. Edit `apps/web/src/app/repositories/page.tsx`:
   - Import and use `useToast` to show API errors.
   - Add a `<SkeletonLoader />` for the loading state (simple Tailwind pulse animation inline).
   - Add an empty state card when `githubAvailable.length === 0 && repositories.length === 0` and not loading.
5. Edit `apps/web/src/app/dashboard/page.tsx`:
   - Add an empty state for `repositories.length === 0` (read file first to see what's there).

### Relevant Context
- `apps/web/src/app/layout.tsx`
- `apps/web/src/app/repositories/page.tsx`
- `apps/web/src/app/dashboard/page.tsx`
- `apps/web/src/components/` directory

---

## Sub-Task 5 — Frontend: Remove TypeScript `any` Types in Critical Paths

**Status:** `[x] completed`

### Intent
`repositories/page.tsx` line 71 casts `ghRepos` as `any[]`. This masks type errors and is a
code quality red flag visible to any technical judge reviewing the code. Fix the most glaring
`any` types without a full TypeScript rewrite.

### Expected Outcomes
- `repositories/page.tsx`: `ghRepos as any[]` replaced with a typed `GithubRepo[]` interface.
- `lib/api.ts`: The worst `any` types in the response handlers are typed with inline interfaces.
- No new TypeScript compilation errors introduced.

### Todo List
1. Read `apps/web/src/lib/api.ts` (full file) to find the `any` types.
2. Define `interface GithubRepo` in `repositories/page.tsx` with the fields used from the API response.
3. Replace `as any[]` cast with `as GithubRepo[]`.
4. In `api.ts`, replace the 2-3 most obvious `any` return types with `Record<string, unknown>` or proper interfaces.

### Relevant Context
- `apps/web/src/app/repositories/page.tsx`: line 71
- `apps/web/src/lib/api.ts`

---

## Sub-Task 6 — Golden Path Smoke Test Document

**Status:** `[x] completed`

### Intent
Write a `DEMO_SCRIPT.md` file that documents the exact steps a judge must follow to see the
full golden path working end-to-end. This file also serves as the smoke test checklist for
verifying the system before demo day. It should be honest about what requires real GitHub
OAuth credentials vs what works with `EXECUTION_MODE=mock`.

### Expected Outcomes
- `DEMO_SCRIPT.md` exists at the repo root.
- It contains two tracks: (A) Full production path with real GitHub OAuth, and (B) Mock mode path for judges who don't want to configure OAuth.
- Each track has numbered steps with expected UI outcomes and what to verify at each step.
- IBM Bob API key setup is documented with a note about the hackathon key.

### Todo List
1. Write `DEMO_SCRIPT.md` covering:
   - Prerequisites (environment variables to set).
   - Track A: Real OAuth — `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `BOB_API_KEY` required; steps through the full golden path.
   - Track B: Mock mode — set `EXECUTION_MODE=mock`; steps through demo with the built-in `devpilot-demo-service` repo.
   - What to look for at each step (expected SSE events, expected agent state transitions).
   - Known limitations and honest notes for judges.

### Relevant Context
- `HACKATHON_GUIDE.md` (existing guide to build on)
- `.env.example`
- `demo-repo/` directory
- `apps/api/core/config.py` (EXECUTION_MODE values)

---

## Implementation Order

```
Sub-Task 1  →  Sub-Task 2  →  Sub-Task 3  →  Sub-Task 4  →  Sub-Task 5  →  Sub-Task 6
 (fake data)    (sessions)     (Bob wired)    (frontend UX)   (TypeScript)   (demo doc)
```

Each sub-task is independent enough to be implemented and reviewed one at a time.
Sub-Tasks 1 and 2 are backend-only.
Sub-Tasks 4 and 5 are frontend-only.
Sub-Task 3 touches packages only.
Sub-Task 6 is documentation only.
