import { beforeEach, describe, expect, it } from 'vitest';
import { postModel } from '@/database/models/post';
import { userModel } from '@/database/models/user';
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
      expect(post.bookmarked).toBe(false);
      expect(post.sync_status).toBe('local');
      expect(post.indexed_at).toBeNull();
      expect(post.updated_at).toBeDefined();
      expect(post.sync_ttl).toBeGreaterThan(post.updated_at);
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
      await postModel.delete(TEST_POST_ID);

      const post = await postModel.getPost(TEST_POST_ID);
      expect(post).toBeNull();
    });
  });

  describe('edit', () => {
    it('should update post details', async () => {
      await createTestPost(TEST_USER_ID, 0);

      const updates = {
        content: 'Updated content',
        attachments: ['new.jpg'],
      };

      await postModel.edit(TEST_POST_ID, updates);

      const post = await postModel.getPost(TEST_POST_ID);
      expect(post?.details.content).toBe(updates.content);
      expect(post?.details.attachments).toEqual(updates.attachments);
    });
  });

  describe('tag', () => {
    beforeEach(async () => {
      await createTestPost(TEST_USER_ID, 0);
    });

    it('should add a new tag', async () => {
      await postModel.tag('PUT', TEST_USER_ID_2, TEST_POST_ID, 'important');

      const post = await postModel.getPost(TEST_POST_ID);
      const tag = post?.tags[0];

      expect(tag?.label).toBe('important');
      expect(tag?.taggers).toContain(TEST_USER_ID_2);
      expect(tag?.taggers_count).toBe(1);
      expect(post?.counts.tags).toBe(1);
      expect(post?.counts.unique_tags).toBe(1);
    });

    it('should update existing tag', async () => {
      await postModel.tag('PUT', TEST_USER_ID_2, TEST_POST_ID, 'important');
      await postModel.tag('PUT', TEST_USER_ID, TEST_POST_ID, 'important');

      const post = await postModel.getPost(TEST_POST_ID);
      const tag = post?.tags[0];

      expect(tag?.taggers).toHaveLength(2);
      expect(tag?.taggers_count).toBe(2);
      expect(post?.counts.tags).toBe(2);
      expect(post?.counts.unique_tags).toBe(1);
    });

    it('should remove tag', async () => {
      await postModel.tag('PUT', TEST_USER_ID_2, TEST_POST_ID, 'important');
      await postModel.tag('DEL', TEST_USER_ID_2, TEST_POST_ID, 'important');

      const post = await postModel.getPost(TEST_POST_ID);
      
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
      await postModel.bookmark('PUT', TEST_USER_ID_2, TEST_POST_ID);

      const post = await postModel.getPost(TEST_POST_ID);
      const user = await userModel.getUser(TEST_USER_ID_2);
      
      expect(post?.bookmarked).toBe(true);
      expect(user?.counts.bookmarks).toBe(1);
    });

    it('should unbookmark a post', async () => {
      await postModel.bookmark('PUT', TEST_USER_ID_2, TEST_POST_ID);
      await postModel.bookmark('DEL', TEST_USER_ID_2, TEST_POST_ID);

      const post = await postModel.getPost(TEST_POST_ID);
      const user = await userModel.getUser(TEST_USER_ID_2);
      
      expect(post?.bookmarked).toBe(false);
      expect(user?.counts.bookmarks).toBe(0);
    });
  });

  describe('repost', () => {
    beforeEach(async () => {
      await createTestPost(TEST_USER_ID, 0);
    });

    it('should create a repost and update original post counts', async () => {
      const content = 'Reposting this!';
      await postModel.repost(TEST_POST_ID, content);

      // Check original post
      const originalPost = await postModel.getPost(TEST_POST_ID);
      expect(originalPost?.counts.reposts).toBe(1);

      // Find the repost
      const reposts = await postModel.getReposts(TEST_POST_ID);

      expect(reposts).toHaveLength(1);
      const repost = reposts[0];

      // Check repost properties
      expect(repost.details.kind).toBe('repost');
      expect(repost.details.content).toBe(content);
      expect(repost.relationships.repost).toBe(TEST_POST_ID);
      expect(repost.details.author).toBe(TEST_USER_ID);
      expect(repost.id).toMatch(new RegExp(`^${TEST_USER_ID}:repost-\\d+-\\d+$`));
      expect(repost.details.uri).toBe(`repost://${TEST_POST_ID}`);
    });

    it('should handle multiple reposts of the same post', async () => {
      // Create two reposts
      await postModel.repost(TEST_POST_ID, 'First repost');
      await postModel.repost(TEST_POST_ID, 'Second repost');

      // Check original post
      const originalPost = await postModel.getPost(TEST_POST_ID);
      expect(originalPost?.counts.reposts).toBe(2);

      // Find all reposts
      const reposts = await postModel.getReposts(TEST_POST_ID);

      expect(reposts).toHaveLength(2);
      expect(reposts[0].details.content).toBe('First repost');
      expect(reposts[1].details.content).toBe('Second repost');
    });

    it('should not create repost for non-existent post', async () => {
      const nonExistentId = generateTestPostId('non-existent-user', 0);
      await postModel.repost(nonExistentId, 'Should not work');

      // Check that no repost was created
      const reposts = await postModel.getAllReposts();

      expect(reposts).toHaveLength(0);
    });

    it('should maintain repost count integrity after post deletion', async () => {
      // Create a repost
      await postModel.repost(TEST_POST_ID, 'Repost to be orphaned');
      
      // Delete original post
      await postModel.delete(TEST_POST_ID);

      // Check that repost still exists but is orphaned
      const reposts = await postModel.getReposts(TEST_POST_ID);

      expect(reposts).toHaveLength(1);
      expect(reposts[0].relationships.repost).toBe(TEST_POST_ID);
    });

    it('should create repost with correct initial state', async () => {
      await postModel.repost(TEST_POST_ID, 'Test repost');

      const reposts = await postModel.getReposts(TEST_POST_ID);

      const repost = reposts[0];

      // Check that repost has correct initial state
      expect(repost.counts).toEqual({
        tags: 0,
        unique_tags: 0,
        replies: 0,
        reposts: 0,
      });
      expect(repost.tags).toHaveLength(0);
      expect(repost.bookmarked).toBe(false);
      expect(repost.indexed_at).toBeNull();
      expect(repost.sync_status).toBe('local');
      expect(repost.sync_ttl).toBeGreaterThan(repost.updated_at);
    });

    it('should allow interactions with reposts', async () => {
      // Create a repost
      await postModel.repost(TEST_POST_ID, 'Original repost');
      
      // Find the repost
      const reposts = await postModel.getReposts(TEST_POST_ID);

      const repost = reposts[0];

      // Test that we can interact with the repost
      await postModel.tag('PUT', TEST_USER_ID_2, repost.id, 'test-tag');
      await postModel.bookmark('PUT', TEST_USER_ID_2, repost.id);
      await postModel.reply(repost.id, 'Reply to repost');

      // Check that interactions worked
      const updatedRepost = await postModel.getPost(repost.id);
      expect(updatedRepost?.counts.tags).toBe(1);
      expect(updatedRepost?.bookmarked).toBe(true);
      expect(updatedRepost?.counts.replies).toBe(1);
    });
  });

  describe('reply', () => {
    beforeEach(async () => {
      await createTestPost(TEST_USER_ID, 0);
    });

    it('should create a reply', async () => {
      const comment = 'Great post!';
      await postModel.reply(TEST_POST_ID, comment);

      const post = await postModel.getPost(TEST_POST_ID);
      const replies = await postModel.getReplies(TEST_POST_ID);
      
      expect(post?.counts.replies).toBe(1);
      expect(replies).toHaveLength(1);
      expect(replies[0].details.content).toBe(comment);
      expect(replies[0].details.kind).toBe('reply');
      expect(replies[0].relationships.replied).toBe(TEST_POST_ID);
    });
  });
}); 