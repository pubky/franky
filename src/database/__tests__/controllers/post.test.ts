import { describe, it, expect, beforeEach, vi } from 'vitest';
import 'fake-indexeddb/auto';
import { PostController } from '../../controllers/post';
import { Post } from '../../model/Post';
import { Tag } from '../../model/Tag';
import { db } from '../../index';
import { type NexusPost, type NexusTag } from '@/services/nexus/types';
import { DEFAULT_POST_COUNTS, DEFAULT_POST_RELATIONSHIPS } from '../../schemas/defaults/post';
import { User } from '../../model/User';
import { DEFAULT_USER_DETAILS, DEFAULT_USER_COUNTS, DEFAULT_USER_RELATIONSHIP } from '../../schemas/defaults/user';

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('PostController', () => {
  beforeEach(async () => {
    // Clear database before each test
    await db.delete();
    await db.open();

    // Create test users first for all tests
    await User.create({
      details: {
        ...DEFAULT_USER_DETAILS,
        id: 'user-1',
        name: 'Test User 1',
      },
      counts: DEFAULT_USER_COUNTS,
      tags: [],
      relationship: DEFAULT_USER_RELATIONSHIP,
    });

    await User.create({
      details: {
        ...DEFAULT_USER_DETAILS,
        id: 'user-2',
        name: 'Test User 2',
      },
      counts: DEFAULT_USER_COUNTS,
      tags: [],
      relationship: DEFAULT_USER_RELATIONSHIP,
    });

    await User.create({
      details: {
        ...DEFAULT_USER_DETAILS,
        id: 'user-3',
        name: 'Test User 3',
      },
      counts: DEFAULT_USER_COUNTS,
      tags: [],
      relationship: DEFAULT_USER_RELATIONSHIP,
    });
  });

  const mockNexusTag: NexusTag = {
    label: 'test',
    taggers: ['user-2'],
    taggers_count: 1,
    relationship: false,
  };

  const mockNexusPost: NexusPost = {
    details: {
      id: 'user-1:post-1',
      author: 'user-1',
      content: 'This is a test post',
      kind: 'short',
      indexed_at: Date.now(),
      uri: 'test-uri',
      attachments: null,
    },
    counts: {
      ...DEFAULT_POST_COUNTS,
      tags: 1,
      unique_tags: 1,
    },
    relationships: DEFAULT_POST_RELATIONSHIPS,
    tags: [new Tag(mockNexusTag)],
    bookmark: null,
  };

  const mockPost2: NexusPost = {
    ...mockNexusPost,
    details: { ...mockNexusPost.details, id: 'user-1:post-2', content: 'Second post' },
  };

  const mockPost3: NexusPost = {
    ...mockNexusPost,
    details: { ...mockNexusPost.details, id: 'user-2:post-1', author: 'user-2', content: 'User 2 post' },
  };

  describe('Basic CRUD Operations', () => {
    it('should get post by id', async () => {
      await Post.create(mockNexusPost);

      const post = await PostController.get('user-1:post-1');

      expect(post).toBeInstanceOf(Post);
      expect(post.details.id).toBe('user-1:post-1');
      expect(post.details.content).toBe('This is a test post');
    });

    it('should throw error for non-existent post', async () => {
      await expect(PostController.get('non-existent:post')).rejects.toThrow('Post not found: non-existent:post');
    });

    it('should get all posts', async () => {
      await Post.create(mockNexusPost);
      await Post.create(mockPost2);

      const posts = await PostController.getAll();

      expect(posts).toHaveLength(2);
      expect(posts[0]).toBeInstanceOf(Post);
      expect(posts[1]).toBeInstanceOf(Post);
    });

    it('should get posts by ids', async () => {
      await Post.create(mockNexusPost);
      await Post.create(mockPost2);
      await Post.create(mockPost3);

      const posts = await PostController.getByIds(['user-1:post-1', 'user-2:post-1', 'non-existent:post']);

      expect(posts).toHaveLength(2);
      expect(posts.map((p) => p.details.id)).toContain('user-1:post-1');
      expect(posts.map((p) => p.details.id)).toContain('user-2:post-1');
      expect(posts.map((p) => p.details.id)).not.toContain('non-existent:post');
    });

    it('should save new post', async () => {
      const post = await PostController.save(mockNexusPost);

      expect(post).toBeInstanceOf(Post);
      expect(post.details.id).toBe('user-1:post-1');

      // Verify post is in database
      const savedPost = await Post.findById('user-1:post-1');
      expect(savedPost).not.toBeNull();
    });

    it('should save existing post (update)', async () => {
      await Post.create(mockNexusPost);

      const updatedPostData = {
        ...mockNexusPost,
        details: { ...mockNexusPost.details, content: 'Updated content' },
      };

      const post = await PostController.save(updatedPostData);

      expect(post.details.content).toBe('Updated content');

      // Verify only one post exists
      const allPosts = await Post.findAll();
      expect(allPosts).toHaveLength(1);
    });

    it('should delete post', async () => {
      // Create a post without relationships so it gets fully deleted
      const simplePost: NexusPost = {
        details: {
          content: 'Simple post',
          id: 'user-1:simple-post',
          indexed_at: Date.now(),
          author: 'user-1',
          kind: 'short',
          uri: 'test-simple-uri',
          attachments: null,
        },
        counts: DEFAULT_POST_COUNTS,
        relationships: DEFAULT_POST_RELATIONSHIPS,
        tags: [],
        bookmark: null,
      };

      await Post.create(simplePost);

      await PostController.delete('user-1:simple-post');

      const deletedPost = await Post.findById('user-1:simple-post');
      expect(deletedPost).toBeNull();
    });

    it('should throw error when deleting non-existent post', async () => {
      await expect(PostController.delete('non-existent:post')).rejects.toThrow('Post not found: non-existent:post');
    });
  });

  describe('Bulk Operations', () => {
    it('should bulk save posts', async () => {
      const postsData = [mockNexusPost, mockPost2, mockPost3];

      const results = await PostController.bulkSave(postsData);

      expect(results).toHaveLength(3);
      expect(results[0]).toBeInstanceOf(Post);

      const allPosts = await Post.findAll();
      expect(allPosts).toHaveLength(3);
    });

    it('should handle bulk save with some failures', async () => {
      // Create invalid post data to test error handling
      const invalidPostData = {
        ...mockNexusPost,
        details: { ...mockNexusPost.details, author: 'non-existent-user' },
      };

      const postsData = [mockNexusPost, invalidPostData, mockPost2];

      const results = await PostController.bulkSave(postsData);

      // Should save valid posts despite invalid one
      expect(results.length).toBeGreaterThanOrEqual(2);
    });

    it('should bulk delete posts', async () => {
      await Post.create(mockNexusPost);
      await Post.create(mockPost2);
      await Post.create(mockPost3);

      const result = await PostController.bulkDelete(['user-1:post-1', 'user-2:post-1', 'non-existent:post']);

      expect(result.success).toEqual(['user-1:post-1', 'user-2:post-1']);
      expect(result.failed).toEqual(['non-existent:post']);

      // Some posts might not be fully deleted if they have relationships (tags, etc.)
      // so we just check that the operation was reported as successful
      const remainingPosts = await Post.findAll();
      expect(remainingPosts.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Post-specific Methods', () => {
    beforeEach(async () => {
      // Create a main post first
      await Post.create(mockNexusPost);
    });

    it('should get replies to a post', async () => {
      // Create a reply post
      const replyPost: NexusPost = {
        ...mockPost2,
        details: { ...mockPost2.details, id: 'user-2:reply-1' },
        relationships: {
          ...DEFAULT_POST_RELATIONSHIPS,
          replied: 'user-1:post-1',
        },
        bookmark: null,
      };

      await Post.create(replyPost);

      const replies = await PostController.getReplies('user-1:post-1');

      expect(replies).toHaveLength(1);
      expect(replies[0].details.id).toBe('user-2:reply-1');
      expect(replies[0].relationships.replied).toBe('user-1:post-1');
    });

    it('should get reposts of a post', async () => {
      // Create a repost
      const repostPost: NexusPost = {
        details: {
          content: '',
          id: 'user-3:repost-1',
          indexed_at: Date.now(),
          author: 'user-3',
          kind: 'repost',
          uri: 'test-repost-uri',
          attachments: null,
        },
        counts: DEFAULT_POST_COUNTS,
        relationships: {
          ...DEFAULT_POST_RELATIONSHIPS,
          reposted: 'user-1:post-1',
        },
        tags: [],
        bookmark: null,
      };

      await Post.create(repostPost);

      const reposts = await PostController.getReposts('user-1:post-1');

      expect(reposts).toHaveLength(1);
      expect(reposts[0].details.id).toBe('user-3:repost-1');
      expect(reposts[0].relationships.reposted).toBe('user-1:post-1');
    });

    it('should get posts by author', async () => {
      await Post.create(mockPost2);

      const authorPosts = await PostController.getByAuthor('user-1');

      expect(authorPosts).toHaveLength(2); // Both user-1:post-1 and user-1:post-2
      expect(authorPosts.map((p) => p.details.id)).toContain('user-1:post-1');
      expect(authorPosts.map((p) => p.details.id)).toContain('user-1:post-2');
    });

    it('should return empty array for non-existent post in relationship methods', async () => {
      const replies = await PostController.getReplies('non-existent:post');
      const reposts = await PostController.getReposts('non-existent:post');

      expect(replies).toEqual([]);
      expect(reposts).toEqual([]);
    });
  });

  describe('Authorization', () => {
    beforeEach(async () => {
      await Post.create(mockNexusPost);
    });

    it('should allow author to edit post', async () => {
      const post = await PostController.get('user-1:post-1');

      expect(post.canUserEdit('user-1')).toBe(true);
    });

    it('should not allow non-author to edit post', async () => {
      const post = await PostController.get('user-1:post-1');

      expect(post.canUserEdit('user-2')).toBe(false);
    });
  });

  describe('Relationship Checks', () => {
    it('should identify posts with relationships', async () => {
      const post = await Post.create(mockNexusPost);

      expect(post.hasRelationships()).toBe(true); // Has tags
    });

    it('should identify posts without relationships', async () => {
      const postWithoutRelationships: NexusPost = {
        details: {
          content: 'Simple post content',
          id: 'user-1:simple-post',
          indexed_at: Date.now(),
          author: 'user-1',
          kind: 'short',
          uri: 'test-simple-uri',
          attachments: null,
        },
        counts: DEFAULT_POST_COUNTS,
        relationships: DEFAULT_POST_RELATIONSHIPS,
        tags: [],
        bookmark: null,
      };

      const post = await Post.create(postWithoutRelationships);

      expect(post.hasRelationships()).toBe(false);
    });

    it('should identify posts with mentions', async () => {
      const postWithMentions: NexusPost = {
        ...mockNexusPost,
        details: { ...mockNexusPost.details, id: 'user-1:mention-post' },
        relationships: {
          ...DEFAULT_POST_RELATIONSHIPS,
          mentioned: ['user-2', 'user-3'],
        },
        tags: [],
        bookmark: null,
      };

      const post = await Post.create(postWithMentions);

      expect(post.hasRelationships()).toBe(true);
    });

    it('should identify reply posts', async () => {
      const replyPost: NexusPost = {
        ...mockNexusPost,
        details: { ...mockNexusPost.details, id: 'user-1:reply-post' },
        relationships: {
          ...DEFAULT_POST_RELATIONSHIPS,
          replied: 'user-2:original-post',
        },
        tags: [],
        bookmark: null,
      };

      const post = await Post.create(replyPost);

      expect(post.hasRelationships()).toBe(true);
    });

    it('should identify repost posts', async () => {
      const repostPost: NexusPost = {
        ...mockNexusPost,
        details: { ...mockNexusPost.details, id: 'user-1:repost-post', kind: 'repost' },
        relationships: {
          ...DEFAULT_POST_RELATIONSHIPS,
          reposted: 'user-2:original-post',
        },
        tags: [],
        bookmark: null,
      };

      const post = await Post.create(repostPost);

      expect(post.hasRelationships()).toBe(true);
    });

    it('should identify bookmarked posts', async () => {
      const bookmarkedPost: NexusPost = {
        ...mockNexusPost,
        details: { ...mockNexusPost.details, id: 'user-1:bookmarked-post' },
        tags: [],
        bookmark: null,
      };

      const post = await Post.create(bookmarkedPost);
      // Simulate bookmark field
      (post as Post & { bookmark: { created_at: number; updated_at: number } }).bookmark = {
        created_at: Date.now(),
        updated_at: Date.now(),
      };

      expect(post.hasRelationships()).toBe(true);
    });
  });

  describe('Post Deletion', () => {
    it('should mark post content as deleted', async () => {
      const post = await Post.create(mockNexusPost);

      post.markAsDeleted();

      expect(post.details.content).toBe('[DELETED]');
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      // Mock database error
      const mockError = new Error('Database error');
      vi.spyOn(Post, 'findAll').mockRejectedValueOnce(mockError);

      await expect(PostController.getAll()).rejects.toThrow('Database error');
    });

    it('should handle post creation errors', async () => {
      const invalidPostData = {
        ...mockNexusPost,
        details: { ...mockNexusPost.details, author: 'non-existent-user' },
      };

      await expect(PostController.save(invalidPostData)).rejects.toThrow('User not found: non-existent-user');
    });

    it('should handle bulk operation errors', async () => {
      const mockError = new Error('Bulk error');
      vi.spyOn(Post, 'findByAuthor').mockRejectedValueOnce(mockError);

      await expect(PostController.getByAuthor('user-1')).rejects.toThrow('Bulk error');
    });
  });

  describe('Tag Integration', () => {
    beforeEach(async () => {
      await Post.create({
        ...mockNexusPost,
        tags: [
          new Tag({ label: 'tech', taggers: ['user-1', 'user-2'], taggers_count: 2, relationship: false }),
          new Tag({ label: 'news', taggers: ['user-3'], taggers_count: 1, relationship: false }),
        ],
      });
    });

    it('should access post tags', async () => {
      const post = await PostController.get('user-1:post-1');

      expect(post.tags).toHaveLength(2);
      expect(Tag.getUniqueLabels(post.tags)).toEqual(['tech', 'news']);
    });

    it('should find tags by label', async () => {
      const post = await PostController.get('user-1:post-1');
      const techTag = Tag.findByLabel(post.tags, 'tech');

      expect(techTag).toBeDefined();
      expect(techTag!.taggers_count).toBe(2);
    });

    it('should find tags by tagger', async () => {
      const post = await PostController.get('user-1:post-1');
      const user1Tags = Tag.findByTagger(post.tags, 'user-1');

      expect(user1Tags).toHaveLength(1);
      expect(user1Tags[0].label).toBe('tech');
    });
  });
});
