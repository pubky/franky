import * as Core from '@/core';
import * as Config from '@/config';
import * as Libs from '@/libs';

export class PostStreamApplication {
  private constructor() {}

  // ============================================================================
  // Public API
  // ============================================================================

  static async getOrFetchStreamSlice({
    streamId,
    limit = Config.NEXUS_POSTS_PER_PAGE,
    post_id,
    timestamp,
  }: Core.TReadPostStreamChunkParams): Promise<Core.TPostStreamChunkResponse> {
    const cachedStream = await Core.LocalStreamPostsService.findById(streamId);
    if (cachedStream) {
      const nextPageIds = this.getStreamFromCache({ postId: post_id, limit, cachedStream });
      if (nextPageIds) {
        // Returning undefined the organisms knows that that stream chunk comes from cache
        return { nextPageIds, cacheMissPostIds: [], timestamp: undefined };
      }
    }
    return await this.fetchStreamFromNexus({ streamId, limit, post_id, timestamp });
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
    post_id /*, timestamp*/,
  }: Core.TReadPostStreamChunkParams): Promise<Core.TPostStreamChunkResponse> {
    const start = post_id ? await this.getTimestampFromPostId(post_id) : undefined;
    // TODO: With the new endpoint, we have to adapt the next line and delete timestamp and composidePostIds
    const nexusPosts = await Core.NexusPostStreamService.fetch({ streamId, params: { limit, start } });

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

  private static getStreamFromCache({ postId, limit, cachedStream }: Core.TCacheStreamParams): string[] | null {
    // TODO: Could be a case that it does not have sufficient posts, in which case we need to fetch more from Nexus
    // e.g. in the cache there is only limit - 5 posts and the missing ones we have to download
    // From now, if cache exists and has posts, return from cache
    if (!postId && cachedStream.stream.length >= limit) {
      return cachedStream.stream.slice(0, limit);
    }
    const postIndex = postId ? cachedStream.stream.indexOf(postId) : -1;
    if (postIndex !== -1 && postIndex + 1 + limit <= cachedStream.stream.length) {
      return cachedStream.stream.slice(postIndex + 1, postIndex + 1 + limit);
    }
    return null;
  }
}
