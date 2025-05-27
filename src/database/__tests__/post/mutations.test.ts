import { beforeEach, describe, expect, it } from 'vitest';
import { PostController } from '@/database/controllers/post';
import { UserController } from '@/database/controllers/user';
import {
  resetDatabase,
  generateTestUserId,
  generateTestPostId,
  createTestPostDetails,
  createTestPost,
  createTestUsers,
} from '@/test/helpers';

describe('PostModel Mutations', () => {
  const TEST_USER_ID = generateTestUserId(0);
  const TEST_USER_ID_2 = generateTestUserId(1);
  const TEST_POST_ID = generateTestPostId(TEST_USER_ID, 0);

  beforeEach(async () => {
    await resetDatabase();
    // Create all test users first
    await createTestUsers(2);
  });

  describe('new', () => {
    it('should create a new post with default values', async () => {
      const post = await createTestPost(TEST_USER_ID, 0);

      expect(post.id).toBe(TEST_POST_ID);
      expect(post.details.content).toBe('Test content');
      expect(post.counts.tags).toBe(0);
      expect(post.counts.replies).toBe(0);
      expect(post.counts.reposts).toBe(0);
      expect(post.tags).toHaveLength(0);
      expect(post.bookmark).toBeNull();
      expect(post.sync_status).toBe('local');
      expect(post.indexed_at).toBeNull();
      expect(post.created_at).toBeDefined();
      expect(post.sync_ttl).toBeGreaterThan(post.created_at);
    });

    it('should create a new post with custom details', async () => {
      const details = createTestPostDetails({
        content: 'Custom content',
        attachments: ['file1.jpg'],
      });

      const post = await createTestPost(TEST_USER_ID, 0, details);

      expect(post.id).toBe(TEST_POST_ID);
      expect(post.details).toMatchObject(details);
    });
  });

  describe('delete', () => {
    it('should delete a post', async () => {
      await createTestPost(TEST_USER_ID, 0);
      await PostController.delete(TEST_USER_ID, TEST_POST_ID);

      const post = await PostController.getPost(TEST_POST_ID);
      expect(post).toBeNull();
    });
  });

  describe('tag', () => {
    beforeEach(async () => {
      await createTestPost(TEST_USER_ID, 0);
    });

    it('should add a new tag', async () => {
      await PostController.tag('PUT', TEST_USER_ID_2, TEST_POST_ID, 'important');

      const post = await PostController.getPost(TEST_POST_ID);
      const tag = post?.tags[0];

      expect(tag?.label).toBe('important');
      expect(tag?.taggers).toContain(TEST_USER_ID_2);
      expect(tag?.taggers_count).toBe(1);
      expect(post?.counts.tags).toBe(1);
      expect(post?.counts.unique_tags).toBe(1);
    });

    it('should update existing tag', async () => {
      await PostController.tag('PUT', TEST_USER_ID_2, TEST_POST_ID, 'important');
      await PostController.tag('PUT', TEST_USER_ID, TEST_POST_ID, 'important');

      const post = await PostController.getPost(TEST_POST_ID);
      const tag = post?.tags[0];

      expect(tag?.taggers).toHaveLength(2);
      expect(tag?.taggers_count).toBe(2);
      expect(post?.counts.tags).toBe(2);
      expect(post?.counts.unique_tags).toBe(1);
    });

    it('should remove tag', async () => {
      await PostController.tag('PUT', TEST_USER_ID_2, TEST_POST_ID, 'important');
      await PostController.tag('DEL', TEST_USER_ID_2, TEST_POST_ID, 'important');

      const post = await PostController.getPost(TEST_POST_ID);

      expect(post?.tags).toHaveLength(0);
      expect(post?.counts.tags).toBe(0);
      expect(post?.counts.unique_tags).toBe(0);
    });
  });

  describe('bookmark', () => {
    beforeEach(async () => {
      await createTestPost(TEST_USER_ID, 0);
    });

    it('should bookmark a post', async () => {
      await PostController.bookmark('PUT', TEST_USER_ID_2, TEST_POST_ID);

      const post = await PostController.getPost(TEST_POST_ID);
      const user = await UserController.getUser(TEST_USER_ID_2);

      expect(post?.bookmark).toBeDefined();
      expect(user?.counts.bookmarks).toBe(1);
    });

    it('should unbookmark a post', async () => {
      await PostController.bookmark('PUT', TEST_USER_ID_2, TEST_POST_ID);
      await PostController.bookmark('DEL', TEST_USER_ID_2, TEST_POST_ID);

      const post = await PostController.getPost(TEST_POST_ID);
      const user = await UserController.getUser(TEST_USER_ID_2);

      expect(post?.bookmark).toBeNull();
      expect(user?.counts.bookmarks).toBe(0);
    });
  });
});
