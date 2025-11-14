# ADR 0001: Local-First Writes

## Status

Accepted — 2025-10-26

## Context

User interactions must feel instantaneous even when network latency is high or connectivity is unreliable. Persisting writes directly to the homeserver blocks the UI on round-trip times and introduces brittle error handling paths for intermittent failures.

## Decision

Write operations commit to the local Dexie store first, updating UI-observable state immediately. A background synchronizer propagates mutations to the homeserver and reconciles server acknowledgements or conflicts.

## Consequences

- ✅ Perceived responsiveness stays high; UI reflects the local intent instantly.
- ✅ Offline edits and intermittent connectivity are supported without special UI flows.
- ⚠️ Requires reconciliation logic for conflicts, retries, and TTL/expiry management.
- ⚠️ Local data can momentarily diverge from server truth until synchronization completes.

## Alternatives Considered

- **Server-first writes** — Simpler consistency but unacceptable latency and offline behaviour.
- **Optimistic server writes** — Still depends on network success before local state stabilizes.
