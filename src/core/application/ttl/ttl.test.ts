import { describe, expect, it, vi, beforeEach } from 'vitest';

import * as Core from '@/core';

describe('TtlApplication', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('findStalePostsByIds', () => {
    it('returns stale ids when TTL record is missing or expired', async () => {
      const now = 1_700_000_000_000;
      vi.spyOn(Date, 'now').mockReturnValue(now);

      const postIds = ['alice:1', 'bob:2', 'carol:3'];
      vi.spyOn(Core.PostTtlModel, 'findByIds').mockResolvedValue([
        // alice fresh
        { id: 'alice:1', lastUpdatedAt: now - 1_000 } as unknown as Core.PostTtlModel,
        // bob stale
        { id: 'bob:2', lastUpdatedAt: now - 10_000 } as unknown as Core.PostTtlModel,
        // carol missing
      ] as unknown as Core.PostTtlModel[]);

      const stale = await Core.TtlApplication.findStalePostsByIds({ postIds, ttlMs: 5_000 });
      expect(stale.sort()).toEqual(['bob:2', 'carol:3'].sort());
    });
  });

  describe('forceRefreshPostsByIds', () => {
    it('fetches, persists, and updates post TTL for refreshed posts', async () => {
      const viewerId = 'viewer' as Core.Pubky;
      const now = 1_700_000_000_000;
      vi.spyOn(Date, 'now').mockReturnValue(now);

      const postIds = ['alice:1', 'bob:2'];
      vi.spyOn(Core.postStreamApi, 'postsByIds').mockReturnValue({
        url: '/stream/posts/by_ids',
        body: { post_ids: postIds, viewer_id: viewerId },
      } as unknown as ReturnType<typeof Core.postStreamApi.postsByIds>);

      const nexusPosts: Core.NexusPost[] = [
        {
          details: { id: '1', author: 'alice' as Core.Pubky, content: '', indexed_at: 0, kind: 'note', uri: '', attachments: null },
          counts: { tags: 0, unique_tags: 0, replies: 0, reposts: 0 },
          tags: [],
          relationships: { replied: null, reposted: null, mentioned: [] },
          bookmark: null,
        },
        {
          details: { id: '2', author: 'bob' as Core.Pubky, content: '', indexed_at: 0, kind: 'note', uri: '', attachments: null },
          counts: { tags: 0, unique_tags: 0, replies: 0, reposts: 0 },
          tags: [],
          relationships: { replied: null, reposted: null, mentioned: [] },
          bookmark: null,
        },
      ];

      const queryNexusSpy = vi.spyOn(Core, 'queryNexus').mockResolvedValue(nexusPosts);
      const persistPostsSpy = vi
        .spyOn(Core.LocalStreamPostsService, 'persistPosts')
        .mockResolvedValue({ postAttachments: [] } as unknown as Awaited<ReturnType<typeof Core.LocalStreamPostsService.persistPosts>>);
      const fetchFilesSpy = vi.spyOn(Core.FileApplication, 'fetchFiles').mockResolvedValue(undefined);
      vi.spyOn(Core.LocalStreamUsersService, 'getNotPersistedUsersInCache').mockResolvedValue([]);
      const bulkSaveSpy = vi.spyOn(Core.PostTtlModel, 'bulkSave').mockResolvedValue(undefined as unknown as void);

      await Core.TtlApplication.forceRefreshPostsByIds({ postIds, viewerId });

      expect(queryNexusSpy).toHaveBeenCalledWith('/stream/posts/by_ids', 'POST', JSON.stringify({ post_ids: postIds, viewer_id: viewerId }));
      expect(persistPostsSpy).toHaveBeenCalledWith({ posts: nexusPosts });
      expect(fetchFilesSpy).toHaveBeenCalledWith([]);

      const expectedTtlIds = [
        Core.buildCompositeId({ pubky: 'alice' as Core.Pubky, id: '1' }),
        Core.buildCompositeId({ pubky: 'bob' as Core.Pubky, id: '2' }),
      ];
      expect(bulkSaveSpy).toHaveBeenCalledWith(
        expectedTtlIds.map((id) => [id, { lastUpdatedAt: now }]),
      );
    });

    it('does not update TTL when fetch fails', async () => {
      const viewerId = 'viewer' as Core.Pubky;
      vi.spyOn(Core.postStreamApi, 'postsByIds').mockReturnValue({
        url: '/stream/posts/by_ids',
        body: { post_ids: ['alice:1'], viewer_id: viewerId },
      } as unknown as ReturnType<typeof Core.postStreamApi.postsByIds>);

      vi.spyOn(Core, 'queryNexus').mockRejectedValue(new Error('Network down'));
      const bulkSaveSpy = vi.spyOn(Core.PostTtlModel, 'bulkSave').mockResolvedValue(undefined as unknown as void);

      await expect(Core.TtlApplication.forceRefreshPostsByIds({ postIds: ['alice:1'], viewerId })).rejects.toThrow('Network down');
      expect(bulkSaveSpy).not.toHaveBeenCalled();
    });
  });

  describe('forceRefreshUsersByIds', () => {
    it('fetches, persists, and updates user TTL for refreshed users', async () => {
      const now = 1_700_000_000_000;
      vi.spyOn(Date, 'now').mockReturnValue(now);

      const userIds = ['alice' as Core.Pubky, 'bob' as Core.Pubky];
      vi.spyOn(Core.userStreamApi, 'usersByIds').mockReturnValue({
        url: '/stream/users/by_ids',
        body: { user_ids: userIds, viewer_id: undefined },
      } as unknown as ReturnType<typeof Core.userStreamApi.usersByIds>);

      const nexusUsers: Core.NexusUser[] = [
        {
          details: { id: 'alice' as Core.Pubky, name: '', bio: '', links: null, status: null, image: null, indexed_at: 0 },
          counts: {
            tagged: 0,
            tags: 0,
            unique_tags: 0,
            posts: 0,
            replies: 0,
            following: 0,
            followers: 0,
            friends: 0,
            bookmarks: 0,
          },
          tags: [],
          relationship: { following: false, followed_by: false, muted: false },
        },
        {
          details: { id: 'bob' as Core.Pubky, name: '', bio: '', links: null, status: null, image: null, indexed_at: 0 },
          counts: {
            tagged: 0,
            tags: 0,
            unique_tags: 0,
            posts: 0,
            replies: 0,
            following: 0,
            followers: 0,
            friends: 0,
            bookmarks: 0,
          },
          tags: [],
          relationship: { following: false, followed_by: false, muted: false },
        },
      ];

      vi.spyOn(Core, 'queryNexus').mockResolvedValue(nexusUsers);
      const persistUsersSpy = vi.spyOn(Core.LocalStreamUsersService, 'persistUsers').mockResolvedValue([]);
      const bulkSaveSpy = vi.spyOn(Core.UserTtlModel, 'bulkSave').mockResolvedValue(undefined as unknown as void);

      await Core.TtlApplication.forceRefreshUsersByIds({ userIds });

      expect(persistUsersSpy).toHaveBeenCalledWith(nexusUsers);
      expect(bulkSaveSpy).toHaveBeenCalledWith(userIds.map((id) => [id, { lastUpdatedAt: now }]));
    });
  });
});


