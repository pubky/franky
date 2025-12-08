import * as Core from '@/core';
import * as Libs from '@/libs';

export class PostStreamApplication {
  private constructor() {}

  // Maximum number of fetch iterations to prevent infinite loops in heavily-muted feeds
  private static readonly MAX_FETCH_ITERATIONS = 5;

  // ============================================================================
  // Public API
  // ============================================================================

  /**
   * Retrieves muted user IDs for a given viewer from the local muted stream.
   * Returns an empty Set if no muted users exist.
   */
  static async getMutedUserIds(viewerId: Core.Pubky): Promise<Set<Core.Pubky>> {
    const mutedStreamId = Core.buildUserCompositeId({
      userId: viewerId,
      reach: Core.UserStreamSource.MUTED,
    });
    const mutedStream = await Core.LocalStreamUsersService.findById(mutedStreamId);
    return new Set(mutedStream?.stream ?? []);
  }

  /**
   * Filters out posts from muted users.
   * Post IDs are in composite format: "authorPubky:postId"
   */
  static filterMutedPosts(postIds: string[], mutedUserIds: Set<Core.Pubky>): string[] {
    if (mutedUserIds.size === 0) {
      return postIds;
    }
    return postIds.filter((postId) => {
      const { pubky: authorId } = Core.parseCompositeId(postId);
      return !mutedUserIds.has(authorId);
    });
  }

  static async getCachedLastPostTimestamp({ streamId }: Core.TStreamIdParams): Promise<number> {
    try {
      const postStream = await Core.PostStreamModel.findById(streamId);
      if (!postStream || postStream.stream.length === 0) {
        Libs.Logger.warn('StreamId not found in cache', { streamId });
        return Core.NOT_FOUND_CACHED_STREAM;
      }

      // Iterate backwards through the stream to find the last post that has details
      // This handles cases where the last PostDetails might be missing
      for (let i = postStream.stream.length - 1; i >= 0; i--) {
        const postId = postStream.stream[i];
        const postDetails = await Core.PostDetailsModel.findById(postId);

        if (postDetails) {
          return postDetails.indexed_at;
        }
      }

      // No posts in the stream have details, cache is not useful
      Libs.Logger.warn('No post details found in cached stream', { streamId, streamLength: postStream.stream.length });
      return Core.NOT_FOUND_CACHED_STREAM;
    } catch (error) {
      Libs.Logger.warn('Failed to get timeline initial cursor', { streamId, error });
      return Core.NOT_FOUND_CACHED_STREAM;
    }
  }

  static async getStreamHead(params: Core.TStreamIdParams): Promise<number> {
    return await Core.LocalStreamPostsService.getStreamHead(params);
  }

  static async mergeUnreadStreamWithPostStream(params: Core.TStreamIdParams): Promise<void> {
    return await Core.LocalStreamPostsService.mergeUnreadStreamWithPostStream(params);
  }

  static async clearUnreadStream(params: Core.TStreamIdParams): Promise<string[]> {
    return await Core.LocalStreamPostsService.clearUnreadStream(params);
  }

