import { describe, it, expect, beforeEach, vi } from 'vitest';
import 'fake-indexeddb/auto';
import { Post } from '../../model/Post';
import { Tag } from '../../model/Tag';
import { db } from '../../index';
import { type NexusPost, type NexusTag } from '@/services/nexus/types';
import { DEFAULT_POST_COUNTS, DEFAULT_POST_RELATIONSHIPS } from '../../schemas/defaults/post';

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('Post Model', () => {
  beforeEach(async () => {
    // Clear database before each test
    await db.delete();
    await db.open();
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

  describe('Constructor', () => {
    it('should create a Post instance with all properties', () => {
      const postData = {
        ...mockNexusPost,
        indexed_at: null,
        created_at: Date.now(),
        sync_status: 'local' as const,
        sync_ttl: Date.now() + 1000,
      };

      const post = new Post(postData);

      expect(post.details.id).toBe('user-1:post-1');
      expect(post.details.content).toBe('This is a test post');
      expect(post.details.author).toBe('user-1');
      expect(post.tags).toHaveLength(1);
      expect(post.tags[0]).toBeInstanceOf(Tag);
      expect(post.counts.tags).toBe(1);
    });

    it('should convert tags to Tag instances', () => {
      const postData = {
        ...mockNexusPost,
        indexed_at: null,
        created_at: Date.now(),
        sync_status: 'local' as const,
        sync_ttl: Date.now() + 1000,
      };

      const post = new Post(postData);

      expect(post.tags[0]).toBeInstanceOf(Tag);
      expect(post.tags[0].label).toBe('test');
      expect(post.tags[0].taggers_count).toBe(1);
    });
  });

  describe('Database Operations', () => {
    it('should save post to database', async () => {
      const post = await Post.create(mockNexusPost);

      expect(post.details.id).toBe('user-1:post-1');

      // Verify post is in database
      const savedPost = await Post.findById('user-1:post-1');
      expect(savedPost).not.toBeNull();
      expect(savedPost!.details.content).toBe('This is a test post');
    });

    it('should delete post from database', async () => {
      const post = await Post.create(mockNexusPost);

      await post.delete();

      const deletedPost = await Post.findById('user-1:post-1');
      expect(deletedPost).toBeNull();
    });

    it('should edit post properties', async () => {
      const post = await Post.create(mockNexusPost);

      await post.edit({
        details: { ...post.details, content: 'Updated content' },
        counts: { ...post.counts, tags: 5 },
      });

      expect(post.details.content).toBe('Updated content');
      expect(post.counts.tags).toBe(5);

      // Verify changes persisted
      const updatedPost = await Post.findById('user-1:post-1');
      expect(updatedPost!.details.content).toBe('Updated content');
      expect(updatedPost!.counts.tags).toBe(5);
    });
  });

  describe('Static Methods', () => {
    it('should find post by id', async () => {
      await Post.create(mockNexusPost);

      const foundPost = await Post.findById('user-1:post-1');

      expect(foundPost).not.toBeNull();
      expect(foundPost!.details.id).toBe('user-1:post-1');
    });

    it('should return null for non-existent post', async () => {
      const foundPost = await Post.findById('non-existent:post');

      expect(foundPost).toBeNull();
    });

    it('should find all posts', async () => {
      await Post.create(mockNexusPost);
      await Post.create({
        ...mockNexusPost,
        details: { ...mockNexusPost.details, id: 'user-1:post-2' },
      });

      const posts = await Post.findAll();

      expect(posts).toHaveLength(2);
      expect(posts[0]).toBeInstanceOf(Post);
    });

    it('should create new post', async () => {
      const post = await Post.create(mockNexusPost);

      expect(post).toBeInstanceOf(Post);
      expect(post.details.id).toBe('user-1:post-1');
      expect(post.sync_status).toBe('local');
      expect(post.bookmark).toBeNull();
    });

    it('should remove duplicate tags when creating', async () => {
      const postWithDuplicateTags = {
        ...mockNexusPost,
        tags: [
          new Tag({ label: 'duplicate', taggers: ['user-1'], taggers_count: 1, relationship: false }),
          new Tag({ label: 'duplicate', taggers: ['user-2'], taggers_count: 1, relationship: false }),
          new Tag({ label: 'unique', taggers: ['user-3'], taggers_count: 1, relationship: false }),
        ],
      };

      const post = await Post.create(postWithDuplicateTags);

      expect(post.tags).toHaveLength(2);
      expect(Tag.getUniqueLabels(post.tags)).toEqual(['duplicate', 'unique']);
    });
  });

  describe('Post-specific Static Methods', () => {
    beforeEach(async () => {
      // Create main post
      await Post.create(mockNexusPost);

      // Create reply
      await Post.create({
        ...mockNexusPost,
        details: { ...mockNexusPost.details, id: 'user-2:reply-1', author: 'user-2' },
        relationships: {
          ...DEFAULT_POST_RELATIONSHIPS,
          replied: 'user-1:post-1',
        },
      });

      // Create repost
      await Post.create({
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
      });

      // Create another post by user-1
      await Post.create({
        ...mockNexusPost,
        details: { ...mockNexusPost.details, id: 'user-1:post-3', author: 'user-1' },
      });
    });

    it('should find replies to a post', async () => {
      const replies = await Post.findReplies('user-1:post-1');

      expect(replies).toHaveLength(1);
      expect(replies[0].details.id).toBe('user-2:reply-1');
      expect(replies[0].relationships.replied).toBe('user-1:post-1');
    });

    it('should find reposts of a post', async () => {
      const reposts = await Post.findReposts('user-1:post-1');

      expect(reposts).toHaveLength(1);
      expect(reposts[0].details.id).toBe('user-3:repost-1');
      expect(reposts[0].relationships.reposted).toBe('user-1:post-1');
    });

    it('should find posts by author', async () => {
      const authorPosts = await Post.findByAuthor('user-1');

      expect(authorPosts).toHaveLength(2);
      expect(authorPosts.map((p) => p.details.id)).toContain('user-1:post-1');
      expect(authorPosts.map((p) => p.details.id)).toContain('user-1:post-3');
    });
  });

  describe('Instance Methods', () => {
    let post: Post;

    beforeEach(async () => {
      post = await Post.create(mockNexusPost);
    });

    describe('canUserEdit', () => {
      it('should return true for post author', () => {
        expect(post.canUserEdit('user-1')).toBe(true);
      });

      it('should return false for non-author', () => {
        expect(post.canUserEdit('user-2')).toBe(false);
      });
    });

    describe('hasRelationships', () => {
      it('should return true when post has tags', () => {
        expect(post.hasRelationships()).toBe(true);
      });

      it('should return true when post has mentions', async () => {
        await post.edit({
          relationships: {
            ...post.relationships,
            mentioned: ['user-2', 'user-3'],
          },
        });

        expect(post.hasRelationships()).toBe(true);
      });

      it('should return true when post is a reply', async () => {
        await post.edit({
          relationships: {
            ...post.relationships,
            replied: 'user-2:original-post',
          },
          tags: [], // Remove tags
        });

        expect(post.hasRelationships()).toBe(true);
      });

      it('should return true when post is a repost', async () => {
        await post.edit({
          relationships: {
            ...post.relationships,
            reposted: 'user-2:original-post',
          },
          tags: [], // Remove tags
        });

        expect(post.hasRelationships()).toBe(true);
      });

      it('should return true when post has bookmark', async () => {
        post.bookmark = { created_at: Date.now(), updated_at: Date.now() };
        post.tags = []; // Remove tags

        expect(post.hasRelationships()).toBe(true);
      });

      it('should return false when post has no relationships', async () => {
        await post.edit({
          relationships: {
            mentioned: [],
            replied: null,
            reposted: null,
          },
          tags: [],
        });
        post.bookmark = null;

        expect(post.hasRelationships()).toBe(false);
      });
    });

    describe('markAsDeleted', () => {
      it('should mark post content as deleted', () => {
        post.markAsDeleted();

        expect(post.details.content).toBe('[DELETED]');
      });
    });
  });

  describe('Tag Integration', () => {
    let post: Post;

    beforeEach(async () => {
      post = await Post.create({
        ...mockNexusPost,
        tags: [
          new Tag({ label: 'tech', taggers: ['user-1', 'user-2'], taggers_count: 2, relationship: false }),
          new Tag({ label: 'news', taggers: ['user-3'], taggers_count: 1, relationship: false }),
        ],
      });
    });

    it('should provide access to tag methods', () => {
      const techTag = Tag.findByLabel(post.tags, 'tech');
      expect(techTag).toBeDefined();
      expect(techTag!.taggers_count).toBe(2);
    });

    it('should allow tag manipulation', () => {
      const techTag = Tag.findByLabel(post.tags, 'tech')!;

      expect(techTag.hasUser('user-1')).toBe(true);
      expect(techTag.hasUser('user-4')).toBe(false);

      techTag.addTagger('user-4');
      expect(techTag.taggers_count).toBe(3);
      expect(techTag.hasUser('user-4')).toBe(true);
    });

    it('should get unique tag labels', () => {
      const labels = Tag.getUniqueLabels(post.tags);
      expect(labels).toEqual(['tech', 'news']);
    });

    it('should find tags by tagger', () => {
      const user1Tags = Tag.findByTagger(post.tags, 'user-1');
      expect(user1Tags).toHaveLength(1);
      expect(user1Tags[0].label).toBe('tech');
    });
  });
});
