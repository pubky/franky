import { describe, it, expect } from 'vitest';
import { PostController } from '@/database/controllers/post';
import { UserController } from '@/database/controllers/user';
import { faker } from '@faker-js/faker';
import { NexusPost, NexusUser, NexusPostTag } from '@/services/nexus/types';

describe('PostController', () => {
  // Helper function to create a test user
  const createTestUser = async () => {
    const testUser: NexusUser = {
      details: {
        id: `${faker.string.uuid()}:${faker.string.uuid()}`,
        name: faker.person.fullName(),
        bio: faker.lorem.sentence(),
        links: null,
        status: null,
        image: null,
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
    };
    return await UserController.createOrUpdate(testUser);
  };

  // Helper function to create a test post
  const createTestPost = async (authorId: string) => {
    const testPost: NexusPost = {
      details: {
        id: `${faker.string.uuid()}:${faker.string.uuid()}`,
        content: faker.lorem.paragraph(),
        author: authorId,
        kind: 'short',
        indexed_at: Date.now(),
        uri: faker.internet.url(),
        attachments: null,
      },
      counts: {
        tags: 0,
        unique_tags: 0,
        replies: 0,
        reposts: 0,
      },
      tags: [],
      relationships: {
        replied: null,
        reposted: null,
        mentioned: [],
      },
      bookmark: null,
    };
    return await PostController.createOrUpdate(testPost);
  };

  describe('create', () => {
    it('should create a post successfully', async () => {
      const user = await createTestUser();
      const testPost: NexusPost = {
        details: {
          id: `${faker.string.uuid()}:${faker.string.uuid()}`,
          content: faker.lorem.paragraph(),
          author: user.id,
          kind: 'short',
          indexed_at: Date.now(),
          uri: faker.internet.url(),
          attachments: null,
        },
        counts: {
          tags: 0,
          unique_tags: 0,
          replies: 0,
          reposts: 0,
        },
        tags: [],
        relationships: {
          replied: null,
          reposted: null,
          mentioned: [],
        },
        bookmark: null,
      };

      const post = await PostController.createOrUpdate(testPost);

      expect(post).toBeDefined();
      expect(post.id).toBe(testPost.details.id);
      expect(post.details.content).toBe(testPost.details.content);
      expect(post.details.author).toBe(user.id);
      expect(post.tags).toHaveLength(0);
    });

    it('should prevent duplicate tags', async () => {
      const user = await createTestUser();
      const tag: NexusPostTag = {
        label: faker.word.sample(),
        taggers: [],
        taggers_count: 0,
        relationship: false,
      };
      const testPost: NexusPost = {
        details: {
          id: `${faker.string.uuid()}:${faker.string.uuid()}`,
          content: faker.lorem.paragraph(),
          author: user.id,
          kind: 'short',
          indexed_at: Date.now(),
          uri: faker.internet.url(),
          attachments: null,
        },
        counts: {
          tags: 0,
          unique_tags: 0,
          replies: 0,
          reposts: 0,
        },
        tags: [tag, tag],
        relationships: {
          replied: null,
          reposted: null,
          mentioned: [],
        },
        bookmark: null,
      };

      const post = await PostController.createOrUpdate(testPost);

      expect(post.tags).toHaveLength(1);
      expect(post.counts.tags).toBe(1);
      expect(post.counts.unique_tags).toBe(1);
    });

    it('should throw error if author does not exist', async () => {
      const testPost: NexusPost = {
        details: {
          id: `${faker.string.uuid()}:${faker.string.uuid()}`,
          content: faker.lorem.paragraph(),
          author: `${faker.string.uuid()}:${faker.string.uuid()}`,
          kind: 'short',
          indexed_at: Date.now(),
          uri: faker.internet.url(),
          attachments: null,
        },
        counts: {
          tags: 0,
          unique_tags: 0,
          replies: 0,
          reposts: 0,
        },
        tags: [],
        relationships: {
          replied: null,
          reposted: null,
          mentioned: [],
        },
        bookmark: null,
      };

      await expect(PostController.createOrUpdate(testPost)).rejects.toThrow('User not found');
    });
  });

  describe('delete', () => {
    it('should delete a post successfully', async () => {
      const user = await createTestUser();
      const post = await createTestPost(user.id);

      await PostController.delete(user.id, post.id);
      await expect(PostController.getPost(post.id)).rejects.toThrow('Post not found');
    });

    it('should mark post as [DELETED] when it has relationships', async () => {
      const user = await createTestUser();
      const post = await createTestPost(user.id);

      // Add a tag to create a relationship
      await PostController.tag('PUT', user.id, post.id, faker.word.sample());

      await PostController.delete(user.id, post.id);
      const deletedPost = await PostController.getPost(post.id);
      expect(deletedPost.details.content).toBe('[DELETED]');
    });

    it('should throw error if user is not the author', async () => {
      const author = await createTestUser();
      const otherUser = await createTestUser();
      const post = await createTestPost(author.id);

      await expect(PostController.delete(otherUser.id, post.id)).rejects.toThrow('Unauthorized');
    });
  });

  describe('tag', () => {
    it('should add a tag to a post', async () => {
      const user = await createTestUser();
      const post = await createTestPost(user.id);
      const tagLabel = faker.word.sample();

      await PostController.tag('PUT', user.id, post.id, tagLabel);
      const updatedPost = await PostController.getPost(post.id);

      expect(updatedPost.tags).toContainEqual(
        expect.objectContaining({
          label: tagLabel,
          taggers: [user.id],
          taggers_count: 1,
        }),
      );
    });

    it('should remove a tag from a post', async () => {
      const user = await createTestUser();
      const post = await createTestPost(user.id);
      const tagLabel = faker.word.sample();

      await PostController.tag('PUT', user.id, post.id, tagLabel);
      await PostController.tag('DEL', user.id, post.id, tagLabel);

      const updatedPost = await PostController.getPost(post.id);
      expect(updatedPost.tags).not.toContainEqual(
        expect.objectContaining({
          label: tagLabel,
        }),
      );
    });
  });

  describe('bookmark', () => {
    it('should add a bookmark to a post', async () => {
      const user = await createTestUser();
      const post = await createTestPost(user.id);

      await PostController.bookmark('PUT', user.id, post.id);
      const updatedPost = await PostController.getPost(post.id);

      expect(updatedPost.bookmark).toBeDefined();
      expect(updatedPost.bookmark?.created_at).toBeDefined();
    });

    it('should remove a bookmark from a post', async () => {
      const user = await createTestUser();
      const post = await createTestPost(user.id);

      await PostController.bookmark('PUT', user.id, post.id);
      await PostController.bookmark('DEL', user.id, post.id);

      const updatedPost = await PostController.getPost(post.id);
      expect(updatedPost.bookmark).toBeNull();
    });
  });

  describe('getPost', () => {
    it('should retrieve a post by id', async () => {
      const user = await createTestUser();
      const post = await createTestPost(user.id);

      const retrievedPost = await PostController.getPost(post.id);
      expect(retrievedPost).toEqual(post);
    });

    it('should throw error if post does not exist', async () => {
      await expect(PostController.getPost(`${faker.string.uuid()}:${faker.string.uuid()}`)).rejects.toThrow(
        'Post not found',
      );
    });
  });

  describe('getTags', () => {
    it('should retrieve post tags with pagination', async () => {
      const user = await createTestUser();
      const post = await createTestPost(user.id);
      const tagLabels = Array.from({ length: 5 }, () => faker.word.sample());

      for (const label of tagLabels) {
        await PostController.tag('PUT', user.id, post.id, label);
      }

      const tags = await PostController.getTags(post.id, { skip: 0, limit: 3 });
      expect(tags).toHaveLength(3);
    });
  });

  describe('getTaggers', () => {
    it('should retrieve taggers for a specific tag', async () => {
      const author = await createTestUser();
      const tagger1 = await createTestUser();
      const tagger2 = await createTestUser();
      const post = await createTestPost(author.id);
      const tagLabel = faker.word.sample();

      await PostController.tag('PUT', tagger1.id, post.id, tagLabel);
      await PostController.tag('PUT', tagger2.id, post.id, tagLabel);

      const taggers = await PostController.getTaggers(post.id, tagLabel);
      expect(taggers).toContain(tagger1.id);
      expect(taggers).toContain(tagger2.id);
    });
  });
});
