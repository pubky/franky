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

  static async forceRefreshPostsByIds(params: { postIds: string[]; viewerId: Core.Pubky }): Promise<void> {
    const uniqueIds = Array.from(new Set(params.postIds));
    if (uniqueIds.length === 0) return;

    const { url, body } = Core.postStreamApi.postsByIds({
      post_ids: uniqueIds,
      viewer_id: params.viewerId,
    });

    const postBatch = await Core.queryNexus<Core.NexusPost[]>(url, 'POST', JSON.stringify(body));

    // TODO: That function has to update the TTL as well
    const { postAttachments } = await Core.LocalStreamPostsService.persistPosts({ posts: postBatch });
    await Core.FileApplication.fetchFiles(postAttachments);

    // Opportunistic cache warm: fetch missing authors (but do NOT update user TTL here).
    await this.fetchAndPersistMissingAuthors({ posts: postBatch, viewerId: params.viewerId });

    const now = Date.now();
    const refreshedPostIds = postBatch.map((post) =>
      Core.buildCompositeId({ pubky: post.details.author, id: post.details.id }),
    );

    if (refreshedPostIds.length === 0) return;

    const ttlRecords: Core.NexusModelTuple<{ lastUpdatedAt: number }>[] = refreshedPostIds.map((id) => [
      id,
      { lastUpdatedAt: now },
    ]);
    await Core.PostTtlModel.bulkSave(ttlRecords);
  }

  static async forceRefreshUsersByIds(params: { userIds: Core.Pubky[]; viewerId?: Core.Pubky }): Promise<void> {
    const uniqueIds = Array.from(new Set(params.userIds));
    if (uniqueIds.length === 0) return;

    const { url, body } = Core.userStreamApi.usersByIds({
      user_ids: uniqueIds,
      viewer_id: params.viewerId,
    });

    const userBatch = await Core.queryNexus<Core.NexusUser[]>(url, 'POST', JSON.stringify(body));
    // TODO: That function has to update the TTL as well
    await Core.LocalStreamUsersService.persistUsers(userBatch);

    const now = Date.now();
    const refreshedUserIds = userBatch.map((user) => user.details.id as Core.Pubky);
    if (refreshedUserIds.length === 0) return;

    const ttlRecords: Core.NexusModelTuple<{ lastUpdatedAt: number }>[] = refreshedUserIds.map((id) => [
      id,
      { lastUpdatedAt: now },
    ]);
    await Core.UserTtlModel.bulkSave(ttlRecords);
  }

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


