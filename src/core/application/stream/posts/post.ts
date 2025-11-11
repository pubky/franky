import * as Core from '@/core';
import * as Libs from '@/libs';

export class PostStreamApplication {
  private constructor() { }

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
    // Avoid the indexdb query for engagement streams
    if (streamId.split(':')[0] === Core.StreamSorting.TIMELINE) {
      const cachedStream = await Core.LocalStreamPostsService.findById(streamId);
      if (cachedStream) {
        const nextPageIds = this.getStreamFromCache({ lastPostId, limit, cachedStream });
        if (nextPageIds) {
          // Returning undefined the organisms knows that that stream chunk comes from cache
          return { nextPageIds, cacheMissPostIds: [], timestamp: undefined };
        }
      }
    }
    return await this.fetchStreamFromNexus({ streamId, limit, streamTail, viewerId, lastPostId });
  }

  static async fetchMissingPostsFromNexus({ cacheMissPostIds, viewerId }: Core.TMissingPostsParams) {
    const { url, body } = Core.postStreamApi.postsByIds({ post_ids: cacheMissPostIds, viewer_id: viewerId });
    const postBatch = await Core.queryNexus<Core.NexusPost[]>(url, 'POST', JSON.stringify(body));
    if (postBatch) {
      await Core.LocalStreamPostsService.persistPosts(postBatch);
      const cacheMissUserIds = postBatch
        ? await this.getNotPersistedUsersInCache(postBatch.map((post) => post.details.author))
        : [];
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
    lastPostId,
  }: Core.TFetchStreamParams): Promise<Core.TPostStreamChunkResponse> {
    // TODO: DELETE FROM
    const streamTailUndefined = lastPostId ? await this.getTimestampFromPostId(lastPostId) : streamTail;
    if (!streamTailUndefined) {
      throw new Error('Stream tail is required');
    }
    streamTail = streamTailUndefined;
    // TODO: DELETE FINISH

    // START of the fn
    const { params, invokeEndpoint } = Core.createNexusParams(streamId, streamTail, limit, viewerId);
    // TODO: With the new endpoint, we have to adapt the next line and delete timestamp and composidePostIds
    const nexusPosts = await Core.NexusPostStreamService.fetch({ invokeEndpoint, params });

    // Handle empty response
    if (nexusPosts.length === 0) {
      return { nextPageIds: [], cacheMissPostIds: [], timestamp: undefined };
    }

    const timestamp = nexusPosts[nexusPosts.length - 1].details.indexed_at;
    const compositePostIds = nexusPosts.map((post) =>
      Core.buildPostCompositeId({ pubky: post.details.author, postId: post.details.id }),
    );
    // TODO: Delete the addPost
    await Core.LocalStreamPostsService.persistNewStreamChunk({ stream: compositePostIds, streamId });
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

  private static getStreamFromCache({ lastPostId, limit, cachedStream }: Core.TCacheStreamParams): string[] | null {
    // TODO: Could be a case that it does not have sufficient posts, in which case we need to fetch more from Nexus
    // e.g. in the cache there is only limit - 5 posts and the missing ones we have to download
    // From now, if cache exists and has posts, return from cache
    if (!lastPostId && cachedStream.stream.length >= limit) {
      return cachedStream.stream.slice(0, limit);
    }
    const postIndex = lastPostId ? cachedStream.stream.indexOf(lastPostId) : -1;
    if (postIndex !== -1 && postIndex + 1 + limit <= cachedStream.stream.length) {
      return cachedStream.stream.slice(postIndex + 1, postIndex + 1 + limit);
    }
    return null;
  }
}
