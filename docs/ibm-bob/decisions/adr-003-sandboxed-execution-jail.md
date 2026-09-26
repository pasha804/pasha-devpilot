# ADR-003: Sandboxed Subprocess Jail for Verification Runs

## Status
Accepted

## Context
Running arbitrary test runners or build commands against user code can expose host credentials, wipe directories, or trigger unauthorized network egress.

## Decision
Implement a multi-tier sandbox jail in `apps/api/services/sandbox_service.py`:
1. **Path Containment:** Resolve all paths against the sandbox root. Reject any paths containing `../` or targeting parent directories.
2. **Binary Allowlist:** Only permit recognized test runners (`pytest`, `npm test`, `jest`, `vitest`, `cargo test`, `go test`, `git diff`, `git status`).
3. **Command Denylist:** Reject commands containing shell redirection, pipes to bash (`curl | bash`), destructive file removal (`rm -rf`, `del /s`), or dangerous git commands (`git clean -f`, `git push --force`).
4. **Environment Sanitization:** Strip infrastructure secrets (`DATABASE_URL`, `SECRET_KEY`, `GITHUB_CLIENT_SECRET`, `BOB_API_KEY`) from subprocess environments.

## Consequences
- Prevents remote code execution from compromising DevPilot infrastructure.
- Blocks accidental or malicious destruction of workspace code.
- Ensures test outputs are truthful and unadulterated.
