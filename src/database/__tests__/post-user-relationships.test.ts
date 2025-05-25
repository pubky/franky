import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { postModel } from '../models/post';
import { userModel } from '../models/user';
import db from '@/database';
import { type Post } from '../schemas/post';
import { type User } from '../schemas/user';

describe('Post-User Relationship Tests', () => {
  let testUser: User;
  let testPost: Post;

  beforeEach(async () => {
    // Create a test user
    testUser = await userModel.new('user:test', {
      name: 'Test User',
      bio: 'Test Bio',
      image: 'test.jpg',
      links: [],
      status: 'Testing'
    });

    // Create a test post
    testPost = await postModel.new({
      id: `${testUser.id}:post-1`,
      details: {
        author: testUser.id,
        content: 'Test post content',
        kind: 'post',
        uri: 'post://test-1',
        attachments: [],
        indexed_at: Date.now(),
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
        repost: null,
      },
      tags: [],
      bookmarked: false,
      indexed_at: null,
      updated_at: Date.now(),
      sync_status: 'local',
      sync_ttl: Date.now() + 3600000,
    });
  });

  afterEach(async () => {
    // Clean up the database after each test
    await db.delete();
    await db.open();
  });

  describe('Post Creation and Deletion', () => {
    it('should increment user post count when creating a post', async () => {
      const user = await userModel.getUser(testUser.id);
      expect(user?.counts.posts).toBe(1);
    });

    it('should decrement user post count when deleting a post', async () => {
      await postModel.delete(testPost.id);
      const user = await userModel.getUser(testUser.id);
      expect(user?.counts.posts).toBe(0);
    });
  });

  describe('Post Tags', () => {
    it('should update user tag counts when adding tags', async () => {
      // Add a tag
      await postModel.tag('PUT', testUser.id, testPost.id, 'test-tag');
      
      const user = await userModel.getUser(testUser.id);
      const post = await postModel.getPost(testPost.id);

      expect(user?.counts.tags).toBe(1);
      expect(user?.counts.unique_tags).toBe(1);
      expect(post?.counts.tags).toBe(1);
      expect(post?.counts.unique_tags).toBe(1);
    });

    it('should update user tag counts when removing tags', async () => {
      // Add and then remove a tag
      await postModel.tag('PUT', testUser.id, testPost.id, 'test-tag');
      await postModel.tag('DEL', testUser.id, testPost.id, 'test-tag');
      
      const user = await userModel.getUser(testUser.id);
      const post = await postModel.getPost(testPost.id);

      expect(user?.counts.tags).toBe(0);
      expect(user?.counts.unique_tags).toBe(0);
      expect(post?.counts.tags).toBe(0);
      expect(post?.counts.unique_tags).toBe(0);
    });

    it('should handle multiple tags correctly', async () => {
      // Add multiple tags
      await postModel.tag('PUT', testUser.id, testPost.id, 'tag1');
      await postModel.tag('PUT', testUser.id, testPost.id, 'tag2');
      
      const user = await userModel.getUser(testUser.id);
      const post = await postModel.getPost(testPost.id);

      expect(user?.counts.tags).toBe(2);
      expect(user?.counts.unique_tags).toBe(2);
      expect(post?.counts.tags).toBe(2);
      expect(post?.counts.unique_tags).toBe(2);
    });
  });

  describe('Post Bookmarks', () => {
    it('should update user bookmark count when bookmarking a post', async () => {
      await postModel.bookmark('PUT', testUser.id, testPost.id);
      
      const user = await userModel.getUser(testUser.id);
      const post = await postModel.getPost(testPost.id);

      expect(user?.counts.bookmarks).toBe(1);
      expect(post?.bookmarked).toBe(true);
    });

    it('should update user bookmark count when removing bookmark', async () => {
      // Add and then remove bookmark
      await postModel.bookmark('PUT', testUser.id, testPost.id);
      await postModel.bookmark('DEL', testUser.id, testPost.id);
      
      const user = await userModel.getUser(testUser.id);
      const post = await postModel.getPost(testPost.id);

      expect(user?.counts.bookmarks).toBe(0);
      expect(post?.bookmarked).toBe(false);
    });
  });

  describe('Post Replies', () => {
    it('should update user reply count and create reply post', async () => {
      await postModel.reply(testPost.id, 'Test reply');
      
      const user = await userModel.getUser(testUser.id);
      const originalPost = await postModel.getPost(testPost.id);
      const replies = await postModel.getReplies(testPost.id);

      expect(user?.counts.replies).toBe(1);
      expect(originalPost?.counts.replies).toBe(1);
      expect(replies.length).toBe(1);
      expect(replies[0].details.kind).toBe('reply');
    });

    it('should handle multiple replies correctly', async () => {
      await postModel.reply(testPost.id, 'Reply 1');
      await postModel.reply(testPost.id, 'Reply 2');
      
      const user = await userModel.getUser(testUser.id);
      const originalPost = await postModel.getPost(testPost.id);
      const replies = await postModel.getReplies(testPost.id);

      expect(user?.counts.replies).toBe(2);
      expect(originalPost?.counts.replies).toBe(2);
      expect(replies.length).toBe(2);
    });
  });

  describe('Complex Interactions', () => {
    it('should handle multiple interactions correctly', async () => {
      // Create multiple interactions
      await postModel.tag('PUT', testUser.id, testPost.id, 'tag1');
      await postModel.bookmark('PUT', testUser.id, testPost.id);
      await postModel.reply(testPost.id, 'Test reply');
      
      const user = await userModel.getUser(testUser.id);
      const post = await postModel.getPost(testPost.id);

      // Check all counters
      expect(user?.counts.posts).toBe(1);
      expect(user?.counts.tags).toBe(1);
      expect(user?.counts.unique_tags).toBe(1);
      expect(user?.counts.bookmarks).toBe(1);
      expect(user?.counts.replies).toBe(1);

      expect(post?.counts.tags).toBe(1);
      expect(post?.counts.unique_tags).toBe(1);
      expect(post?.counts.replies).toBe(1);
      expect(post?.bookmarked).toBe(true);
    });

    it('should maintain counter integrity after deletions', async () => {
      // Create interactions
      await postModel.tag('PUT', testUser.id, testPost.id, 'tag1');
      await postModel.bookmark('PUT', testUser.id, testPost.id);
      await postModel.reply(testPost.id, 'Test reply');

      // Delete the post
      await postModel.delete(testPost.id);
      
      const user = await userModel.getUser(testUser.id);

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
      await expect(postModel.tag('PUT', testUser.id, 'non:existent:post', 'tag1'))
        .resolves
        .not.toThrow();

      const user = await userModel.getUser(testUser.id);
      expect(user?.counts.tags).toBe(0);
    });

    it('should handle non-existent user gracefully', async () => {
      await expect(postModel.tag('PUT', 'user:nonexistent', testPost.id, 'tag1'))
        .resolves
        .not.toThrow();

      const post = await postModel.getPost(testPost.id);
      expect(post?.counts.tags).toBe(0);
    });

    it('should prevent counters from going negative', async () => {
      // Try to remove a non-existent bookmark
      await postModel.bookmark('DEL', testUser.id, testPost.id);
      
      const user = await userModel.getUser(testUser.id);
      expect(user?.counts.bookmarks).toBe(0);
    });
  });
}); 