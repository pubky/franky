import * as Core from '@/core';
import * as Libs from '@/libs';

export class PostStreamApplication {
  private constructor() {}

  // ============================================================================
  // Public API
  // ============================================================================
  
  static async getCachedLastPostTimestamp(
    streamId: Core.PostStreamId,
  ): Promise<number> {
    try {
      const postStream = await Core.PostStreamModel.findById(streamId);
      if (!postStream || postStream.stream.length === 0) {
        return 0;
      }

      const lastPostId = postStream.stream[postStream.stream.length - 1];
      const postDetails = await Core.PostDetailsModel.findById(lastPostId);

      if (!postDetails) {
        Libs.Logger.warn('Post details not found for last post in stream', { streamId, lastPostId });
        return 0;
      }

      return postDetails.indexed_at;
    } catch (error) {
      Libs.Logger.warn('Failed to get timeline initial cursor', { streamId, error });
      return 0;
    }
  }

  static async getOrFetchStreamSlice({
    streamId,
    streamTail,
    lastPostId,
    limit,
    viewerId,
  }: Core.TFetchStreamParams): Promise<Core.TPostStreamChunkResponse> {
    // Avoid the indexdb query for engagement streams even we do not persist
    if (streamId.split(':')[0] !== Core.StreamSorting.ENGAGEMENT) {
      const cachedStream = await Core.LocalStreamPostsService.findById(streamId);

      if (cachedStream) {
        const streamChunk = await this.getStreamFromCache({ lastPostId, limit, cachedStream });
        if (streamChunk.length > 0) {
          return { nextPageIds: streamChunk, cacheMissPostIds: [], timestamp: undefined };
        }
      }

      // If this is an initial load (no lastPostId) and cache doesn't exist or is empty,
      // force fetching from the beginning by setting streamTail to 0
      if (!lastPostId && (!cachedStream || cachedStream.stream.length === 0)) {
        streamTail = 0;
      }
    }
    return await this.fetchStreamFromNexus({ streamId, limit, streamTail, viewerId });
  }

  static async fetchMissingPostsFromNexus({ cacheMissPostIds, viewerId }: Core.TMissingPostsParams) {
    try {
      const { url, body } = Core.postStreamApi.postsByIds({ post_ids: cacheMissPostIds, viewer_id: viewerId });
      const postBatch = await Core.queryNexus<Core.NexusPost[]>(url, 'POST', JSON.stringify(body));
      if (postBatch) {
        const { postAttachments } = await Core.LocalStreamPostsService.persistPosts(postBatch);
        // Persist the post attachments metadata
        await Core.persistFilesFromUris(postAttachments);
        // Persist the missing authors of the posts
        await this.fetchMissingUsersFromNexus({ posts: postBatch, viewerId });
      }
    } catch (error) {
      Libs.Logger.warn('Failed to fetch missing posts from Nexus', { cacheMissPostIds, viewerId, error });
    }
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

  // ============================================================================
  // Internal Helpers
  // ============================================================================

  private static async fetchStreamFromNexus({
    streamId,
    limit,
    streamTail,
    viewerId,
  }: Core.TFetchStreamParams): Promise<Core.TPostStreamChunkResponse> {
    const { params, invokeEndpoint, extraParams } = Core.createPostStreamParams(streamId, streamTail, limit, viewerId);
    const postStreamChunk = await Core.NexusPostStreamService.fetch({ invokeEndpoint, params, extraParams });

    // TODO: Could be the case that we reach the end of the stream. How are we going to handle that?
    if (!postStreamChunk) {
      return { nextPageIds: [], cacheMissPostIds: [], timestamp: undefined };
    }

    const { last_post_score: timestamp, post_keys: compositePostIds } = postStreamChunk;

    // Do not persist any stream related with engagement sorting
    if (streamId.split(':')[0] !== Core.StreamSorting.ENGAGEMENT) {
      await Core.LocalStreamPostsService.persistNewStreamChunk({ stream: compositePostIds, streamId });
    }
    const cacheMissPostIds = await this.getNotPersistedPostsInCache(compositePostIds);

    return { nextPageIds: compositePostIds, cacheMissPostIds, timestamp };
  }

  // Return the posts that are not persisted in cache
  private static async getNotPersistedPostsInCache(postIds: string[]): Promise<string[]> {
    const existingPostIds = await Core.PostDetailsModel.findByIdsPreserveOrder(postIds);
    return postIds.filter((_postId, index) => existingPostIds[index] === undefined);
  }

  private static async getNotPersistedUsersInCache(userIds: Core.Pubky[]): Promise<Core.Pubky[]> {
    const existingUserIds = await Core.UserDetailsModel.findByIdsPreserveOrder(userIds);
    return userIds.filter((_userId, index) => existingUserIds[index] === undefined);
  }

  private static async getStreamFromCache({
    lastPostId,
    limit,
    cachedStream,
  }: Core.TCacheStreamParams): Promise<string[]> {
    // TODO: Could be a case that it does not have sufficient posts, in which case we need to fetch more from Nexus
    // e.g. in the cache there is only limit - 5 posts and the missing ones we have to download
    // From now, if cache exists and has posts, return from cache
    // Handle limit 0 case: return empty array immediately without fetching from Nexus
    if (limit === 0) {
      return [];
    }

    let postIds: string[] | null = null;

    // If the lastPostId is not provided, it means that we are in the head of the stream
    if (!lastPostId && cachedStream.stream.length >= limit) {
      postIds = cachedStream.stream.slice(0, limit);
    } else if (lastPostId) {
      const postIndex = cachedStream.stream.indexOf(lastPostId);
      if (postIndex === -1) {
        return [];
      }

      if (postIndex + 1 + limit <= cachedStream.stream.length) {
        postIds = cachedStream.stream.slice(postIndex + 1, postIndex + 1 + limit);
      } else {
        return [];
      }
    }

    if (!postIds || postIds.length === 0) {
      return [];
    }

    return postIds;
  }
}
