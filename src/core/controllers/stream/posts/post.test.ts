import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as Core from '@/core';
import * as Config from '@/config';
import { StreamPostsController } from './posts';

describe('StreamPostsController', () => {
  const streamId = Core.PostStreamTypes.TIMELINE_ALL_ALL;
  const viewerId = 'user-viewer' as Core.Pubky;

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock useAuthStore
    vi.spyOn(Core.useAuthStore.getState(), 'selectCurrentUserPubky').mockReturnValue(viewerId);
  });

  describe('getOrFetchStreamSlice', () => {
    it('should return posts when no cache misses', async () => {
      const nextPageIds = ['user-1:post-1', 'user-1:post-2'];
      const timestamp = 1000000;

      const getOrFetchStreamSliceSpy = vi.spyOn(Core.PostStreamApplication, 'getOrFetchStreamSlice').mockResolvedValue({
        nextPageIds,
        cacheMissPostIds: [],
        timestamp,
      });

      const fetchMissingPostsSpy = vi.spyOn(Core.PostStreamApplication, 'fetchMissingPostsFromNexus');

      const result = await StreamPostsController.getOrFetchStreamSlice({
        streamId,
        streamTail: 0,
      });

      expect(getOrFetchStreamSliceSpy).toHaveBeenCalledWith({
        streamId,
        limit: Config.NEXUS_POSTS_PER_PAGE,
        streamTail: 0,
        lastPostId: undefined,
        viewerId,
      });
      expect(fetchMissingPostsSpy).not.toHaveBeenCalled();
      expect(result).toEqual({
        nextPageIds,
        timestamp,
      });
    });

    it('should fetch missing posts when cacheMissPostIds exist', async () => {
      const nextPageIds = ['user-1:post-1', 'user-1:post-2'];
      const cacheMissPostIds = ['user-1:post-3', 'user-1:post-4'];
      const timestamp = 1000000;

      const getOrFetchStreamSliceSpy = vi.spyOn(Core.PostStreamApplication, 'getOrFetchStreamSlice').mockResolvedValue({
        nextPageIds,
        cacheMissPostIds,
        timestamp,
      });

      const fetchMissingPostsSpy = vi
        .spyOn(Core.PostStreamApplication, 'fetchMissingPostsFromNexus')
        .mockResolvedValue();

      const result = await StreamPostsController.getOrFetchStreamSlice({
        streamId,
        streamTail: 0,
      });

      expect(getOrFetchStreamSliceSpy).toHaveBeenCalledWith({
        streamId,
        limit: Config.NEXUS_POSTS_PER_PAGE,
        streamTail: 0,
        lastPostId: undefined,
        viewerId,
      });
      expect(Core.useAuthStore.getState().selectCurrentUserPubky).toHaveBeenCalled();
      expect(fetchMissingPostsSpy).toHaveBeenCalledWith({
        cacheMissPostIds,
        viewerId,
      });
      expect(result).toEqual({
        nextPageIds,
        timestamp,
      });
    });

    it('should pass lastPostId and streamTail to getOrFetchStreamSlice', async () => {
      const nextPageIds = ['user-1:post-5', 'user-1:post-6'];
      const lastPostId = 'user-1:post-4';
      const streamTail = 1000004;

      const getOrFetchStreamSliceSpy = vi.spyOn(Core.PostStreamApplication, 'getOrFetchStreamSlice').mockResolvedValue({
        nextPageIds,
        cacheMissPostIds: [],
        timestamp: 1000005,
      });

      const result = await StreamPostsController.getOrFetchStreamSlice({
        streamId,
        lastPostId,
        streamTail,
      });

      expect(getOrFetchStreamSliceSpy).toHaveBeenCalledWith({
        streamId,
        limit: Config.NEXUS_POSTS_PER_PAGE,
        lastPostId,
        streamTail,
        viewerId,
      });
      expect(result.nextPageIds).toEqual(nextPageIds);
      expect(result.timestamp).toBe(1000005);
    });

    it('should use default limit when not provided', async () => {
      const nextPageIds = ['user-1:post-1'];
      const getOrFetchStreamSliceSpy = vi.spyOn(Core.PostStreamApplication, 'getOrFetchStreamSlice').mockResolvedValue({
        nextPageIds,
        cacheMissPostIds: [],
        timestamp: undefined,
      });

      await StreamPostsController.getOrFetchStreamSlice({
        streamId,
        streamTail: 0,
      });

      expect(getOrFetchStreamSliceSpy).toHaveBeenCalledWith({
        streamId,
        limit: Config.NEXUS_POSTS_PER_PAGE,
        streamTail: 0,
        lastPostId: undefined,
        viewerId,
      });
    });

    it('should not fetch missing posts when cacheMissPostIds is empty array', async () => {
      const nextPageIds = ['user-1:post-1', 'user-1:post-2'];
      const timestamp = 1000000;

      vi.spyOn(Core.PostStreamApplication, 'getOrFetchStreamSlice').mockResolvedValue({
        nextPageIds,
        cacheMissPostIds: [],
        timestamp,
      });

      const fetchMissingPostsSpy = vi.spyOn(Core.PostStreamApplication, 'fetchMissingPostsFromNexus');

      await StreamPostsController.getOrFetchStreamSlice({
        streamId,
        streamTail: 0,
      });

      // selectCurrentUserPubky is called to get viewerId (line 48 of posts.ts)
      expect(Core.useAuthStore.getState().selectCurrentUserPubky).toHaveBeenCalled();
      expect(fetchMissingPostsSpy).not.toHaveBeenCalled();
    });

    it('should handle undefined timestamp in response', async () => {
      const nextPageIds = ['user-1:post-1'];

      vi.spyOn(Core.PostStreamApplication, 'getOrFetchStreamSlice').mockResolvedValue({
        nextPageIds,
        cacheMissPostIds: [],
        timestamp: undefined,
      });

      const result = await StreamPostsController.getOrFetchStreamSlice({
        streamId,
        streamTail: 0,
      });

      expect(result.timestamp).toBeUndefined();
      expect(result.nextPageIds).toEqual(nextPageIds);
    });
  });
});
