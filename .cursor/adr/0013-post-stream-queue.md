# ADR 0013: Post Stream Queue

## Status

Accepted — 2025-01-12

## Context

Post streams require pagination with server-side filtering (e.g., excluding posts from muted users). When fetching posts from the API with a fixed batch size (e.g., 30 posts), applying filters client-side can result in fewer posts than needed for a page (e.g., only 15 valid posts remain after filtering out muted users, but 20 are needed).

Without a buffering mechanism:
- Pagination becomes inefficient with repeated API calls to fill gaps
- Posts could be skipped or duplicated across pagination boundaries
- Filter changes (e.g., unmuting a user) require complex reconciliation

## Decision

Implement a **PostStreamQueue** as an in-memory buffer that stores overflow posts between pagination requests. The queue:

1. **Collects posts** by combining queued overflow with fresh API fetches
2. **Applies filters** to both queued and fetched posts (e.g., mute filtering)
3. **Returns exactly the requested number** of posts to the UI
4. **Saves overflow** for the next pagination request

### Core Interface

```typescript
interface TQueueEntry {
  posts: string[];    // Array of composite post IDs
  cursor: number;     // Pagination cursor (timestamp)
}

class PostStreamQueue {
  collect(streamId, { limit, cursor, filter, fetch }): Promise<CollectResult>
  get(streamId): TQueueEntry | undefined
  remove(streamId): void
  clear(): void
}
```

### Collection Flow

```
Request: Need 20 posts
├─ Load queued posts (if any)
├─ Apply filter to queued posts
├─ If queue has >= limit posts: return immediately
├─ Otherwise: enter fetch loop (max 5 iterations)
│   ├─ Fetch from API
│   ├─ Apply filter
│   ├─ Deduplicate
│   └─ Continue until limit reached or end of stream
├─ Split results: first `limit` → return, remainder → queue
└─ Return { posts, cacheMissIds, cursor, timestamp }
```

### Safety Limits

- **MAX_FETCH_ITERATIONS = 5**: Prevents infinite loops when filters remove many posts
- Early exit when API returns fewer posts than requested (end of stream)

## Consequences

### Positive

- Minimizes API calls by reusing overflow posts
- Ensures continuous pagination without gaps or duplicates
- Supports dynamic filtering (mute lists can change between requests)
- Tracks cache misses for efficient post hydration

### Negative

- In-memory queue is lost on page refresh (must re-fetch)
- Queued posts may become stale if not refreshed, but TTL solves it eventually

### Neutral

- Requires filter functions to be idempotent and deterministic
- Queue entries are keyed by stream ID, allowing multiple concurrent streams
- Timestamp tracking enables cursor-based pagination fallback

## Alternatives Considered

### Server-side filtering

**Description**: Have the API filter posts before returning them.

**Pros**: Simpler client, accurate page sizes

**Cons**: Requires exposing mute lists to server, less responsive to filter changes

**Why not chosen**: Local-first architecture requires client-side filtering for immediate UI updates.

### Over-fetching with client discard

**Description**: Always fetch 2-3x the needed posts and discard extras.

**Pros**: Simpler implementation, no queue state

**Cons**: Wastes bandwidth, still has edge cases with heavy filtering

**Why not chosen**: Inefficient and doesn't solve the fundamental pagination boundary problem.

## Implementation Notes

- Main implementation: `src/core/application/stream/posts/muting/post-stream-queue.ts`
- Type definitions: `src/core/application/stream/posts/muting/post-stream-queue.types.ts`
- Tests: `src/core/application/stream/posts/muting/post-stream-queue.test.ts`
- Used in: `PostStreamApplication.getOrFetchStreamSlice()`

## Related Decisions

- [ADR-0003: Streams as Caches](./0003-streams-as-caches.md) — Queue operates on cached stream data
- [ADR-0014: Muting System](./0014-muting-system.md) — Primary use case for queue filtering