  /**
   * Fetches a page of posts for a stream, filtering out muted users.
   *
   * Uses a queue to handle the mismatch between what Nexus returns and what we need:
   * - Nexus doesn't know about mutes, so it returns posts from everyone
   * - We filter out muted users' posts, which may leave us with fewer than `limit`
   * - Extra posts are saved in a queue for the next page request
   */
  static async getOrFetchStreamSlice({
    streamId,
    streamHead,
    streamTail,
    lastPostId,
    limit,
    viewerId,
  }: Core.TFetchStreamParams): Promise<Core.TPostStreamChunkResponse> {
    const mutedUserIds = await this.getMutedUserIds(viewerId);

    // Load any queued posts from previous request that weren't returned in previous batch.
    const savedQueue = await Core.PostStreamQueueModel.findById(streamId);
    const queue = savedQueue ? this.filterMutedPosts(savedQueue.queue, mutedUserIds) : [];
    const queuedIds = new Set(queue);
    let cursor = savedQueue?.streamTail ?? streamTail;

    // If queue already has enough posts, just return from queue
    if (queue.length >= limit) {
      return this.returnPostsAndSaveRemainingToQueue(streamId, queue, limit, cursor, []);
    }

    // Otherwise we need to fetch more posts, keep fetching until we have enough
    const allCacheMissIds: string[] = [];
    let latestTimestamp: number | undefined;
    let fetchCount = 0;
    let isFirstFetch = true;

    while (queue.length < limit && fetchCount < this.MAX_FETCH_ITERATIONS) {
      fetchCount++;

      // First fetch checks cache, subsequent fetches go directly to Nexus
      const result = isFirstFetch
        ? await this.fetchStreamSliceInternal({ streamId, streamHead, streamTail: cursor, lastPostId, limit, viewerId })
        : await this.fetchStreamFromNexus({
            streamId,
            limit,
            streamTail: cursor,
            streamHead: Core.SKIP_FETCH_NEW_POSTS,
            viewerId,
          });

      isFirstFetch = false;

      // Filter out muted users and duplicates, add to queue
      const filtered = this.filterMutedPosts(result.nextPageIds, mutedUserIds);
      for (const id of filtered) {
        if (!queuedIds.has(id)) {
          queuedIds.add(id);
          queue.push(id);
        }
      }

      allCacheMissIds.push(...result.cacheMissPostIds);

      if (result.timestamp !== undefined) {
        cursor = result.timestamp;
        latestTimestamp = result.timestamp;
      }

      // Stop if Nexus returned fewer posts than requested (we reached end of stream)
      if (result.nextPageIds.length < limit) {
        break;
      }
    }

    return this.returnPostsAndSaveRemainingToQueue(streamId, queue, limit, cursor, allCacheMissIds, latestTimestamp);
  }

  /**
   * Returns a page of posts from queue, saves remaining posts for next request.
   */
  private static async returnPostsAndSaveRemainingToQueue(
    streamId: Core.PostStreamId,
    queue: string[],
    limit: number,
    cursor: number,
    cacheMissIds: string[],
    timestamp?: number,
  ): Promise<Core.TPostStreamChunkResponse> {
    // Get the posts we need to return to UI.
    const postsToReturn = queue.slice(0, limit);

    // Save the remaining posts we fetched into the queue, so we can use later.
    const remainingPosts = queue.slice(limit);
    await Core.PostStreamQueueModel.upsert({ id: streamId, queue: remainingPosts, streamTail: cursor });

    return {
      nextPageIds: postsToReturn,
      cacheMissPostIds: [...new Set(cacheMissIds)],
      timestamp,
    };
  }

  // ============================================================================
  // Internal Helpers
  // ============================================================================

  /**
   * Internal method that performs the actual fetch without mute filtering.
   * This is the original getOrFetchStreamSlice logic, now used as a building block.
   */
  private static async fetchStreamSliceInternal({
    streamId,
    streamHead,
    streamTail,
    lastPostId,
    limit,
    viewerId,
  }: Core.TFetchStreamParams): Promise<Core.TPostStreamChunkResponse> {
    // Avoid the indexdb query for engagement streams even we do not persist
    if (streamId.split(':')[0] !== Core.StreamSorting.ENGAGEMENT && !streamHead) {
      const cachedStream = await Core.LocalStreamPostsService.findById({ streamId });

      if (cachedStream) {
        const cachedStreamChunk = await this.getStreamFromCache({ lastPostId, limit, cachedStream });

        // Full cache hit, return immediately
        if (cachedStreamChunk.length === limit) {
          return { nextPageIds: cachedStreamChunk, cacheMissPostIds: [], timestamp: undefined };
        }

        // Partial cache hit, fetch missing posts from Nexus and combine
        if (cachedStreamChunk.length > 0 && cachedStreamChunk.length < limit) {
          return await this.partialCacheHit({ cachedStreamChunk, limit, streamTail, streamId, viewerId });
        }
      }

      // Defensive check: If this is an initial load (no lastPostId) and cache doesn't exist or is empty,
      // force fetching from the beginning by setting streamTail to 0.
      // This ensures correctness even if a non-zero streamTail was incorrectly passed for an initial load.
      if (!lastPostId && (!cachedStream || cachedStream.stream.length === 0)) {
        streamTail = Core.NOT_FOUND_CACHED_STREAM;
      }
    }
    return await this.fetchStreamFromNexus({ streamId, limit, streamTail, streamHead, viewerId });
  }

