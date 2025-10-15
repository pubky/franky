import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as Core from '@/core';

describe('LocalStreamService', () => {
  const streamId = Core.PostStreamTypes.TIMELINE_ALL;

  beforeEach(async () => {
    // Clear all relevant tables
    await Core.PostStreamModel.table.clear();
    await Core.PostDetailsModel.table.clear();
    vi.clearAllMocks();
  });

  describe('fetchAndCachePosts', () => {
    it('should fetch posts from Nexus and cache them', async () => {
      // Create initial stream
      await Core.PostStreamModel.create(streamId, ['post-1', 'post-2']);

      // Mock Nexus response
      const mockNexusPosts = [
        {
          details: {
            id: 'post-3',
            content: 'New post content',
            kind: 'short' as const,
            uri: 'https://pubky.app/user/pub/pubky.app/posts/post-3',
            author: 'user-123',
            indexed_at: Date.now(),
            attachments: null,
          },
          counts: {
            replies: 0,
            tags: 0,
            unique_tags: 0,
            reposts: 0,
          },
          author: {
            details: {
              name: 'Test User',
              bio: 'Test bio',
              id: 'user-123',
              links: null,
              status: null,
              image: null,
              indexed_at: Date.now(),
            },
            counts: {
              tagged: 0,
              tags: 0,
              unique_tags: 0,
              posts: 1,
              replies: 0,
              following: 0,
              followers: 0,
              friends: 0,
              bookmarks: 0,
            },
            tags: [],
            relationship: {
              following: false,
              followed_by: false,
              muted: false,
            },
          },
          tags: [],
          relationships: {
            replied: null,
            reposted: null,
            mentioned: [],
          },
          bookmark: null,
        },
      ];

      // Mock the Nexus services used indirectly by LocalStreamUsersService
      vi.spyOn(Core.NexusUserStreamService, 'fetchByIds').mockResolvedValue([]);

      // Call the method
      const result = await Core.LocalStreamPostsService.fetchAndCachePosts(
        streamId,
        ['post-1', 'post-2'],
        mockNexusPosts,
      );

      // Build expected composite ID
      const compositeId = Core.buildPostCompositeId({ pubky: 'user-123', postId: 'post-3' });

      // Verify the result
      expect(result).toEqual(['post-1', 'post-2', compositeId]);

      // Verify posts were persisted
      const savedPost = await Core.PostDetailsModel.findById(compositeId);
      expect(savedPost).toBeTruthy();
      expect(savedPost!.content).toBe('New post content');

      // Verify stream was updated in cache
      const updatedStream = await Core.PostStreamModel.findById(streamId);
      expect(updatedStream).toBeTruthy();
      expect(updatedStream!.stream).toEqual(['post-1', 'post-2', compositeId]);
    });

    it('should return null when Nexus returns no posts', async () => {
      // Create initial stream
      await Core.PostStreamModel.create(streamId, ['post-1']);

      const result = await Core.LocalStreamPostsService.fetchAndCachePosts(streamId, ['post-1'], []);

      // Verify the result is null (no new posts)
      expect(result).toBeNull();

      // Verify stream was not updated
      const updatedStream = await Core.PostStreamModel.findById(streamId);
      expect(updatedStream).toBeTruthy();
      expect(updatedStream!.stream).toEqual(['post-1']);
    });

    it('should handle errors from Nexus gracefully', async () => {
      // Create initial stream
      await Core.PostStreamModel.create(streamId, ['post-1']);

      // Mock user fetch to avoid network and force an error on post persistence
      vi.spyOn(Core.NexusUserStreamService, 'fetchByIds').mockResolvedValue([]);
      vi.spyOn(Core.LocalStreamPostsService, 'persistPosts').mockRejectedValue(new Error('Network error'));

      // Expect the error to be thrown
      const errorPost = [
        {
          details: {
            id: 'p-err',
            content: 'content',
            kind: 'short' as const,
            uri: 'https://example.com/p-err',
            author: 'u-err',
            indexed_at: Date.now(),
            attachments: null,
          },
          counts: { replies: 0, tags: 0, unique_tags: 0, reposts: 0 },
          author: {
            details: {
              name: 'Err',
              bio: 'Err',
              id: 'u-err',
              links: null,
              status: null,
              image: null,
              indexed_at: Date.now(),
            },
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
          tags: [],
          relationships: { replied: null, reposted: null, mentioned: [] },
          bookmark: null,
        },
      ];

      await expect(
        Core.LocalStreamPostsService.fetchAndCachePosts(streamId, ['post-1'], errorPost as unknown as Core.NexusPost[]),
      ).rejects.toThrow('Network error');

      // Verify stream was not updated
      const updatedStream = await Core.PostStreamModel.findById(streamId);
      expect(updatedStream).toBeTruthy();
      expect(updatedStream!.stream).toEqual(['post-1']);
    });
  });

  describe('validateCacheIntegrity', () => {
    it('should return true when stream has no duplicates', () => {
      const stream = { stream: ['post-1', 'post-2', 'post-3'] };

      const result = Core.LocalStreamPostsService.validateCacheIntegrity(stream);

      expect(result).toBe(true);
    });

    it('should return false when stream has duplicates', () => {
      const stream = { stream: ['post-1', 'post-2', 'post-1'] };

      const result = Core.LocalStreamPostsService.validateCacheIntegrity(stream);

      expect(result).toBe(false);
    });

    it('should return true for empty stream', () => {
      const stream = { stream: [] };

      const result = Core.LocalStreamPostsService.validateCacheIntegrity(stream);

      expect(result).toBe(true);
    });

    it('should return true for single item stream', () => {
      const stream = { stream: ['post-1'] };

      const result = Core.LocalStreamPostsService.validateCacheIntegrity(stream);

      expect(result).toBe(true);
    });
  });

  describe('clearCorruptedCache', () => {
    it('should delete the stream from cache', async () => {
      // Create stream
      await Core.PostStreamModel.create(streamId, ['post-1', 'post-2']);

      // Verify stream exists
      const streamBefore = await Core.PostStreamModel.findById(streamId);
      expect(streamBefore).toBeTruthy();

      // Clear the cache
      await Core.LocalStreamPostsService.deleteById(streamId);

      // Verify stream was deleted
      const streamAfter = await Core.PostStreamModel.findById(streamId);
      expect(streamAfter).toBeNull();
    });

    it('should not throw error if stream does not exist', async () => {
      // Try to clear a non-existent stream - using a valid PostStreamTypes enum value
      const nonExistentStreamId = Core.PostStreamTypes.TIMELINE_FOLLOWING;
      await expect(Core.LocalStreamPostsService.deleteById(nonExistentStreamId)).resolves.not.toThrow();
    });
  });
});
