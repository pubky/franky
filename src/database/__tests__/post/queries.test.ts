import { beforeEach, describe, expect, it } from 'vitest';
import { PostController } from '@/database/controllers/post';
import { resetDatabase, generateTestUserId, generateTestPostId, createTestPost, createTestUsers } from '@/test/helpers';

describe('PostModel Queries', () => {
  const TEST_USER_ID = generateTestUserId(0);
  const TEST_USER_ID_2 = generateTestUserId(1);
  const TEST_USER_ID_3 = generateTestUserId(2);
  const TEST_POST_ID = generateTestPostId(TEST_USER_ID, 0);

  beforeEach(async () => {
    await resetDatabase();
    // Create all test users first
    await createTestUsers(3);
  });

  describe('getTags', () => {
    beforeEach(async () => {
      await createTestPost(TEST_USER_ID, 0);

      // Add multiple tags
      await PostController.tag('PUT', TEST_USER_ID_2, TEST_POST_ID, 'important');
      await PostController.tag('PUT', TEST_USER_ID_2, TEST_POST_ID, 'favorite');
      await PostController.tag('PUT', TEST_USER_ID_2, TEST_POST_ID, 'read-later');
    });

    it('should get all tags with default pagination', async () => {
      const tags = await PostController.getTags(TEST_POST_ID);

      expect(tags).toHaveLength(3);
      expect(tags.map((t) => t.label)).toContain('important');
      expect(tags.map((t) => t.label)).toContain('favorite');
      expect(tags.map((t) => t.label)).toContain('read-later');
    });

    it('should respect pagination parameters', async () => {
      const tags = await PostController.getTags(TEST_POST_ID, 1, 2);

      expect(tags).toHaveLength(2);
    });

    it('should return empty array for non-existent post', async () => {
      const nonExistentId = generateTestPostId('non-existent-user', 0);
      const tags = await PostController.getTags(nonExistentId);

      expect(tags).toHaveLength(0);
    });
  });

  describe('getTaggers', () => {
    beforeEach(async () => {
      await createTestPost(TEST_USER_ID, 0);

      await PostController.tag('PUT', TEST_USER_ID_2, TEST_POST_ID, 'important');
      await PostController.tag('PUT', TEST_USER_ID_3, TEST_POST_ID, 'important');
    });

    it('should get all taggers for a specific tag', async () => {
      const taggers = await PostController.getTaggers(TEST_POST_ID, 'important');

      expect(taggers).toHaveLength(2);
      expect(taggers).toContain(TEST_USER_ID_2);
    });

    it('should return empty array for non-existent tag', async () => {
      const taggers = await PostController.getTaggers(TEST_POST_ID, 'non-existent-tag');

      expect(taggers).toHaveLength(0);
    });
  });

  describe('getPost', () => {
    it('should get complete post data', async () => {
      await createTestPost(TEST_USER_ID, 0);
      const post = await PostController.getPost(TEST_POST_ID);

      expect(post).toBeDefined();
      expect(post?.id).toBe(TEST_POST_ID);
      expect(post?.details).toBeDefined();
      expect(post?.counts).toBeDefined();
      expect(post?.relationships).toBeDefined();
      expect(post?.tags).toBeDefined();
      expect(post?.bookmark).toBeDefined();
    });

    it('should return null for non-existent post', async () => {
      const nonExistentId = generateTestPostId('non-existent-user', 0);
      const post = await PostController.getPost(nonExistentId);

      expect(post).toBeNull();
    });
  });
});
