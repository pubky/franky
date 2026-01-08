import * as Core from '@/core';
import { Logger } from '@/libs';

export class TtlApplication {
  private constructor() {}

  static async findStalePostsByIds(params: { postIds: string[]; ttlMs: number }): Promise<string[]> {
    const uniqueIds = Array.from(new Set(params.postIds));
    if (uniqueIds.length === 0) return [];

    try {
      const ttlRecords = await Core.PostTtlModel.findByIds(uniqueIds);
      const ttlMap = new Map<string, number>(ttlRecords.map((r) => [r.id, r.lastUpdatedAt]));
      const now = Date.now();

      return uniqueIds.filter((id) => {
        const lastUpdatedAt = ttlMap.get(id);
        return lastUpdatedAt === undefined || now - lastUpdatedAt > params.ttlMs;
      });
    } catch (error) {
      Logger.warn('TtlApplication: Failed to check post TTL records', { error });
      throw error;
    }
  }

  static async findStaleUsersByIds(params: { userIds: Core.Pubky[]; ttlMs: number }): Promise<Core.Pubky[]> {
    const uniqueIds = Array.from(new Set(params.userIds));
    if (uniqueIds.length === 0) return [];

    try {
      const ttlRecords = await Core.UserTtlModel.findByIds(uniqueIds);
      const ttlMap = new Map<Core.Pubky, number>(ttlRecords.map((r) => [r.id, r.lastUpdatedAt]));
      const now = Date.now();

      return uniqueIds.filter((id) => {
        const lastUpdatedAt = ttlMap.get(id);
        return lastUpdatedAt === undefined || now - lastUpdatedAt > params.ttlMs;
      });
    } catch (error) {
      Logger.warn('TtlApplication: Failed to check user TTL records', { error });
      throw error;
    }
  }

  /**
   * Force refresh posts by fetching fresh data from Nexus.
   */
  static async forceRefreshPostsByIds(params: { postIds: string[]; viewerId: Core.Pubky }): Promise<void> {
    const uniqueIds = Array.from(new Set(params.postIds));
    if (uniqueIds.length === 0) return;

    const { url, body } = Core.postStreamApi.postsByIds({
      post_ids: uniqueIds,
      viewer_id: params.viewerId,
    });

    const postBatch = await Core.queryNexus<Core.NexusPost[]>(url, 'POST', JSON.stringify(body));

    // Debug: Log the response to see if tags are included
    Logger.debug('TtlApplication: Fetched posts from Nexus', {
      postCount: postBatch.length,
      postsWithTags: postBatch.map((p) => ({
        id: `${p.details.author}:${p.details.id}`,
        tagsCount: p.tags?.length ?? 0,
        tags: p.tags?.map((t) => t.label) ?? [],
      })),
    });

    const { postAttachments } = await Core.LocalStreamPostsService.persistPosts({ posts: postBatch });
    await Core.FileApplication.fetchFiles(postAttachments);

    // Opportunistic cache warm: fetch missing authors
    await this.fetchAndPersistMissingAuthors({ posts: postBatch, viewerId: params.viewerId });
  }

  /**
   * Force refresh users by fetching fresh data from Nexus.
   */
  static async forceRefreshUsersByIds(params: { userIds: Core.Pubky[]; viewerId?: Core.Pubky }): Promise<void> {
    const uniqueIds = Array.from(new Set(params.userIds));
    if (uniqueIds.length === 0) return;

    const { url, body } = Core.userStreamApi.usersByIds({
      user_ids: uniqueIds,
      viewer_id: params.viewerId,
    });

    const userBatch = await Core.queryNexus<Core.NexusUser[]>(url, 'POST', JSON.stringify(body));

    await Core.LocalStreamUsersService.persistUsers(userBatch);
  }

  /**
   * Fetch and persist missing post authors for cache warming.
   */
  private static async fetchAndPersistMissingAuthors(params: {
    posts: Core.NexusPost[];
    viewerId: Core.Pubky;
  }): Promise<void> {
    const authors = Array.from(new Set(params.posts.map((post) => post.details.author)));
    if (authors.length === 0) return;

    const cacheMissUserIds = await Core.LocalStreamUsersService.getNotPersistedUsersInCache(authors);
    if (cacheMissUserIds.length === 0) return;

    const { url, body } = Core.userStreamApi.usersByIds({
      user_ids: cacheMissUserIds,
      viewer_id: params.viewerId,
    });

    const userBatch = await Core.queryNexus<Core.NexusUser[]>(url, 'POST', JSON.stringify(body));
    await Core.LocalStreamUsersService.persistUsers(userBatch);
  }
}
