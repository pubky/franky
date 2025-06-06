import { describe, it, expect, beforeEach } from 'vitest';
import {
  Post,
  NexusPost,
  DEFAULT_POST_COUNTS,
  DEFAULT_POST_RELATIONSHIPS,
  Tag,
  resetDatabase,
  PostSchema,
  generateTestPostId,
  createTestPostDetails,
  generateTestUserId,
} from '@/core';

describe('Post Model', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  const testUserId = generateTestUserId(1);
  const testPostId = generateTestPostId(testUserId, 1);

  const mockNexusPost: NexusPost = {
    details: createTestPostDetails({
      id: testPostId,
      author: testUserId,
      content: 'This is a test post',
    }),
    counts: DEFAULT_POST_COUNTS,
    relationships: DEFAULT_POST_RELATIONSHIPS,
    tags: [
      new Tag({
        label: 'test-tag',
        taggers: [generateTestUserId(2)],
        taggers_count: 1,
        relationship: false,
      }),
    ],
    bookmark: null,
  };

  describe('Constructor and Properties', () => {
    it('should create a Post instance with all properties', () => {
      const post = new Post({
        ...mockNexusPost,
        id: mockNexusPost.details.id,
        indexed_at: null,
        created_at: Date.now(),
        sync_status: 'local',
        sync_ttl: Date.now() + 3600000,
      } as PostSchema);

      expect(post).toBeInstanceOf(Post);
      expect(post.details.id).toBe(testPostId);
      expect(post.details.content).toBe('This is a test post');
      expect(post.tags).toHaveLength(1);
      expect(post.tags[0]).toBeInstanceOf(Tag);
    });
  });

  describe('Static Methods', () => {
    it('should insert and find post by id', async () => {
      const post = await Post.insert(mockNexusPost);
      expect(post).toBeInstanceOf(Post);
      expect(post.details.id).toBe(testPostId);

      const foundPost = await Post.findById(testPostId);
      expect(foundPost).toBeInstanceOf(Post);
      expect(foundPost.details.id).toBe(testPostId);
      expect(foundPost.details.content).toBe('This is a test post');
    });

    it('should throw error for non-existent post', async () => {
      const nonExistentId = generateTestPostId('non-existent', 999);
      await expect(Post.findById(nonExistentId)).rejects.toThrow(`Post not found: ${nonExistentId}`);
    });

    it('should find posts by ids', async () => {
      const secondPostId = generateTestPostId(testUserId, 2);
      await Post.insert(mockNexusPost);
      await Post.insert({
        ...mockNexusPost,
        details: createTestPostDetails({
          id: secondPostId,
          author: testUserId,
          content: 'Second post',
        }),
      });

      const posts = await Post.find([testPostId, secondPostId]);
      expect(posts).toHaveLength(2);
      expect(posts[0]).toBeInstanceOf(Post);
      expect(posts[1]).toBeInstanceOf(Post);
    });

    it('should bulk save posts', async () => {
      const secondPostId = generateTestPostId(testUserId, 2);
      const postsData: NexusPost[] = [
        mockNexusPost,
        {
          ...mockNexusPost,
          details: createTestPostDetails({
            id: secondPostId,
            author: testUserId,
            content: 'Second post',
          }),
        },
      ];

      const results = await Post.bulkSave(postsData);
      expect(results).toHaveLength(2);
      results.forEach((post) => {
        expect(post).toBeInstanceOf(Post);
      });
    });

    it('should bulk delete posts', async () => {
      const secondPostId = generateTestPostId(testUserId, 2);
      await Post.insert(mockNexusPost);
      await Post.insert({
        ...mockNexusPost,
        details: createTestPostDetails({
          id: secondPostId,
          author: testUserId,
          content: 'Second post',
        }),
      });

      await Post.bulkDelete([testPostId, secondPostId]);

      // Posts with relationships are marked as deleted, not removed
      const post1 = await Post.findById(testPostId);
      const post2 = await Post.findById(secondPostId);
      expect(post1.details.content).toBe('[DELETED]');
      expect(post2.details.content).toBe('[DELETED]');
    });
  });

  describe('Instance Methods', () => {
    let post: Post;

    beforeEach(async () => {
      post = await Post.insert(mockNexusPost);
    });

    it('should save post to database', async () => {
      post.details.content = 'Updated content';
      await post.save();

      const foundPost = await Post.findById(testPostId);
      expect(foundPost.details.content).toBe('Updated content');
    });

    it('should edit post properties', async () => {
      await post.edit({
        details: { ...post.details, content: 'Edited content' },
      });

      expect(post.details.content).toBe('Edited content');

      const foundPost = await Post.findById(testPostId);
      expect(foundPost.details.content).toBe('Edited content');
    });

    it('should delete post completely when no relationships', async () => {
      // Create a post without relationships using helper
      const simplePostId = generateTestPostId(testUserId, 999);
      const simplePost = await Post.insert({
        details: createTestPostDetails({
          id: simplePostId,
          author: testUserId,
          content: 'Simple post',
        }),
        counts: DEFAULT_POST_COUNTS,
        relationships: DEFAULT_POST_RELATIONSHIPS,
        tags: [],
        bookmark: null,
      });

      await simplePost.delete();

      await expect(Post.findById(simplePostId)).rejects.toThrow(`Post not found: ${simplePostId}`);
    });

    it('should mark post as deleted when has relationships', async () => {
      await post.delete();

      const foundPost = await Post.findById(testPostId);
      expect(foundPost.details.content).toBe('[DELETED]');
    });
  });
});
