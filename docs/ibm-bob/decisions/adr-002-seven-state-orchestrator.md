# ADR-002: 7-State Finite State Machine with Human Approval Gate

## Status
Accepted

## Context
Autonomous code modification presents severe risks of runaway hallucinations, unapproved file deletions, or unintended commits. The agent needed structured stages with an enforced pause before file modifications.

## Decision
Model the agent lifecycle as a 7-state machine:
`UNDERSTANDING` ➔ `INVESTIGATING` ➔ `PLANNING` ➔ `WAITING_FOR_APPROVAL` ➔ `IMPLEMENTING` ➔ `VERIFYING` ➔ `REVIEWING`.

The transition from `PLANNING` to `IMPLEMENTING` is strictly guarded by the `WAITING_FOR_APPROVAL` state. The agent is technically incapable of invoking write tools or diff appliers until a user sends an explicit `approve_plan` signal.

## Consequences
- Guaranteed human-in-the-loop safety.
- Clear visual progress tracking in the UI (`PipelineVisualizer.tsx`).
- Predictable audit log events for enterprise compliance.
