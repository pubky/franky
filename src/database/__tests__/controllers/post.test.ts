import { describe, it, expect, beforeEach } from 'vitest';
import { PostController } from '../../controllers/post';
import { Post } from '../../model/post';
import { type NexusPost } from '@/services/nexus/types';
import { DEFAULT_POST_COUNTS, DEFAULT_POST_RELATIONSHIPS } from '../../schemas/defaults/post';
import { generateTestUserId, generateTestPostId, createTestPostDetails, resetDatabase } from '@/test/helpers';

describe('PostController', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  const testUserId = generateTestUserId(1);
  const testPostId1 = generateTestPostId(testUserId, 1);
  const testPostId2 = generateTestPostId(testUserId, 2);

  const mockNexusPost: NexusPost = {
    details: createTestPostDetails({
      id: testPostId1,
      author: testUserId,
      content: 'This is a test post',
    }),
    counts: DEFAULT_POST_COUNTS,
    relationships: DEFAULT_POST_RELATIONSHIPS,
    tags: [],
    bookmark: null,
  };

  const mockPost2: NexusPost = {
    details: createTestPostDetails({
      id: testPostId2,
      author: testUserId,
      content: 'Second post',
    }),
    counts: DEFAULT_POST_COUNTS,
    relationships: DEFAULT_POST_RELATIONSHIPS,
    tags: [],
    bookmark: null,
  };

  describe('Basic CRUD Operations', () => {
    it('should save and get post by id', async () => {
      const savedPost = await PostController.save(mockNexusPost);
      expect(savedPost).toBeInstanceOf(Post);
      expect(savedPost.details.id).toBe(testPostId1);

      const retrievedPost = await PostController.get(testPostId1);
      expect(retrievedPost).toBeInstanceOf(Post);
      expect(retrievedPost.details.id).toBe(testPostId1);
      expect(retrievedPost.details.content).toBe('This is a test post');
    });

    it('should throw error for non-existent post', async () => {
      const nonExistentId = generateTestPostId('non-existent', 999);
      await expect(PostController.get(nonExistentId)).rejects.toThrow(`Post not found: ${nonExistentId}`);
    });

    it('should get posts by ids', async () => {
      await PostController.save(mockNexusPost);
      await PostController.save(mockPost2);

      const posts = await PostController.getByIds([testPostId1, testPostId2]);

      expect(posts).toHaveLength(2);
      expect(posts[0]).toBeInstanceOf(Post);
      expect(posts[1]).toBeInstanceOf(Post);
      expect(posts.map((p) => p.details.id)).toContain(testPostId1);
      expect(posts.map((p) => p.details.id)).toContain(testPostId2);
    });

    it('should update existing post when saving with same id', async () => {
      await PostController.save(mockNexusPost);

      const updatedPostData = {
        ...mockNexusPost,
        details: createTestPostDetails({
          id: testPostId1,
          author: testUserId,
          content: 'Updated content',
        }),
      };

      const updatedPost = await PostController.save(updatedPostData);
      expect(updatedPost.details.content).toBe('Updated content');
    });

    it('should delete post completely when no relationships', async () => {
      await PostController.save(mockNexusPost);

      await PostController.delete(testPostId1);

      await expect(PostController.get(testPostId1)).rejects.toThrow(`Post not found: ${testPostId1}`);
    });
  });

  describe('Bulk Operations', () => {
    it('should bulk save posts', async () => {
      const postsData = [mockNexusPost, mockPost2];

      const results = await PostController.bulkSave(postsData);

      expect(results).toHaveLength(2);
      results.forEach((post) => {
        expect(post).toBeInstanceOf(Post);
      });

      // Verify posts are saved
      const post1 = await PostController.get(testPostId1);
      const post2 = await PostController.get(testPostId2);
      expect(post1.details.content).toBe('This is a test post');
      expect(post2.details.content).toBe('Second post');
    });

    it('should bulk delete posts', async () => {
      await PostController.save(mockNexusPost);
      await PostController.save(mockPost2);

      await PostController.bulkDelete([testPostId1, testPostId2]);

      await expect(PostController.get(testPostId1)).rejects.toThrow();
      await expect(PostController.get(testPostId2)).rejects.toThrow();
    });

    it('should continue bulk operations even if some fail', async () => {
      await PostController.save(mockNexusPost);

      const nonExistentId = generateTestPostId('non-existent', 999);
      // Try to bulk delete both existing and non-existing posts
      await PostController.bulkDelete([testPostId1, nonExistentId]);

      // Should not throw, just continue
      await expect(PostController.get(testPostId1)).rejects.toThrow();
    });
  });
});
