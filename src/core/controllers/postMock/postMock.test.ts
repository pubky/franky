import { describe, it, expect, beforeEach } from 'vitest';
import { PostMockController, PostMock } from '@/core';
import { resetDatabase } from '@/core/database/franky/franky.helpers';

describe('PostMockController', () => {
  beforeEach(async () => {
    await resetDatabase();
    // Reset initialization state
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (PostMockController as any).isInitialized = false;
  });

  describe('Controller Initialization', () => {
    it('should auto-initialize on first operation', async () => {
      const initialCount = await PostMockController.count();
      expect(initialCount).toBe(50); // Default initialization count
    });

    it('should only initialize once', async () => {
      // First call should initialize
      await PostMockController.fetch();
      const count1 = await PostMockController.count();

      // Second call should not re-initialize
      await PostMockController.fetch();
      const count2 = await PostMockController.count();

      expect(count1).toBe(count2);
      expect(count1).toBe(50);
    });

    it('should handle empty database initialization', async () => {
      await PostMockController.clear();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (PostMockController as any).isInitialized = false;

      const posts = await PostMockController.fetch();
      expect(posts.length).toBeGreaterThan(0);

      const count = await PostMockController.count();
      expect(count).toBe(50);
    });
  });

  describe('Data Fetching Operations', () => {
    beforeEach(async () => {
      await PostMockController.reset(); // Ensure clean state with 50 posts
    });

    it('should fetch posts with default parameters', async () => {
      const posts = await PostMockController.fetch();

      expect(posts).toBeInstanceOf(Array);
      expect(posts.length).toBeLessThanOrEqual(30); // Default limit

      posts.forEach((post) => {
        expect(post).toHaveProperty('id');
        expect(post).toHaveProperty('text');
        expect(post).toHaveProperty('createdAt');
        expect(typeof post.id).toBe('string');
        expect(typeof post.text).toBe('string');
        expect(typeof post.createdAt).toBe('number');
      });
    });

    it('should respect custom limit parameter', async () => {
      const customLimit = 10;
      const posts = await PostMockController.fetch(customLimit);

      expect(posts.length).toBeLessThanOrEqual(customLimit);
    });

    it('should respect offset parameter', async () => {
      const limit = 5;
      const firstBatch = await PostMockController.fetch(limit, 0);
      const secondBatch = await PostMockController.fetch(limit, limit);

      expect(firstBatch.length).toBe(limit);
      expect(secondBatch.length).toBe(limit);

      // Ensure different posts
      const firstIds = new Set(firstBatch.map((p) => p.id));
      const secondIds = new Set(secondBatch.map((p) => p.id));
      const intersection = new Set([...firstIds].filter((id) => secondIds.has(id)));

      expect(intersection.size).toBe(0); // No overlap
    });

    it('should return posts in newest-first order', async () => {
      const posts = await PostMockController.fetch(10);

      for (let i = 0; i < posts.length - 1; i++) {
        expect(posts[i].createdAt).toBeGreaterThanOrEqual(posts[i + 1].createdAt);
      }
    });

    it('should handle large offset gracefully', async () => {
      const posts = await PostMockController.fetch(10, 1000);
      expect(posts).toBeInstanceOf(Array);
      expect(posts.length).toBe(0); // No posts at large offset
    });
  });

  describe('CRUD Operations', () => {
    beforeEach(async () => {
      await PostMockController.clear();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (PostMockController as any).isInitialized = true;
    });

    it('should add a post with default values', async () => {
      const post = await PostMockController.add();

      expect(post).toHaveProperty('id');
      expect(post).toHaveProperty('text');
      expect(post).toHaveProperty('createdAt');
      expect(post.id).toBeTruthy();
      expect(post.text).toBeTruthy();
      expect(post.createdAt).toBeGreaterThan(0);
    });

    it('should add a post with custom data', async () => {
      const customData = {
        text: 'Custom post content',
        createdAt: Date.now() - 5000,
      };

      const post = await PostMockController.add(customData);

      expect(post.text).toBe(customData.text);
      expect(post.createdAt).toBe(customData.createdAt);
      expect(post.id).toBeTruthy();
    });

    it('should find existing post by ID', async () => {
      const addedPost = await PostMockController.add({ text: 'Findable post' });
      const foundPost = await PostMockController.findById(addedPost.id);

      expect(foundPost).not.toBeNull();
      expect(foundPost?.id).toBe(addedPost.id);
      expect(foundPost?.text).toBe(addedPost.text);
      expect(foundPost?.createdAt).toBe(addedPost.createdAt);
    });

    it('should return null for non-existent post ID', async () => {
      const foundPost = await PostMockController.findById('non-existent-id');
      expect(foundPost).toBeNull();
    });

    it('should delete existing post', async () => {
      const addedPost = await PostMockController.add({ text: 'Post to delete' });

      const deleteResult = await PostMockController.delete(addedPost.id);
      expect(deleteResult).toBe(true);

      const foundPost = await PostMockController.findById(addedPost.id);
      expect(foundPost).toBeNull();
    });

    it('should return false when deleting non-existent post', async () => {
      const deleteResult = await PostMockController.delete('non-existent-id');
      expect(deleteResult).toBe(false);
    });

    it('should count posts accurately', async () => {
      expect(await PostMockController.count()).toBe(0);

      await PostMockController.add({ text: 'Post 1' });
      expect(await PostMockController.count()).toBe(1);

      await PostMockController.add({ text: 'Post 2' });
      expect(await PostMockController.count()).toBe(2);
    });

    it('should clear all posts', async () => {
      await PostMockController.add({ text: 'Post 1' });
      await PostMockController.add({ text: 'Post 2' });
      expect(await PostMockController.count()).toBe(2);

      await PostMockController.clear();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (PostMockController as any).isInitialized = true; // Evita re-inicialização
      expect(await PostMockController.count()).toBe(0);
    });

    it('should reset to initial state', async () => {
      await PostMockController.add({ text: 'Temporary post' });
      const countBefore = await PostMockController.count();
      expect(countBefore).toBeGreaterThan(0);

      await PostMockController.reset();
      expect(await PostMockController.count()).toBe(50);
    });
  });

  describe('Cursor-based Pagination', () => {
    let testPosts: PostMock[];

    beforeEach(async () => {
      await PostMockController.clear();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (PostMockController as any).isInitialized = true;
      testPosts = [];

      // Create posts with specific timestamps for predictable ordering
      for (let i = 0; i < 5; i++) {
        const post = await PostMockController.add({
          text: `Test post ${i}`,
          createdAt: Date.now() - i * 1000, // Each post 1 second older
        });
        testPosts.push(post);
      }

      // Sort by createdAt descending (newest first)
      testPosts.sort((a, b) => b.createdAt - a.createdAt);
    });

    it('should fetch posts after cursor (older posts)', async () => {
      const cursorPost = testPosts[1]; // Second newest post
      const postsAfter = await PostMockController.fetchAfter(cursorPost.id, 2);

      expect(postsAfter.length).toBeLessThanOrEqual(2);

      // All returned posts should be older than cursor
      postsAfter.forEach((post) => {
        expect(post.createdAt).toBeLessThan(cursorPost.createdAt);
      });
    });

    it('should fetch posts before cursor (newer posts)', async () => {
      const cursorPost = testPosts[3]; // Fourth newest post (has newer posts)
      const postsBefore = await PostMockController.fetchBefore(cursorPost.id, 2);

      expect(postsBefore.length).toBeLessThanOrEqual(2);

      // All returned posts should be newer than cursor
      postsBefore.forEach((post) => {
        expect(post.createdAt).toBeGreaterThan(cursorPost.createdAt);
      });
    });

    it('should handle non-existent cursor ID', async () => {
      const postsAfter = await PostMockController.fetchAfter('non-existent', 5);
      const postsBefore = await PostMockController.fetchBefore('non-existent', 5);

      expect(postsAfter).toEqual([]);
      expect(postsBefore).toEqual([]);
    });

    it('should respect limit in cursor pagination', async () => {
      const cursorPost = testPosts[1];
      const limit = 1;

      const postsAfter = await PostMockController.fetchAfter(cursorPost.id, limit);
      const postsBefore = await PostMockController.fetchBefore(cursorPost.id, limit);

      expect(postsAfter.length).toBeLessThanOrEqual(limit);
      expect(postsBefore.length).toBeLessThanOrEqual(limit);
    });

    it('should maintain newest-first order in cursor results', async () => {
      const cursorPost = testPosts[1];
      const postsAfter = await PostMockController.fetchAfter(cursorPost.id, 5);

      // Results should be in newest-first order
      for (let i = 0; i < postsAfter.length - 1; i++) {
        expect(postsAfter[i].createdAt).toBeGreaterThanOrEqual(postsAfter[i + 1].createdAt);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle database operations gracefully', async () => {
      // Test that basic operations work
      const count = await PostMockController.count();
      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThanOrEqual(0);

      // Test that fetch returns an array
      const posts = await PostMockController.fetch(5);
      expect(Array.isArray(posts)).toBe(true);
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle multiple posts efficiently', async () => {
      await PostMockController.clear();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (PostMockController as any).isInitialized = true;

      // Add several posts
      const posts = [];
      for (let i = 0; i < 10; i++) {
        posts.push(await PostMockController.add({ text: `Bulk post ${i}` }));
      }

      expect(await PostMockController.count()).toBe(10);
      expect(posts.length).toBe(10);
    });

    it('should handle boundary conditions', async () => {
      await PostMockController.clear();

      // Test with zero limit
      const zeroPosts = await PostMockController.fetch(0);
      expect(zeroPosts).toEqual([]);

      // Test with very large limit
      const manyPosts = await PostMockController.fetch(999999);
      expect(manyPosts).toBeInstanceOf(Array);

      // Test with negative offset (should be handled gracefully)
      const negativeOffset = await PostMockController.fetch(10, -1);
      expect(negativeOffset).toBeInstanceOf(Array);
    });

    it('should maintain data consistency across operations', async () => {
      await PostMockController.clear();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (PostMockController as any).isInitialized = true;

      const post1 = await PostMockController.add({ text: 'First post' });
      const post2 = await PostMockController.add({ text: 'Second post' });

      // Verify both posts exist
      expect(await PostMockController.findById(post1.id)).not.toBeNull();
      expect(await PostMockController.findById(post2.id)).not.toBeNull();
      expect(await PostMockController.count()).toBe(2);

      // Delete one post
      await PostMockController.delete(post1.id);

      // Verify consistency
      expect(await PostMockController.findById(post1.id)).toBeNull();
      expect(await PostMockController.findById(post2.id)).not.toBeNull();
      expect(await PostMockController.count()).toBe(1);
    });
  });
});
