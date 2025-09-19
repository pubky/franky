import { describe, it, expect, beforeEach } from 'vitest';
import { PostMock, PostMockGenerator, PostMockController } from '@/core';
import { resetDatabase } from '@/core/database/franky/franky.helpers';

describe('PostMockGenerator', () => {
  describe('UUID Generation', () => {
    it('should generate unique UUIDs', () => {
      const uuid1 = PostMockGenerator.generateUUID();
      const uuid2 = PostMockGenerator.generateUUID();

      expect(uuid1).toBeDefined();
      expect(uuid2).toBeDefined();
      expect(uuid1).not.toBe(uuid2);
      expect(uuid1).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });
  });

  describe('Text Generation', () => {
    it('should generate random text', () => {
      const text1 = PostMockGenerator.generateRandomText();
      const text2 = PostMockGenerator.generateRandomText();

      expect(text1).toBeDefined();
      expect(text2).toBeDefined();
      expect(typeof text1).toBe('string');
      expect(text1.length).toBeGreaterThan(0);
      // Different texts should be generated in most cases
      // (collisions may occur occasionally, but it's very unlikely)
    });

    it('should generate text with reasonable length', () => {
      const texts = Array.from({ length: 10 }, () => PostMockGenerator.generateRandomText());

      texts.forEach((text) => {
        // Check if text has reasonable length
        expect(text.length).toBeGreaterThan(10);
        expect(text.length).toBeLessThan(500);
        // Check if text contains words
        expect(text.split(' ').length).toBeGreaterThan(1);
      });
    });

    it('should sometimes include emojis', () => {
      // Generate many texts to increase the chance of finding emojis
      const texts = Array.from({ length: 50 }, () => PostMockGenerator.generateRandomText());
      const textsWithEmojis = texts.filter((text) =>
        /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(
          text,
        ),
      );

      // There should be at least some texts with emojis (probability ~30%)
      expect(textsWithEmojis.length).toBeGreaterThan(0);
    });
  });

  describe('Single Post Creation', () => {
    it('should create a post with default values', () => {
      const post = PostMockGenerator.create();

      expect(post).toBeDefined();
      expect(post.id).toBeDefined();
      expect(post.text).toBeDefined();
      expect(post.createdAt).toBeDefined();
      expect(typeof post.id).toBe('string');
      expect(typeof post.text).toBe('string');
      expect(typeof post.createdAt).toBe('number');
      expect(post.createdAt).toBeLessThanOrEqual(Date.now());
    });

    it('should create a post with custom values', () => {
      const customText = 'Custom test post';
      const customTime = Date.now() - 1000;

      const post = PostMockGenerator.create({
        text: customText,
        createdAt: customTime,
      });

      expect(post.text).toBe(customText);
      expect(post.createdAt).toBe(customTime);
      expect(post.id).toBeDefined();
    });

    it('should override specific fields while keeping others generated', () => {
      const customText = 'Override text only';
      const post = PostMockGenerator.create({ text: customText });

      expect(post.text).toBe(customText);
      expect(post.id).toBeDefined();
      expect(post.createdAt).toBeDefined();
      expect(post.createdAt).toBeLessThanOrEqual(Date.now());
    });
  });

  describe('Multiple Posts Creation', () => {
    it('should create multiple posts', () => {
      const count = 5;
      const posts = PostMockGenerator.createMultiple(count);

      expect(posts).toBeDefined();
      expect(posts.length).toBe(count);

      posts.forEach((post) => {
        expect(post.id).toBeDefined();
        expect(post.text).toBeDefined();
        expect(post.createdAt).toBeDefined();
      });
    });

    it('should create posts with unique IDs', () => {
      const posts = PostMockGenerator.createMultiple(10);
      const ids = posts.map((post) => post.id);
      const uniqueIds = [...new Set(ids)];

      expect(uniqueIds.length).toBe(posts.length);
    });

    it('should create posts sorted by creation time (newest first)', () => {
      const posts = PostMockGenerator.createMultiple(5);

      for (let i = 0; i < posts.length - 1; i++) {
        expect(posts[i].createdAt).toBeGreaterThanOrEqual(posts[i + 1].createdAt);
      }
    });

    it('should create posts with time variation', () => {
      const posts = PostMockGenerator.createMultiple(10);
      const timestamps = posts.map((post) => post.createdAt);
      const uniqueTimestamps = [...new Set(timestamps)];

      // There should be variation in timestamps (not all equal)
      expect(uniqueTimestamps.length).toBeGreaterThan(1);
    });

    it('should handle edge cases', () => {
      expect(() => PostMockGenerator.createMultiple(0)).not.toThrow();
      expect(PostMockGenerator.createMultiple(0)).toEqual([]);

      const singlePost = PostMockGenerator.createMultiple(1);
      expect(singlePost.length).toBe(1);
    });
  });
});

