# ADR-004: GitHub OAuth 2.0 with Zero Browser-Exposed Credentials

## Status
Accepted

## Context
Exposing GitHub Client Secrets or relying on manual Personal Access Tokens (PATs) in the browser creates security vulnerabilities and friction for hackathon evaluators.

## Decision
1. Implement a complete server-side GitHub OAuth 2.0 flow (`GET /auth/github`, `GET /auth/github/callback`).
2. Use HMAC-SHA256 signed CSRF `state` tokens with expiration timestamps to block cross-site request forgery.
3. Keep `GITHUB_CLIENT_SECRET` strictly on the backend.
4. Issue secure JWT sessions to the frontend via HTTP-only cookies and Authorization headers.
5. Provide a fallback PAT entry mode strictly for local air-gapped development without OAuth apps, clearly separated from production OAuth.

## Consequences
- No credentials or OAuth secrets are ever exposed in client bundles or network payloads.
- Supports seamless evaluation without asking judges to generate complex fine-grained PATs.
- Robust session lifecycle including full token revocation on `/auth/github/disconnect`.
