import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PostController } from '../controllers/post';
import { UserController } from '../controllers/user';
import { db } from '@/database';
import { type Post } from '../schemas/post';
import { type User } from '../schemas/user';

describe('Post-User Relationship Tests', () => {
  let testUser: User;
  let testPost: Post;

  beforeEach(async () => {
    // Create a test user
    testUser = await UserController.create({
      details: {
        name: 'Test User',
        bio: 'Test Bio',
        image: 'test.jpg',
        links: [],
        status: 'Testing',
        id: 'user:test',
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
      relationship: {
        following: false,
        followed_by: false,
        muted: false,
      },
    });

    // Create a test post
    testPost = await PostController.create({
      details: {
        id: `${testUser.id}:post-1`,
        indexed_at: Date.now(),
        author: testUser.id,
        content: 'Test post content',
        kind: 'short',
        uri: 'post://test-1',
        attachments: [],
      },
      counts: {
        tags: 0,
        unique_tags: 0,
        replies: 0,
        reposts: 0,
      },
      relationships: {
        mentioned: [],
        replied: null,
        reposted: null,
      },
      bookmark: null,
      tags: [],
    });
  });

  afterEach(async () => {
    // Clean up the database after each test
    await db.delete();
    await db.open();
  });

  describe('Post Creation and Deletion', () => {
    it('should increment user post count when creating a post', async () => {
      const user = await UserController.getUser(testUser.id);
      expect(user?.counts.posts).toBe(1);
    });

    it('should decrement user post count when deleting a post', async () => {
      await PostController.delete(testUser.id, testPost.id);
      const user = await UserController.getUser(testUser.id);
      expect(user?.counts.posts).toBe(0);
    });
  });

  describe('Post Tags', () => {
    it('should update user tag counts when adding tags', async () => {
      // Add a tag
      await PostController.tag('PUT', testUser.id, testPost.id, 'test-tag');

      const user = await UserController.getUser(testUser.id);
      const post = await PostController.getPost(testPost.id);

      expect(user?.counts.tags).toBe(1);
      expect(user?.counts.unique_tags).toBe(1);
      expect(post?.counts.tags).toBe(1);
      expect(post?.counts.unique_tags).toBe(1);
    });

    it('should update user tag counts when removing tags', async () => {
      // Add and then remove a tag
      await PostController.tag('PUT', testUser.id, testPost.id, 'test-tag');
      await PostController.tag('DEL', testUser.id, testPost.id, 'test-tag');

      const user = await UserController.getUser(testUser.id);
      const post = await PostController.getPost(testPost.id);

      expect(user?.counts.tags).toBe(0);
      expect(user?.counts.unique_tags).toBe(0);
      expect(post?.counts.tags).toBe(0);
      expect(post?.counts.unique_tags).toBe(0);
    });

    it('should handle multiple tags correctly', async () => {
      // Add multiple tags
      await PostController.tag('PUT', testUser.id, testPost.id, 'tag1');
      await PostController.tag('PUT', testUser.id, testPost.id, 'tag2');

      const user = await UserController.getUser(testUser.id);
      const post = await PostController.getPost(testPost.id);

      expect(user?.counts.tags).toBe(2);
      expect(user?.counts.unique_tags).toBe(2);
      expect(post?.counts.tags).toBe(2);
      expect(post?.counts.unique_tags).toBe(2);
    });
  });

  describe('Post Bookmarks', () => {
    it('should update user bookmark count when bookmarking a post', async () => {
      await PostController.bookmark('PUT', testUser.id, testPost.id);

      const user = await UserController.getUser(testUser.id);
      const post = await PostController.getPost(testPost.id);

      expect(user?.counts.bookmarks).toBe(1);
      expect(post?.bookmark).toBe(true);
    });

    it('should update user bookmark count when removing bookmark', async () => {
      // Add and then remove bookmark
      await PostController.bookmark('PUT', testUser.id, testPost.id);
      await PostController.bookmark('DEL', testUser.id, testPost.id);

      const user = await UserController.getUser(testUser.id);
      const post = await PostController.getPost(testPost.id);

      expect(user?.counts.bookmarks).toBe(0);
      expect(post?.bookmark).toBe(false);
    });
  });

  describe('Complex Interactions', () => {
    it('should handle multiple interactions correctly', async () => {
      // Create multiple interactions
      await PostController.tag('PUT', testUser.id, testPost.id, 'tag1');
      await PostController.bookmark('PUT', testUser.id, testPost.id);

      const user = await UserController.getUser(testUser.id);
      const post = await PostController.getPost(testPost.id);

      // Check all counters
      expect(user?.counts.posts).toBe(1);
      expect(user?.counts.tags).toBe(1);
      expect(user?.counts.unique_tags).toBe(1);
      expect(user?.counts.bookmarks).toBe(1);
      expect(user?.counts.replies).toBe(1);

      expect(post?.counts.tags).toBe(1);
      expect(post?.counts.unique_tags).toBe(1);
      expect(post?.counts.replies).toBe(1);
      expect(post?.bookmark).toBe(true);
    });

    it('should maintain counter integrity after deletions', async () => {
      // Create interactions
      await PostController.tag('PUT', testUser.id, testPost.id, 'tag1');
      await PostController.bookmark('PUT', testUser.id, testPost.id);

      // Delete the post
      await PostController.delete(testUser.id, testPost.id);

      const user = await UserController.getUser(testUser.id);

      // All counters should be reset
      expect(user?.counts.posts).toBe(0);
      expect(user?.counts.tags).toBe(0);
      expect(user?.counts.unique_tags).toBe(0);
      expect(user?.counts.bookmarks).toBe(0);
      // Note: replies count remains as they are separate posts
      expect(user?.counts.replies).toBe(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle non-existent post gracefully', async () => {
      await expect(PostController.tag('PUT', testUser.id, 'non:existent:post', 'tag1')).resolves.not.toThrow();

      const user = await UserController.getUser(testUser.id);
      expect(user?.counts.tags).toBe(0);
    });

    it('should handle non-existent user gracefully', async () => {
      await expect(PostController.tag('PUT', 'user:nonexistent', testPost.id, 'tag1')).resolves.not.toThrow();

      const post = await PostController.getPost(testPost.id);
      expect(post?.counts.tags).toBe(0);
    });

    it('should prevent counters from going negative', async () => {
      // Try to remove a non-existent bookmark
      await PostController.bookmark('DEL', testUser.id, testPost.id);

      const user = await UserController.getUser(testUser.id);
      expect(user?.counts.bookmarks).toBe(0);
    });
  });
});
