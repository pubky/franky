import * as Core from '@/core';
import * as Config from '@/config';
import * as Libs from '@/libs';
import { postStreamQueue } from './muting/post-stream-queue';
import { MuteFilter } from './muting/mute-filter';

export class PostStreamApplication {
  private constructor() {}

  // ============================================================================
  // Public API
  // ============================================================================

  static async getUnreadStream({ streamId }: Core.TStreamIdParams): Promise<Core.TStreamResult | null> {
    return await Core.LocalStreamPostsService.readUnreadStream({ streamId });
  }

  static async getCachedLastPostTimestamp({ streamId }: Core.TStreamIdParams): Promise<number> {
    try {
      const postStream = await Core.LocalStreamPostsService.read({ streamId });
      if (!postStream || postStream.stream.length === 0) {
        Libs.Logger.warn('StreamId not found in cache', { streamId });
        return Core.NOT_FOUND_CACHED_STREAM;
      }

      // Iterate backwards through the stream to find the last post that has details
      // This handles cases where the last PostDetails might be missing
      for (let i = postStream.stream.length - 1; i >= 0; i--) {
        const postId = postStream.stream[i];
        const postDetails = await Core.LocalPostService.readDetails({ postId });

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

  /**
   * Gets the head of the stream
   * @param params - The parameters for the stream
   * @returns The postId of the head of the stream
   */
  static async getStreamHead(params: Core.TStreamIdParams): Promise<number> {
    return await Core.LocalStreamPostsService.getStreamHead(params);
  }

  /**
   * Get local stream data from cache
   * @param streamId - The ID of the stream
   * @returns The cached stream or null if not found
   */
  static async getLocalStream({ streamId }: Core.TStreamIdParams): Promise<Core.TStreamResult | null> {
    return await Core.LocalStreamPostsService.read({ streamId });
  }

  static async mergeUnreadStreamWithPostStream(params: Core.TStreamIdParams) {
    return await Core.LocalStreamPostsService.mergeUnreadStreamWithPostStream(params);
  }

  static async clearUnreadStream(params: Core.TStreamIdParams): Promise<string[]> {
    return await Core.LocalStreamPostsService.clearUnreadStream(params);
  }

  /**
   * Checks if the stream cache is stale (first post older than configured max age) and clears it if so.
   * Only clears the stream index, keeping posts and users in IndexedDB.
   *
   * @param streamId - The ID of the stream to check
   */
  static async clearStaleStreamCache({ streamId }: Core.TStreamIdParams): Promise<void> {
    const headTimestamp = await Core.LocalStreamPostsService.getStreamHead({ streamId });

    // Skip sentinel values: SKIP_FETCH_NEW_POSTS (0) when post not found, FORCE_FETCH_NEW_POSTS (1) when stream empty
    // Without this check, sentinel value 1 would calculate age ≈ Date.now() and trigger unnecessary deleteById
    if (headTimestamp === Core.SKIP_FETCH_NEW_POSTS || headTimestamp === Core.FORCE_FETCH_NEW_POSTS) {
      return;
    }

    const ageMs = Date.now() - headTimestamp;
    if (ageMs > Config.STREAM_CACHE_MAX_AGE_MS) {
      Libs.Logger.debug('[PostStreamApplication] Stream cache is stale, clearing', {
        streamId,
        headTimestamp,
        ageMs,
        maxAgeMs: Config.STREAM_CACHE_MAX_AGE_MS,
      });
      await Core.LocalStreamPostsService.deleteById({ streamId });
    }
  }

  /**
   * Fetches a page of posts for a stream, filtering out muted users.
   */
  static async getOrFetchStreamSlice({
    streamId,
    streamHead,
    streamTail,
    lastPostId,
    limit,
    viewerId,
    order,
  }: Core.TFetchStreamParams): Promise<Core.TPostStreamChunkResponse> {
    // Skip cache for ascending order (chronological) - always fetch from Nexus
    // This is because cache is stored in descending order
    // TODO: Might be a better way to handle this.
    if (order === Core.StreamOrder.ASCENDING) {
      return await this.fetchStreamFromNexus({ streamId, limit, streamTail, streamHead, viewerId, order });
    }

    // Fetch muted user IDs from Service layer at Application layer entry point
    const mutedStream = await Core.LocalStreamUsersService.findById(Core.UserStreamTypes.MUTED);
    const mutedUserIds = new Set(mutedStream?.stream ?? []);

    let isFirstFetch = true;
    const { posts, cacheMissIds, timestamp } = await postStreamQueue.collect(streamId, {
      limit,
      cursor: streamTail,
      filter: (posts) => MuteFilter.filterPosts(posts, mutedUserIds),
      fetch: async (cursor) => {
        // First fetch checks cache because we might be able to reuse leftover posts from previous fetch, subsequent fetches go directly to Nexus
        const result = isFirstFetch
          ? await this.fetchStreamSliceInternal({
              streamId,
              streamHead,
              streamTail: cursor,
              lastPostId,
              limit,
              viewerId,
              order,
            })
          : await this.fetchStreamFromNexus({
              streamId,
              limit,
              streamTail: cursor,
              streamHead: Core.SKIP_FETCH_NEW_POSTS,
              viewerId,
              order,
            });
        isFirstFetch = false;
        return result;
      },
    });

    return {
      nextPageIds: posts,
      cacheMissPostIds: cacheMissIds,
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
    order,
  }: Core.TFetchStreamParams): Promise<Core.TPostStreamChunkResponse> {
    // Avoid the indexdb query for engagement streams even we do not persist
    if (streamId.split(':')[0] !== Core.StreamSorting.ENGAGEMENT && !streamHead) {
      const cachedStream = await Core.LocalStreamPostsService.read({ streamId });

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
    return await this.fetchStreamFromNexus({ streamId, limit, streamTail, streamHead, viewerId, order });
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
      const postBatch = await Core.NexusPostStreamService.fetchByIds({
        post_ids: cacheMissPostIds,
        viewer_id: viewerId,
      });
      const { postAttachments } = await Core.LocalStreamPostsService.persistPosts({ posts: postBatch });
      // Persist the post attachments metadata
      await Core.FileApplication.fetchFiles(postAttachments);
      // Persist the missing authors of the posts
      await this.fetchMissingUsersFromNexus({ posts: postBatch, viewerId });
      // Fetch original posts for any reposts (to display embedded repost content)
      await this.fetchRepostedOriginalPosts({ posts: postBatch, viewerId });
    } catch (error) {
      Libs.Logger.warn('Failed to fetch missing posts from Nexus', { cacheMissPostIds, viewerId, error });
    }
  }

  /**
   * Fetch original posts that are referenced by reposts.
   * This ensures that when a repost is displayed, the embedded original post content is available.
   * @param posts - Array of posts that may contain reposts
   * @param viewerId - ID of the viewer
   */
  private static async fetchRepostedOriginalPosts({ posts, viewerId }: Core.TFetchMissingUsersParams) {
    // Collect all reposted URIs from the posts
    const repostedUris = posts.map((post) => post.relationships.reposted).filter((uri): uri is string => uri !== null);

    if (repostedUris.length === 0) return;

    // Convert URIs to composite IDs and deduplicate (multiple reposts may reference the same original)
    const originalPostIds = Array.from(
      new Set(
        repostedUris
          .map((uri) =>
            Core.buildCompositeIdFromPubkyUri({
              uri,
              domain: Core.CompositeIdDomain.POSTS,
            }),
          )
          .filter((id): id is string => id !== null),
      ),
    );

    if (originalPostIds.length === 0) return;

    // Filter out posts already in local DB
    const missingOriginalPostIds = await Core.LocalStreamPostsService.getNotPersistedPostsInCache(originalPostIds);

    if (missingOriginalPostIds.length === 0) return;

    Libs.Logger.debug('Fetching original posts for reposts', {
      repostCount: repostedUris.length,
      originalCount: originalPostIds.length,
      missingOriginalCount: missingOriginalPostIds.length,
    });

    // Fetch the missing original posts (non-recursive to avoid infinite loops)
    try {
      const originalPosts = await Core.NexusPostStreamService.fetchByIds({
        post_ids: missingOriginalPostIds,
        viewer_id: viewerId,
      });
      const { postAttachments } = await Core.LocalStreamPostsService.persistPosts({ posts: originalPosts });
      await Core.FileApplication.fetchFiles(postAttachments);
      await this.fetchMissingUsersFromNexus({ posts: originalPosts, viewerId });
    } catch (error) {
      Libs.Logger.warn('Failed to fetch original posts for reposts', { missingOriginalPostIds, error });
    }
  }

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
      await Core.LocalStreamUsersService.persistUsers(userBatch);
    }
  }

  private static async fetchStreamFromNexus({
    streamId,
    limit,
    streamHead,
    streamTail,
    viewerId,
    order,
  }: Core.TFetchStreamParams): Promise<Core.TPostStreamChunkResponse> {
    const { params, invokeEndpoint, extraParams } = Core.createPostStreamParams({
      streamId,
      streamTail,
      limit,
      streamHead,
      viewerId,
      order,
    });
    const postStreamChunk = await Core.NexusPostStreamService.fetch({ invokeEndpoint, params, extraParams });
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
        return Core.LocalUserService.upsertCounts({ userId: authorId }, countChanges as Core.NexusUserCounts);
      });
      await Promise.all(countUpdates);
    }
  }

  // Delegate to service for cache miss detection
  private static async getNotPersistedUsersInCache(userIds: Core.Pubky[]): Promise<Core.Pubky[]> {
    const existingUserIds = await Core.UserDetailsModel.findByIdsPreserveOrder(userIds);
    const missingUserIds = userIds.filter((_userId, index) => existingUserIds[index] === undefined);
    return Array.from(new Set(missingUserIds));
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
