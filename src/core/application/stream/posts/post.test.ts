import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as Core from '@/core';

describe('PostStreamApplication', () => {
  const streamId = Core.PostStreamTypes.TIMELINE_ALL;

  beforeEach(async () => {
    // Clear all relevant tables
    await Core.PostStreamModel.table.clear();
    await Core.PostDetailsModel.table.clear();
    vi.clearAllMocks();
  });

  describe('read', () => {
    it('should return posts from cache when available', async () => {
      // Create stream with posts
      const postIds = Array.from({ length: 20 }, (_, i) => `post-${i + 1}`);
      await Core.PostStreamModel.create(streamId, postIds);

      // Create all posts in database
      await Promise.all(
        postIds.map((postId) =>
          Core.PostDetailsModel.create({
            id: `user-1:${postId}`,
            content: `Content for ${postId}`,
            kind: 'short',
            indexed_at: Date.now(),
            uri: `https://pubky.app/user-1/pub/pubky.app/posts/${postId}`,
            attachments: null,
          }),
        ),
      );

      // Read first 10 posts
      const result = await Core.PostStreamApplication.read({
        streamId,
        limit: 10,
        skip: 0,
      });

      expect(result).toHaveLength(10);
      expect(result).toEqual(postIds.slice(0, 10));
    });

    it('should fetch from Nexus when cache is empty', async () => {
      const mockNexusPosts = Array.from({ length: 5 }, (_, i) => ({
        details: {
          id: `post-${i + 1}`,
          content: `Post ${i + 1} content`,
          kind: 'short' as const,
          uri: `https://pubky.app/user-1/pub/pubky.app/posts/post-${i + 1}`,
          author: 'user-1',
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
            id: 'user-1',
            links: null,
            status: null,
            image: null,
            indexed_at: Date.now(),
          },
          counts: {
            tagged: 0,
            tags: 0,
            unique_tags: 0,
            posts: 5,
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
      }));

      // Mock Nexus services
      vi.spyOn(Core.NexusPostStreamService, 'fetch').mockResolvedValue(mockNexusPosts);
      vi.spyOn(Core.NexusUserStreamService, 'fetchByIds').mockResolvedValue([]);

      // Read posts (cache is empty, should fetch from Nexus)
      const result = await Core.PostStreamApplication.read({
        streamId,
        limit: 5,
        skip: 0,
      });

      // Build expected composite IDs
      const expectedIds = mockNexusPosts.map((post) =>
        Core.buildPostCompositeId({ pubky: post.details.author, postId: post.details.id }),
      );

      expect(result).toHaveLength(5);
      expect(result).toEqual(expectedIds);

      // Verify stream was created in cache
      const cachedStream = await Core.PostStreamModel.findById(streamId);
      expect(cachedStream).toBeTruthy();
      expect(cachedStream!.stream).toEqual(expectedIds);
    });

    it('should fetch more posts from Nexus when cache is exhausted', async () => {
      // Create stream with only 5 posts
      await Core.PostStreamModel.create(streamId, ['post-1', 'post-2', 'post-3', 'post-4', 'post-5']);

      // Create these posts in database
      await Promise.all(
        Array.from({ length: 5 }, (_, i) =>
          Core.PostDetailsModel.create({
            id: `user-1:post-${i + 1}`,
            content: `Content for post-${i + 1}`,
            kind: 'short',
            indexed_at: Date.now(),
            uri: `https://pubky.app/user-1/pub/pubky.app/posts/post-${i + 1}`,
            attachments: null,
          }),
        ),
      );

      // Mock Nexus to return more posts
      const mockNexusPosts = Array.from({ length: 5 }, (_, i) => ({
        details: {
          id: `post-${i + 6}`,
          content: `Post ${i + 6} content`,
          kind: 'short' as const,
          uri: `https://pubky.app/user-1/pub/pubky.app/posts/post-${i + 6}`,
          author: 'user-1',
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
            id: 'user-1',
            links: null,
            status: null,
            image: null,
            indexed_at: Date.now(),
          },
          counts: {
            tagged: 0,
            tags: 0,
            unique_tags: 0,
            posts: 10,
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
      }));

      vi.spyOn(Core.NexusPostStreamService, 'fetch').mockResolvedValue(mockNexusPosts);
      vi.spyOn(Core.NexusUserStreamService, 'fetchByIds').mockResolvedValue([]);

      // Request posts beyond cache (offset 0, limit 10)
      const result = await Core.PostStreamApplication.read({
        streamId,
        limit: 10,
        skip: 0,
      });

      // Build expected composite IDs for new posts
      const newCompositeIds = mockNexusPosts.map((post) =>
        Core.buildPostCompositeId({ pubky: post.details.author, postId: post.details.id }),
      );

      // Should have fetched more posts from Nexus
      expect(result).toHaveLength(10);
      expect(result).toEqual(['post-1', 'post-2', 'post-3', 'post-4', 'post-5', ...newCompositeIds]);

      // Verify stream was updated in cache
      const updatedStream = await Core.PostStreamModel.findById(streamId);
      expect(updatedStream).toBeTruthy();
      expect(updatedStream!.stream).toHaveLength(10);
    });

    it('should handle pagination with offset', async () => {
      // Create stream with 20 posts
      const postIds = Array.from({ length: 20 }, (_, i) => `post-${i + 1}`);
      await Core.PostStreamModel.create(streamId, postIds);

      // Create all posts in database
      await Promise.all(
        postIds.map((postId) =>
          Core.PostDetailsModel.create({
            id: `user-1:${postId}`,
            content: `Content for ${postId}`,
            kind: 'short',
            indexed_at: Date.now(),
            uri: `https://pubky.app/user-1/pub/pubky.app/posts/${postId}`,
            attachments: null,
          }),
        ),
      );

      // Read posts with offset 10
      const result = await Core.PostStreamApplication.read({
        streamId,
        limit: 5,
        skip: 10,
      });

      expect(result).toHaveLength(5);
      expect(result).toEqual(['post-11', 'post-12', 'post-13', 'post-14', 'post-15']);
    });

    it('should clear corrupted cache and refetch when cache integrity fails', async () => {
      // Create stream with duplicate posts (corrupted)
      await Core.PostStreamModel.create(streamId, ['user-1:post-1', 'user-1:post-2', 'user-1:post-1']);

      // Mock Nexus to return fresh posts
      const mockNexusPosts = Array.from({ length: 2 }, (_, i) => ({
        details: {
          id: `post-${i + 1}`,
          content: `New Post ${i + 1} content`,
          kind: 'short' as const,
          uri: `https://pubky.app/user-1/pub/pubky.app/posts/post-${i + 1}`,
          author: 'user-1',
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
            id: 'user-1',
            links: null,
            status: null,
            image: null,
            indexed_at: Date.now(),
          },
          counts: {
            tagged: 0,
            tags: 0,
            unique_tags: 0,
            posts: 2,
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
      }));

      vi.spyOn(Core.NexusPostStreamService, 'fetch').mockResolvedValue(mockNexusPosts);
      vi.spyOn(Core.NexusUserStreamService, 'fetchByIds').mockResolvedValue([]);

      // Should detect corruption, clear cache, and refetch
      const result = await Core.PostStreamApplication.read({
        streamId,
        limit: 2,
        skip: 0,
      });

      // Build expected composite IDs
      const expectedIds = mockNexusPosts.map((post) =>
        Core.buildPostCompositeId({ pubky: post.details.author, postId: post.details.id }),
      );

      expect(result).toHaveLength(2);
      expect(result).toEqual(expectedIds);

      // Verify posts were persisted
      const post1 = await Core.PostDetailsModel.findById(expectedIds[0]);
      expect(post1).toBeTruthy();
    });

    it('should return empty array when no posts are available', async () => {
      // Mock Nexus to return empty array
      vi.spyOn(Core.NexusPostStreamService, 'fetch').mockResolvedValue([]);

      const result = await Core.PostStreamApplication.read({
        streamId,
        limit: 10,
        skip: 0,
      });

      expect(result).toEqual([]);
    });

    it('should stop fetching when Nexus returns no new posts', async () => {
      // Create stream with 5 posts
      await Core.PostStreamModel.create(streamId, ['post-1', 'post-2', 'post-3', 'post-4', 'post-5']);

      // Create these posts in database
      await Promise.all(
        Array.from({ length: 5 }, (_, i) =>
          Core.PostDetailsModel.create({
            id: `user-1:post-${i + 1}`,
            content: `Content for post-${i + 1}`,
            kind: 'short',
            indexed_at: Date.now(),
            uri: `https://pubky.app/user-1/pub/pubky.app/posts/post-${i + 1}`,
            attachments: null,
          }),
        ),
      );

      // Mock Nexus to return empty (no more posts)
      vi.spyOn(Core.NexusPostStreamService, 'fetch').mockResolvedValue([]);

      // Request 10 posts but only 5 exist
      const result = await Core.PostStreamApplication.read({
        streamId,
        limit: 10,
        skip: 0,
      });

      // Should return only the 5 available posts
      expect(result).toHaveLength(5);
      expect(result).toEqual(['post-1', 'post-2', 'post-3', 'post-4', 'post-5']);
    });
  });
});
