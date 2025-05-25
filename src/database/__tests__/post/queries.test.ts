import { beforeEach, describe, expect, it } from 'vitest';
import { postModel } from '@/database/models/post';
import {
  resetDatabase,
  generateTestUserId,
  generateTestPostId,
  createTestPost,
} from '@/test/helpers';

describe('PostModel Queries', () => {
  const TEST_USER_ID = generateTestUserId(0);
  const TEST_USER_ID_2 = generateTestUserId(1);
  const TEST_POST_ID = generateTestPostId(TEST_USER_ID, 0);

  beforeEach(async () => {
    await resetDatabase();
  });

  describe('getTags', () => {
    beforeEach(async () => {
      await createTestPost(TEST_USER_ID, 0);

      // Add multiple tags
      await postModel.tag('PUT', TEST_USER_ID_2, TEST_POST_ID, 'important');
      await postModel.tag('PUT', TEST_USER_ID_2, TEST_POST_ID, 'favorite');
      await postModel.tag('PUT', TEST_USER_ID_2, TEST_POST_ID, 'read-later');
    });

    it('should get all tags with default pagination', async () => {
      const tags = await postModel.getTags(TEST_POST_ID);

      expect(tags).toHaveLength(3);
      expect(tags.map(t => t.label)).toContain('important');
      expect(tags.map(t => t.label)).toContain('favorite');
      expect(tags.map(t => t.label)).toContain('read-later');
    });

    it('should respect pagination parameters', async () => {
      const tags = await postModel.getTags(TEST_POST_ID, 1, 2);

      expect(tags).toHaveLength(2);
    });

    it('should return empty array for non-existent post', async () => {
      const nonExistentId = generateTestPostId('non-existent-user', 0);
      const tags = await postModel.getTags(nonExistentId);

      expect(tags).toHaveLength(0);
    });
  });

  describe('getTaggers', () => {
    beforeEach(async () => {
      await createTestPost(TEST_USER_ID, 0);
      const TEST_USER_ID_3 = generateTestUserId(2);
      
      await postModel.tag('PUT', TEST_USER_ID_2, TEST_POST_ID, 'important');
      await postModel.tag('PUT', TEST_USER_ID_3, TEST_POST_ID, 'important');
    });

    it('should get all taggers for a specific tag', async () => {
      const taggers = await postModel.getTaggers(TEST_POST_ID, 'important');

      expect(taggers).toHaveLength(2);
      expect(taggers).toContain(TEST_USER_ID_2);
    });

    it('should return empty array for non-existent tag', async () => {
      const taggers = await postModel.getTaggers(TEST_POST_ID, 'non-existent-tag');

      expect(taggers).toHaveLength(0);
    });
  });

  describe('getReplies', () => {
    beforeEach(async () => {
      await createTestPost(TEST_USER_ID, 0);
    });

    it('should get all replies to a post', async () => {
      await postModel.reply(TEST_POST_ID, 'First reply');
      await postModel.reply(TEST_POST_ID, 'Second reply');

      const replies = await postModel.getReplies(TEST_POST_ID);

      expect(replies).toHaveLength(2);
      expect(replies[0].details.content).toBe('First reply');
      expect(replies[1].details.content).toBe('Second reply');
      expect(replies[0].details.kind).toBe('reply');
      expect(replies[1].details.kind).toBe('reply');
      expect(replies[0].relationships.replied).toBe(TEST_POST_ID);
      expect(replies[1].relationships.replied).toBe(TEST_POST_ID);
    });

    it('should return empty array for post with no replies', async () => {
      const newPostId = generateTestPostId(TEST_USER_ID, 1);
      await createTestPost(TEST_USER_ID, 1);

      const replies = await postModel.getReplies(newPostId);

      expect(replies).toHaveLength(0);
    });
  });

  describe('getPost', () => {
    it('should get complete post data', async () => {
      await createTestPost(TEST_USER_ID, 0);
      const post = await postModel.getPost(TEST_POST_ID);

      expect(post).toBeDefined();
      expect(post?.id).toBe(TEST_POST_ID);
      expect(post?.details).toBeDefined();
      expect(post?.counts).toBeDefined();
      expect(post?.relationships).toBeDefined();
      expect(post?.tags).toBeDefined();
      expect(post?.bookmarked).toBeDefined();
    });

    it('should return null for non-existent post', async () => {
      const nonExistentId = generateTestPostId('non-existent-user', 0);
      const post = await postModel.getPost(nonExistentId);

      expect(post).toBeNull();
    });
  });
}); 