  /**
   * Fetch missing posts from nexus and persist them to cache
   * @param cacheMissPostIds - Array of post IDs that are not persisted in cache
   * @param viewerId - ID of the viewer
   * @param streamHead - Detects if the call is coming from the streamCoordinator.
   * @param streamId - ID of the stream. If not provided, it means that it is a single post operation.
   */
  static async fetchMissingPostsFromNexus({ cacheMissPostIds, viewerId }: Core.TMissingPostsParams) {
    try {
      const { url, body } = Core.postStreamApi.postsByIds({ post_ids: cacheMissPostIds, viewer_id: viewerId });
      const postBatch = await Core.queryNexus<Core.NexusPost[]>(url, 'POST', JSON.stringify(body));
      if (postBatch) {
        const { postAttachments } = await Core.LocalStreamPostsService.persistPosts({ posts: postBatch });
        // Persist the post attachments metadata
        await Core.FileApplication.persistFiles(postAttachments);
        // Persist the missing authors of the posts
        await this.fetchMissingUsersFromNexus({ posts: postBatch, viewerId });
      }
    } catch (error) {
      Libs.Logger.warn('Failed to fetch missing posts from Nexus', { cacheMissPostIds, viewerId, error });
    }
  }

  // ============================================================================
  // Internal Helpers
  // ============================================================================

  /**
   * Handles partial cache hits by fetching remaining posts from Nexus and combining with cached posts.
   *
   * @param cachedStreamChunk - Array of post IDs from cache that need to be combined with fetched posts
   * @param limit - Maximum number of posts to return
   * @param streamTail - Timestamp or skip count for pagination
   * @param streamId - ID of the post stream
   * @param viewerId - ID of the viewer
   **/
  private static async partialCacheHit({
    cachedStreamChunk,
    limit,
    streamTail,
    streamId,
    viewerId,
  }: Core.TPartialCacheHitParams): Promise<Core.TPostStreamChunkResponse> {
    const lastCachedPostId = cachedStreamChunk[cachedStreamChunk.length - 1];
    const remainingLimit = limit - cachedStreamChunk.length;

    // Get timestamp from last cached post for pagination
    let nextStreamTail = streamTail;
    try {
      const lastPostDetails = await Core.PostDetailsModel.findById(lastCachedPostId);
      if (lastPostDetails) {
        nextStreamTail = lastPostDetails.indexed_at;
      }
    } catch (error) {
      Libs.Logger.warn('Failed to get timestamp from last cached post', { lastCachedPostId, error });
    }

    // Fetch remaining posts from Nexus
    const { nextPageIds, cacheMissPostIds, timestamp } = await this.fetchStreamFromNexus({
      streamId,
      limit: remainingLimit,
      streamTail: nextStreamTail,
      streamHead: Core.SKIP_FETCH_NEW_POSTS,
      viewerId,
      lastPostId: lastCachedPostId,
    });

    // Combine cached posts with fetched posts, deduplicating
    const uniquePostIds = Array.from(new Set([...cachedStreamChunk, ...nextPageIds]));

    return {
      nextPageIds: uniquePostIds,
      cacheMissPostIds,
      timestamp,
    };
  }

  private static async fetchMissingUsersFromNexus({ posts, viewerId }: Core.TFetchMissingUsersParams) {
    const cacheMissUserIds = await this.getNotPersistedUsersInCache(posts.map((post) => post.details.author));
    if (cacheMissUserIds.length > 0) {
      const { url: userUrl, body: userBody } = Core.userStreamApi.usersByIds({
        user_ids: cacheMissUserIds,
        viewer_id: viewerId,
      });
      const userBatch = await Core.queryNexus<Core.NexusUser[]>(userUrl, 'POST', JSON.stringify(userBody));
      if (userBatch) {
        await Core.LocalStreamUsersService.persistUsers(userBatch);
      }
    }
  }

  private static async fetchStreamFromNexus({
    streamId,
    limit,
    streamHead,
    streamTail,
    viewerId,
  }: Core.TFetchStreamParams): Promise<Core.TPostStreamChunkResponse> {
    const { params, invokeEndpoint, extraParams } = Core.createPostStreamParams({
      streamId,
      streamTail,
      limit,
      streamHead,
      viewerId,
    });
    const postStreamChunk = await Core.NexusPostStreamService.fetch({ invokeEndpoint, params, extraParams });

    if (!postStreamChunk) {
      return { nextPageIds: [], cacheMissPostIds: [], timestamp: undefined };
    }

    const { last_post_score: timestamp, post_keys: compositePostIds } = postStreamChunk;

    // Do not persist any stream related with engagement sorting
    if (streamId.split(':')[0] !== Core.StreamSorting.ENGAGEMENT && streamHead === Core.SKIP_FETCH_NEW_POSTS) {
      await Core.LocalStreamPostsService.persistNewStreamChunk({ stream: compositePostIds, streamId });
    }

    // When streamHead is greater than 0, it means that it is a streamCoordinator calling this method.
    // In the future, we might need to add some enum param to describe that type of call.
    // For now, that kind of queries comes from the streamCoordinator.
    if (streamHead > Core.SKIP_FETCH_NEW_POSTS) {
      await this.persistUnreadStreamChunkAndUpdateCounts({
        streamId,
        compositePostIds,
      });
    }

    const cacheMissPostIds = await this.getNotPersistedPostsInCache(compositePostIds);

    return { nextPageIds: compositePostIds, cacheMissPostIds, timestamp };
  }

