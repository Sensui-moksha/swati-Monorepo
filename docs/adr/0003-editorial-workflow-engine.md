# ADR 0003: 8-Stage Enterprise Editorial Workflow State Machine

## Status
Accepted

## Context
Publishing literary articles, historical essays, and serialized content involves multiple editorial checkpoints: content creation, copy-editing, legal review for defamatory or copyrighted text, chief editor sign-off, and embargoed scheduling. A flat `draft | published` enum lacks accountability, audit trails, and role-gated handoffs.

## Decision
We implement an explicit 8-stage state machine:
`Draft` → `Assigned` → `Editor Review` → `Senior Editor` → `Chief Editor` → `Legal Review` → `Scheduled Publish` → `Published` → `Archived`

Key principles:
1. Every state transition is atomic and recorded in `WorkflowTransition` with actor, timestamp, and optional rejection remarks.
2. Only authorized roles can advance articles to the next stage (e.g. only `ChiefEditor` or `LegalReviewer` can authorize publication).
3. Rollbacks to previous stages are supported with automatic notification dispatch to assigned authors and editors.

## Consequences
- Strict editorial governance prevents accidental or unauthorized publishing.
- Clear historical timeline of every editorial decision.
