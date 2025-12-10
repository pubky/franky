import * as Core from '@/core';
import { TQueueEntry } from './post.types';
import { CollectParams, CollectResult } from './post-stream-queue.types';

const MAX_FETCH_ITERATIONS = 5;

/**
 * Queue for storing overflow posts between pagination requests.
 * Handles fetching until we have enough posts after filtering.
 */
export class PostStreamQueue {
  private entries = new Map<Core.PostStreamId, TQueueEntry>();

  get(streamId: Core.PostStreamId): TQueueEntry | undefined {
    return this.entries.get(streamId);
  }

  private save(streamId: Core.PostStreamId, posts: string[], cursor: number): void {
    this.entries.set(streamId, { posts, cursor });
  }

  clear(): void {
    this.entries.clear();
  }

  /**
   * Collects enough posts to satisfy the limit, fetching more if needed.
   * Handles deduplication, filtering, and saves overflow back to queue.
   */
  async collect(streamId: Core.PostStreamId, params: CollectParams): Promise<CollectResult> {
    const { limit, filter, fetch } = params;

    // Load from queue and filter
    const savedQueue = this.entries.get(streamId);
    const posts = savedQueue ? filter(savedQueue.posts) : [];
    const seen = new Set(posts);
    let cursor = savedQueue?.cursor ?? params.cursor;

    // If queue has enough, return early
    if (posts.length >= limit) {
      return this.finalize(streamId, posts, limit, cursor, []);
    }

    // Fetch until we have enough
    const allCacheMissIds: string[] = [];
    let latestTimestamp: number | undefined;
    let fetchCount = 0;

    while (posts.length < limit && fetchCount < MAX_FETCH_ITERATIONS) {
      fetchCount++;

      const result = await fetch(cursor);

      // Filter and dedupe
      const filtered = filter(result.nextPageIds);
      for (const id of filtered) {
        if (!seen.has(id)) {
          seen.add(id);
          posts.push(id);
        }
      }

      allCacheMissIds.push(...result.cacheMissPostIds);

      if (result.timestamp !== undefined) {
        cursor = result.timestamp;
        latestTimestamp = result.timestamp;
      }

      // Stop if we've reached end of stream
      if (result.nextPageIds.length < limit) {
        break;
      }
    }

    return this.finalize(streamId, posts, limit, cursor, allCacheMissIds, latestTimestamp);
  }

  private finalize(
    streamId: Core.PostStreamId,
    posts: string[],
    limit: number,
    cursor: number,
    cacheMissIds: string[],
    timestamp?: number,
  ): CollectResult {
    const toReturn = posts.slice(0, limit);
    const toSave = posts.slice(limit);

    this.save(streamId, toSave, cursor);

    return {
      posts: toReturn,
      cacheMissIds: [...new Set(cacheMissIds)],
      cursor,
      timestamp,
    };
  }
}

export const postStreamQueue = new PostStreamQueue();