  // Delegate to service for cache miss detection
  private static async getNotPersistedPostsInCache(postIds: string[]): Promise<string[]> {
    return Core.LocalStreamPostsService.getNotPersistedPostsInCache(postIds);
  }

  /**
   * Persist the unread stream chunk and update the counts of the posts and users
   * @param streamId - The ID of the stream
   * @param compositePostIds - The new posts IDs that are going to be persisted in the unreadstream
   */
  private static async persistUnreadStreamChunkAndUpdateCounts({
    streamId,
    compositePostIds,
  }: Core.TPersistUnreadNewStreamChunkParams) {
    await Core.LocalStreamPostsService.persistUnreadNewStreamChunk({ stream: compositePostIds, streamId });
    // The authorId and postId are going to be use to identify the replies parent id
    const [replyParentAuthorId, invokeEndpoint, replyParentPostId] = Core.breakDownStreamId(streamId);

    // If it is a reply, we need to update the parent post counts
    // TODO: Might happen some edge cases but for now, we can go with this approach.
    if (invokeEndpoint === Core.StreamSource.REPLIES) {
      const replyParentPostCompositeId = Core.buildCompositeId({
        pubky: replyParentAuthorId,
        id: replyParentPostId as string,
      });
      await Core.LocalPostService.updatePostCounts({
        postCompositeId: replyParentPostCompositeId,
        countChanges: { replies: compositePostIds.length },
      });
    }

    // Update the related user counts of the authors of the posts
    // Batch count updates to avoid race conditions and improve performance
    if (invokeEndpoint === Core.StreamSource.REPLIES || invokeEndpoint === Core.StreamSource.ALL) {
      const countUpdates = compositePostIds.map(async (postId) => {
        const { pubky: authorId } = Core.parseCompositeId(postId);
        // TODO: Comming refactor to use the correct type. New PR
        const countChanges: Partial<Core.NexusUserCounts> = { posts: 1 };
        if (invokeEndpoint === Core.StreamSource.REPLIES) {
          countChanges.replies = 1;
        }
        return Core.LocalProfileService.upsertCounts({ userId: authorId }, countChanges as Core.NexusUserCounts);
      });
      await Promise.all(countUpdates);
    }
  }

  // Delegate to service for cache miss detection
  private static async getNotPersistedUsersInCache(userIds: Core.Pubky[]): Promise<Core.Pubky[]> {
    return Core.LocalStreamUsersService.getNotPersistedUsersInCache(userIds);
  }

  private static async getStreamFromCache({
    lastPostId,
    limit,
    cachedStream,
  }: Core.TCacheStreamParams): Promise<string[]> {
    // Handle limit 0 case, return empty array immediately
    if (limit === 0) {
      return [];
    }

    // If the lastPostId is not provided, it means that we are in the head of the stream
    if (!lastPostId) {
      // Return all available posts from cache (up to limit)
      // If cache has fewer posts than limit, return what's available
      return cachedStream.stream.slice(0, Math.min(limit, cachedStream.stream.length));
    }

    // lastPostId is provided, find the position in cache
    const postIndex = cachedStream.stream.indexOf(lastPostId);
    if (postIndex === -1) {
      // lastPostId not found in cache, cannot serve from cache
      return [];
    }

    // Return all available posts after lastPostId (up to limit)
    // If cache has fewer posts than requested, return what's available
    const startIndex = postIndex + 1;
    const endIndex = Math.min(startIndex + limit, cachedStream.stream.length);

    if (startIndex >= cachedStream.stream.length) {
      // No posts after lastPostId in cache
      return [];
    }

    return cachedStream.stream.slice(startIndex, endIndex);
  }
}
