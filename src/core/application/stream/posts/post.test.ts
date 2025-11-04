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

  describe('getOrFetchStreamSlice', () => {
    it('should return posts from cache when available (no cursor)', async () => {
      // Create stream with posts
      const postIds = Array.from({ length: 20 }, (_, i) => `user-1:post-${i + 1}`);
      await Core.PostStreamModel.create(streamId, postIds);

      // Read first 10 posts (no cursor = initial load)
      const result = await Core.PostStreamApplication.getOrFetchStreamSlice({
        streamId,
        limit: 10,
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
          indexed_at: 1000000 + i,
          attachments: null,
        },
        counts: {
          replies: 0,
          tags: 0,
          unique_tags: 0,
          reposts: 0,
        },
        tags: [],
        relationships: {
          replied: null,
          reposted: null,
          mentioned: [],
        },
        bookmark: null,
      }));

      // Mock Nexus service
      vi.spyOn(Core.NexusPostStreamService, 'fetch').mockResolvedValue(mockNexusPosts);

      const result = await Core.PostStreamApplication.getOrFetchStreamSlice({
        streamId,
        limit: 10,
      });

      // Should have fetched and cached posts
      expect(result).toHaveLength(5);
      expect(result).toEqual(['user-1:post-1', 'user-1:post-2', 'user-1:post-3', 'user-1:post-4', 'user-1:post-5']);

      // Verify posts were cached
      const cached = await Core.PostStreamModel.findById(streamId);
      expect(cached?.stream).toEqual(result);
    });

    it('should paginate using cursor (post_id and timestamp)', async () => {
      // Create initial cache with 5 posts
      const initialPostIds = Array.from({ length: 5 }, (_, i) => `user-1:post-${i + 1}`);
      await Core.PostStreamModel.create(streamId, initialPostIds);

      // Create post details with timestamps
      await Promise.all(
        initialPostIds.map((postId, i) =>
          Core.PostDetailsModel.create({
            id: postId,
            content: `Content for ${postId}`,
            kind: 'short',
            indexed_at: 1000000 + i,
            uri: `https://pubky.app/user-1/pub/pubky.app/posts/post-${i + 1}`,
            attachments: null,
          }),
        ),
      );

      // Mock more posts from Nexus
      const mockNexusPosts = Array.from({ length: 5 }, (_, i) => ({
        details: {
          id: `post-${i + 6}`,
          content: `Post ${i + 6} content`,
          kind: 'short' as const,
          uri: `https://pubky.app/user-1/pub/pubky.app/posts/post-${i + 6}`,
          author: 'user-1',
          indexed_at: 1000005 + i,
          attachments: null,
        },
        counts: {
          replies: 0,
          tags: 0,
          unique_tags: 0,
          reposts: 0,
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

      // Paginate from last post
      const result = await Core.PostStreamApplication.getOrFetchStreamSlice({
        streamId,
        limit: 10,
        post_id: 'user-1:post-5', // Last post in cache
        timestamp: 1000004, // Timestamp of last post
      });

      // Should return newly fetched posts
      expect(result).toHaveLength(5);
      expect(result).toEqual(['user-1:post-6', 'user-1:post-7', 'user-1:post-8', 'user-1:post-9', 'user-1:post-10']);

      // Verify cache was updated
      const cached = await Core.PostStreamModel.findById(streamId);
      expect(cached?.stream).toHaveLength(10);
    });

    it('should return empty array when no more posts available', async () => {
      // Create cache with posts
      const postIds = ['user-1:post-1', 'user-1:post-2'];
      await Core.PostStreamModel.create(streamId, postIds);

      // Create post details
      await Promise.all(
        postIds.map((postId, i) =>
          Core.PostDetailsModel.create({
            id: postId,
            content: `Content for ${postId}`,
            kind: 'short',
            indexed_at: 1000000 + i,
            uri: `https://pubky.app/user-1/pub/pubky.app/posts/post-${i + 1}`,
            attachments: null,
          }),
        ),
      );

      // Mock empty response from Nexus
      vi.spyOn(Core.NexusPostStreamService, 'fetch').mockResolvedValue([]);

      const result = await Core.PostStreamApplication.getOrFetchStreamSlice({
        streamId,
        limit: 10,
        post_id: 'user-1:post-2',
        timestamp: 1000001,
      });

      expect(result).toHaveLength(0);
    });

    it('should handle posts from cache when cursor points to middle', async () => {
      // Create cache with 20 posts
      const postIds = Array.from({ length: 20 }, (_, i) => `user-1:post-${i + 1}`);
      await Core.PostStreamModel.create(streamId, postIds);

      // Get posts after post-5 (should return posts 6-15)
      const result = await Core.PostStreamApplication.getOrFetchStreamSlice({
        streamId,
        limit: 10,
        post_id: 'user-1:post-5',
      });

      expect(result).toHaveLength(10);
      expect(result).toEqual(postIds.slice(5, 15)); // posts 6-15
    });
  });
});
