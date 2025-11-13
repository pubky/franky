# ADR 0005: TTL Strategy

## Status

Accepted — 2025-10-26

## Context

Local Dexie tables for users, posts, and tag collections store bootstrap data and stream updates. Without a shared expiry rule, stale rows linger indefinitely, forcing manual clears or heavy bootstrap runs. Earlier builds had no TTL policy, so follow/unfollow changes or deleted posts could remain in cache for days.

## Decision

Apply per-entity TTL tracking for the persistence layer:

- Maintain `user_ttl`, `post_ttl`, and tag-related TTL tables that record the next refresh timestamp per composite ID.
- Local services update TTL rows whenever they write or reconcile records; expired entries trigger refetch before reuse.
- Application workflows consult TTL helpers to decide when to refresh, keeping TTL logic out of controllers/UI.

## Consequences

- ✅ Guarantees consistent refresh behaviour for user, post, and tag data without wiping the whole database.
- ✅ Keeps local-first UX responsive while bounding how stale cached values can get.
- ⚠️ Requires every writer to touch TTL tables; missing updates lead to stale rows.
- ⚠️ Adds bookkeeping queries on read/write paths that must be monitored for performance.

## Alternatives Considered

- **No TTL** — simplest but leaves caches stale until a manual reset.
- **Global eviction window** — easy to implement but ignores per-entity freshness needs.
- **Full database reset on logout or schedule** — refreshes everything but wastes bandwidth and breaks offline continuity.
