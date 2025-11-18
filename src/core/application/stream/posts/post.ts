import * as Core from '@/core';
import * as Libs from '@/libs';

export class PostStreamApplication {
  private constructor() {}

  // ============================================================================
  // Public API
  // ============================================================================

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
        const cacheResult = await this.getStreamFromCache({ lastPostId, limit, cachedStream });

        if (cacheResult) {
          return { nextPageIds: cacheResult.postIds, cacheMissPostIds: [], timestamp: cacheResult.timestamp };
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
        await Core.FileApplication.persistFiles(postAttachments);
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

  // TODO: Delete fn because the below reason
  private static async getTimestampFromPostId(postId: string): Promise<number | undefined> {
    try {
      const postDetails = await Core.PostDetailsModel.findById(postId);
      return postDetails?.indexed_at;
    } catch (error) {
      Libs.Logger.warn('Failed to get timestamp from post ID', { postId, error });
      return undefined;
    }
  }

  private static async fetchStreamFromNexus({
    streamId,
    limit,
    streamTail,
    viewerId,
    // TODO: Temporal fix. It has to be deleted. we have to get the timestamp from the UI
    // lastPostId,
  }: Core.TFetchStreamParams): Promise<Core.TPostStreamChunkResponse> {
    // TODO: DELETE FROM
    // const streamTailUndefined = lastPostId ? await this.getTimestampFromPostId(lastPostId) : streamTail;
    // if (!streamTailUndefined) {
    //   // throw new Error('Stream tail is required');
    //   return { nextPageIds: [], cacheMissPostIds: [], timestamp: undefined };
    // }
    // streamTail = streamTailUndefined;
    // TODO: DELETE FINISH

    // START of the fn
    const { params, invokeEndpoint, extraParams } = Core.createPostStreamParams(streamId, streamTail, limit, viewerId);
    // TODO: With the new endpoint, we have to adapt the next line and delete timestamp and composidePostIds
    const nexusPosts = await Core.NexusPostStreamService.fetch({ invokeEndpoint, params, extraParams });

    // Handle empty response
    if (nexusPosts.length === 0) {
      return { nextPageIds: [], cacheMissPostIds: [], timestamp: undefined };
    }

    const timestamp = nexusPosts[nexusPosts.length - 1].details.indexed_at;
    const compositePostIds = nexusPosts.map((post) =>
      Core.buildCompositeId({ pubky: post.details.author, id: post.details.id }),
    );

    // Do not persist any stream related with engagement sorting
    if (streamId.split(':')[0] !== Core.StreamSorting.ENGAGEMENT) {
      await Core.LocalStreamPostsService.persistNewStreamChunk({ stream: compositePostIds, streamId });
    }
    const cacheMissPostIds = await this.getNotPersistedPostsInCache(compositePostIds);
    // TODO: the timestamp we will get from
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
  }: Core.TCacheStreamParams): Promise<{ postIds: string[]; timestamp: number | undefined } | null> {
    // TODO: Could be a case that it does not have sufficient posts, in which case we need to fetch more from Nexus
    // e.g. in the cache there is only limit - 5 posts and the missing ones we have to download
    // From now, if cache exists and has posts, return from cache

    // Handle limit 0 case: return empty array immediately without fetching from Nexus
    if (limit === 0) {
      return { postIds: [], timestamp: undefined };
    }

    let postIds: string[] | null = null;

    if (!lastPostId && cachedStream.stream.length >= limit) {
      postIds = cachedStream.stream.slice(0, limit);
    } else if (lastPostId) {
      const postIndex = cachedStream.stream.indexOf(lastPostId);

      if (postIndex === -1) {
        return null;
      }

      if (postIndex + 1 + limit <= cachedStream.stream.length) {
        postIds = cachedStream.stream.slice(postIndex + 1, postIndex + 1 + limit);
      } else {
        return null;
      }
    }

    if (!postIds || postIds.length === 0) {
      return null;
    }

    // Get timestamp from the last post in the slice for pagination
    const lastPostInSlice = postIds[postIds.length - 1];
    const timestamp = await this.getTimestampFromPostId(lastPostInSlice);

    return { postIds, timestamp };
  }
}
