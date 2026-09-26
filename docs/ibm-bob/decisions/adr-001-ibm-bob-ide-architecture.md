# ADR-001: IBM Bob IDE Architecture and Provider Integration

## Status
Accepted

## Context
Pasha DevPilot required an architecture capable of supporting both development-time acceleration and runtime production SDLC intelligence for the IBM Bob 2.0 Hackathon.

## Decision
1. Utilize the official IBM Bob IDE for initial project scaffolding, state machine modeling, and code search engine design.
2. Implement `BobProvider` (`packages/agent_core/providers/bob_provider.py`) as the primary runtime provider, automatically prioritized when `BOB_API_KEY` is present in the environment.
3. Fall back to CleanAPIs / DeepSeek / Groq only when explicitly configured or when Bob credentials are absent during local testing.

## Consequences
- Clean separation between development toolchain and production runtime.
- Native alignment with the IBM Bob ecosystem.
- Truthful attribution of AI contributions across the repository.
