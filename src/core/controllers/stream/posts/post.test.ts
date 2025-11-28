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
        streamHead: 0,
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
        streamHead: 0,
        streamTail: 0,
        lastPostId: undefined,
        viewerId,
      });
      expect(Core.useAuthStore.getState().selectCurrentUserPubky).toHaveBeenCalled();
      expect(fetchMissingPostsSpy).toHaveBeenCalledWith({
        cacheMissPostIds,
        viewerId,
        streamId,
        streamHead: Core.SKIP_FETCH_NEW_POSTS,
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
        streamHead: 0,
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
        streamHead: 0,
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

    it('should propagate error when selectCurrentUserPubky throws (user not authenticated)', async () => {
      // Set up spies to verify they're not called
      const getOrFetchStreamSliceSpy = vi.spyOn(Core.PostStreamApplication, 'getOrFetchStreamSlice');
      const fetchMissingPostsSpy = vi.spyOn(Core.PostStreamApplication, 'fetchMissingPostsFromNexus');

      // Mock selectCurrentUserPubky to throw error (user not authenticated)
      const authError = new Error('Current user pubky is not available. User may not be authenticated.');
      vi.spyOn(Core.useAuthStore.getState(), 'selectCurrentUserPubky').mockImplementation(() => {
        throw authError;
      });

      // Should propagate the error
      await expect(
        StreamPostsController.getOrFetchStreamSlice({
          streamId,
          streamTail: 0,
        }),
      ).rejects.toThrow('Current user pubky is not available. User may not be authenticated.');

      // Should not call getOrFetchStreamSlice when viewerId can't be retrieved
      expect(getOrFetchStreamSliceSpy).not.toHaveBeenCalled();
      expect(fetchMissingPostsSpy).not.toHaveBeenCalled();
    });

    it('should propagate error when PostStreamApplication.getOrFetchStreamSlice throws', async () => {
      // Mock selectCurrentUserPubky to return viewerId
      vi.spyOn(Core.useAuthStore.getState(), 'selectCurrentUserPubky').mockReturnValue(viewerId);

      // Mock getOrFetchStreamSlice to throw error
      const applicationError = new Error('Network error');
      const getOrFetchStreamSliceSpy = vi
        .spyOn(Core.PostStreamApplication, 'getOrFetchStreamSlice')
        .mockRejectedValue(applicationError);

      // Set up spy to verify it's not called
      const fetchMissingPostsSpy = vi.spyOn(Core.PostStreamApplication, 'fetchMissingPostsFromNexus');

      // Should propagate the error
      await expect(
        StreamPostsController.getOrFetchStreamSlice({
          streamId,
          streamTail: 0,
        }),
      ).rejects.toThrow('Network error');

      // Verify getOrFetchStreamSlice was called (error happened during execution)
      expect(getOrFetchStreamSliceSpy).toHaveBeenCalledWith({
        streamId,
        limit: Config.NEXUS_POSTS_PER_PAGE,
        streamHead: 0,
        streamTail: 0,
        lastPostId: undefined,
        viewerId,
      });

      // Should not call fetchMissingPostsFromNexus when getOrFetchStreamSlice fails
      expect(fetchMissingPostsSpy).not.toHaveBeenCalled();
    });

    it('should fetch missing posts in background without blocking response', async () => {
      const nextPageIds = ['user-1:post-1', 'user-1:post-2'];
      const cacheMissPostIds = ['user-1:post-3', 'user-1:post-4'];
      const timestamp = 1000000;

      // Mock getOrFetchStreamSlice to return cache misses
      vi.spyOn(Core.PostStreamApplication, 'getOrFetchStreamSlice').mockResolvedValue({
        nextPageIds,
        cacheMissPostIds,
        timestamp,
      });

      // Mock fetchMissingPostsFromNexus - even if it throws, should not block
      const fetchError = new Error('Failed to fetch missing posts');
      vi.spyOn(Core.PostStreamApplication, 'fetchMissingPostsFromNexus').mockRejectedValue(fetchError);

      // Should return immediately without waiting for background fetch
      const result = await StreamPostsController.getOrFetchStreamSlice({
        streamId,
        streamTail: 0,
      });

      // Should return the nextPageIds and timestamp immediately
      expect(result).toEqual({ nextPageIds, timestamp });

      // Verify fetchMissingPostsFromNexus was called (fire-and-forget)
      expect(Core.PostStreamApplication.fetchMissingPostsFromNexus).toHaveBeenCalledWith({
        cacheMissPostIds,
        viewerId,
        streamId,
        streamHead: Core.SKIP_FETCH_NEW_POSTS,
      });
    });

    it('should handle when lastPostId is provided and streamTail is 0', async () => {
      const nextPageIds = ['user-1:post-5', 'user-1:post-6'];
      const lastPostId = 'user-1:post-4';
      const streamTail = 0;

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
        streamHead: 0,
        lastPostId,
        streamTail,
        viewerId,
      });
      expect(result.nextPageIds).toEqual(nextPageIds);
    });

    it('WIP: should handle tags parameter when provided', async () => {
      const nextPageIds = ['user-1:post-1'];
      const tags = ['tag1', 'tag2'];

      const getOrFetchStreamSliceSpy = vi.spyOn(Core.PostStreamApplication, 'getOrFetchStreamSlice').mockResolvedValue({
        nextPageIds,
        cacheMissPostIds: [],
        timestamp: undefined,
      });

      await StreamPostsController.getOrFetchStreamSlice({
        streamId,
        streamTail: 0,
        tags,
      });

      // Note: tags parameter is not currently used in the implementation
      // This test verifies the method accepts it without error
      expect(getOrFetchStreamSliceSpy).toHaveBeenCalledWith({
        streamId,
        limit: Config.NEXUS_POSTS_PER_PAGE,
        streamHead: 0,
        streamTail: 0,
        lastPostId: undefined,
        viewerId,
      });
    });

    it('should handle engagement:all:images streamId', async () => {
      const engagementStreamId = 'engagement:all:images' as Core.PostStreamTypes;
      const nextPageIds = ['user-1:post-1', 'user-1:post-2'];
      const timestamp = 1000000;

      const getOrFetchStreamSliceSpy = vi.spyOn(Core.PostStreamApplication, 'getOrFetchStreamSlice').mockResolvedValue({
        nextPageIds,
        cacheMissPostIds: [],
        timestamp,
      });

      const result = await StreamPostsController.getOrFetchStreamSlice({
        streamId: engagementStreamId,
        streamTail: 0,
      });

      expect(getOrFetchStreamSliceSpy).toHaveBeenCalledWith({
        streamId: engagementStreamId,
        limit: Config.NEXUS_POSTS_PER_PAGE,
        streamHead: 0,
        streamTail: 0,
        lastPostId: undefined,
        viewerId,
      });
      expect(result).toEqual({
        nextPageIds,
        timestamp,
      });
    });

    it('should call selectCurrentUserPubky exactly once per request', async () => {
      const nextPageIds = ['user-1:post-1'];
      const selectCurrentUserPubkySpy = vi
        .spyOn(Core.useAuthStore.getState(), 'selectCurrentUserPubky')
        .mockReturnValue(viewerId);

      vi.spyOn(Core.PostStreamApplication, 'getOrFetchStreamSlice').mockResolvedValue({
        nextPageIds,
        cacheMissPostIds: [],
        timestamp: undefined,
      });

      await StreamPostsController.getOrFetchStreamSlice({
        streamId,
        streamTail: 0,
      });

      // Should be called exactly once to get viewerId
      expect(selectCurrentUserPubkySpy).toHaveBeenCalledTimes(1);
    });
  });
});