describe('PostMockController', () => {
  beforeEach(async () => {
    await resetDatabase();
    // Reset controller initialization state

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (PostMockController as any).isInitialized = false;
  });

  describe('Initialization', () => {
    it('should initialize with default posts when database is empty', async () => {
      const count = await PostMockController.count();
      expect(count).toBe(50); // Default value set in controller
    });

    it('should not duplicate posts on multiple initializations', async () => {
      await PostMockController.fetch(); // First initialization
      const count1 = await PostMockController.count();

      await PostMockController.fetch(); // Second initialization
      const count2 = await PostMockController.count();

      expect(count1).toBe(count2);
      expect(count1).toBe(50);
    });
  });

  describe('Basic CRUD Operations', () => {
    it('should add a new post', async () => {
      await PostMockController.clear();
      // Reset to prevent auto-reinitialization

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (PostMockController as any).isInitialized = true;

      const customText = 'Test post content';
      const newPost = await PostMockController.add({ text: customText });

      expect(newPost).toBeDefined();
      expect(newPost.id).toBeDefined();
      expect(newPost.text).toBe(customText);
      expect(newPost.createdAt).toBeDefined();

      const count = await PostMockController.count();
      expect(count).toBe(1);
    });

    it('should find a post by ID', async () => {
      await PostMockController.clear();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (PostMockController as any).isInitialized = true;
      const newPost = await PostMockController.add({ text: 'Findable post' });

      const foundPost = await PostMockController.findById(newPost.id);

      expect(foundPost).toBeDefined();
      expect(foundPost?.id).toBe(newPost.id);
      expect(foundPost?.text).toBe(newPost.text);
      expect(foundPost?.createdAt).toBe(newPost.createdAt);
    });

    it('should return null for non-existent post ID', async () => {
      const nonExistentId = 'non-existent-id';
      const foundPost = await PostMockController.findById(nonExistentId);

      expect(foundPost).toBeNull();
    });

    it('should delete a post by ID', async () => {
      await PostMockController.clear();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (PostMockController as any).isInitialized = true;
      const newPost = await PostMockController.add({ text: 'Post to delete' });

      const deleted = await PostMockController.delete(newPost.id);
      expect(deleted).toBe(true);

      const foundPost = await PostMockController.findById(newPost.id);
      expect(foundPost).toBeNull();

      const count = await PostMockController.count();
      expect(count).toBe(0);
    });

    it('should return false when deleting non-existent post', async () => {
      await PostMockController.clear();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (PostMockController as any).isInitialized = true;

      const nonExistentId = 'non-existent-id';
      const deleted = await PostMockController.delete(nonExistentId);

      expect(deleted).toBe(false);
    });

    it('should count posts correctly', async () => {
      await PostMockController.clear();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (PostMockController as any).isInitialized = true;
      expect(await PostMockController.count()).toBe(0);

      await PostMockController.add({ text: 'Post 1' });
      expect(await PostMockController.count()).toBe(1);

      await PostMockController.add({ text: 'Post 2' });
      expect(await PostMockController.count()).toBe(2);
    });

    it('should clear all posts', async () => {
      // Ensure there are posts
      await PostMockController.fetch(); // This initializes with 50 posts
      expect(await PostMockController.count()).toBe(50);

      await PostMockController.clear();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (PostMockController as any).isInitialized = true; // Prevent re-initialization
      expect(await PostMockController.count()).toBe(0);
    });

    it('should reset with fresh data', async () => {
      await PostMockController.clear();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (PostMockController as any).isInitialized = true;
      expect(await PostMockController.count()).toBe(0);

      await PostMockController.reset();
      expect(await PostMockController.count()).toBe(50);
    });
  });

  describe('Pagination', () => {
    beforeEach(async () => {
      await PostMockController.clear();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (PostMockController as any).isInitialized = true;
      // Add posts with specific timestamps for pagination tests
      const posts = [];
      for (let i = 0; i < 10; i++) {
        posts.push(
          await PostMockController.add({
            text: `Post ${i}`,
            createdAt: Date.now() - i * 1000, // Each post 1 second older
          }),
        );
      }
    });

    it('should fetch posts with default pagination', async () => {
      const posts = await PostMockController.fetch();

      expect(posts.length).toBeLessThanOrEqual(30); // Default limit
      expect(posts.length).toBe(10); // We have 10 posts in total
    });

    it('should fetch posts with custom limit', async () => {
      const limit = 5;
      const posts = await PostMockController.fetch(limit);

      expect(posts.length).toBe(limit);
    });

    it('should fetch posts with offset', async () => {
      const firstBatch = await PostMockController.fetch(3, 0);
      const secondBatch = await PostMockController.fetch(3, 3);

      expect(firstBatch.length).toBe(3);
      expect(secondBatch.length).toBe(3);

      // Posts should be different
      const firstIds = firstBatch.map((p) => p.id);
      const secondIds = secondBatch.map((p) => p.id);
      expect(firstIds).not.toEqual(secondIds);
    });

    it('should return posts sorted by creation time (newest first)', async () => {
      const posts = await PostMockController.fetch();

      for (let i = 0; i < posts.length - 1; i++) {
        expect(posts[i].createdAt).toBeGreaterThanOrEqual(posts[i + 1].createdAt);
      }
    });
  });

  describe('Cursor-based Pagination', () => {
    let posts: PostMock[];

    beforeEach(async () => {
      await PostMockController.clear();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (PostMockController as any).isInitialized = true;
      posts = [];

      // Create posts with specific timestamps
      for (let i = 0; i < 5; i++) {
        const post = await PostMockController.add({
          text: `Cursor Post ${i}`,
          createdAt: Date.now() - i * 2000, // 2 seconds difference
        });
        posts.push(post);
      }

      // Sort by createdAt desc (as the controller does)
      posts.sort((a, b) => b.createdAt - a.createdAt);
    });

    it('should fetch posts after cursor', async () => {
      const cursorPost = posts[1]; // Second newest post
      const postsAfter = await PostMockController.fetchAfter(cursorPost.id, 2);

      expect(postsAfter.length).toBeLessThanOrEqual(2);

      // Returned posts should be older than cursor
      postsAfter.forEach((post) => {
        expect(post.createdAt).toBeLessThan(cursorPost.createdAt);
      });
    });

    it('should fetch posts before cursor', async () => {
      const cursorPost = posts[2]; // Third newest post
      const postsBefore = await PostMockController.fetchBefore(cursorPost.id, 2);

      expect(postsBefore.length).toBeLessThanOrEqual(2);

      // Returned posts should be newer than cursor
      postsBefore.forEach((post) => {
        expect(post.createdAt).toBeGreaterThan(cursorPost.createdAt);
      });
    });

    it('should return empty array for non-existent cursor', async () => {
      const nonExistentId = 'non-existent-cursor';

      const postsAfter = await PostMockController.fetchAfter(nonExistentId);
      const postsBefore = await PostMockController.fetchBefore(nonExistentId);

      expect(postsAfter).toEqual([]);
      expect(postsBefore).toEqual([]);
    });

    it('should respect limit in cursor pagination', async () => {
      const cursorPost = posts[1];
      const limit = 1;
      const postsAfter = await PostMockController.fetchAfter(cursorPost.id, limit);

      expect(postsAfter.length).toBeLessThanOrEqual(limit);
    });
  });

  describe('Error Handling', () => {
    it('should handle database access', async () => {
      // Test if controller works with real database
      const count = await PostMockController.count();
      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });
});
