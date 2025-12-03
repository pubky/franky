import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as Core from '@/core';
import type { NexusUser, NexusHotTag, NexusPostsKeyStream } from '@/core/services/nexus';
import { SearchController } from './search';

const mockNexusUser: NexusUser = {
  details: {
    id: 'pxnu33x7jtpx9ar1ytsi4yxbp6a5o36gwhffs8zoxmbuptici1jy',
    name: 'Test User',
    bio: 'Test bio',
    status: null,
    image: 'https://example.com/avatar.jpg',
    links: null,
    indexed_at: 1234567890,
  },
  counts: {
    tagged: 5,
    tags: 10,
    unique_tags: 3,
    posts: 25,
    replies: 15,
    following: 100,
    followers: 200,
    friends: 50,
    bookmarks: 10,
  },
  tags: [],
  relationship: {
    following: false,
    followed_by: false,
    muted: false,
  },
};

const mockHotTag: NexusHotTag = {
  label: 'bitcoin',
  taggers_id: ['user1', 'user2'],
  tagged_count: 100,
  taggers_count: 50,
};

const mockPostsKeyStream: NexusPostsKeyStream = {
  post_keys: ['post1', 'post2', 'post3'],
  last_post_score: 123456,
};

describe('SearchController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getHotTags', () => {
    it('should call SearchApplication.hotTags with correct params', async () => {
      const params = { skip: 0, limit: 10 };
      const hotTagsSpy = vi.spyOn(Core.SearchApplication, 'hotTags').mockResolvedValue([mockHotTag]);

      const result = await SearchController.getHotTags(params);

      expect(hotTagsSpy).toHaveBeenCalledWith(params);
      expect(result).toEqual([mockHotTag]);
    });

    it('should return empty array when no hot tags found', async () => {
      vi.spyOn(Core.SearchApplication, 'hotTags').mockResolvedValue([]);

      const result = await SearchController.getHotTags({ skip: 0, limit: 10 });

      expect(result).toEqual([]);
    });

    it('should propagate errors from application layer', async () => {
      vi.spyOn(Core.SearchApplication, 'hotTags').mockRejectedValue(new Error('API error'));

      await expect(SearchController.getHotTags({ skip: 0, limit: 10 })).rejects.toThrow('API error');
    });
  });

  describe('getUsersById', () => {
    it('should call SearchApplication and map results to TSearchUserResult', async () => {
      const params = { prefix: 'pxnu33', skip: 0, limit: 5 };
      const usersByIdSpy = vi.spyOn(Core.SearchApplication, 'usersById').mockResolvedValue([mockNexusUser]);

      const result = await SearchController.getUsersById(params);

      expect(usersByIdSpy).toHaveBeenCalledWith(params);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: mockNexusUser.details.id,
        name: 'Test User',
        handle: expect.stringContaining('...'),
        avatar: 'https://example.com/avatar.jpg',
        tagsCount: 3,
        postsCount: 25,
      });
    });

    it('should handle users without avatar', async () => {
      const userWithoutAvatar = {
        ...mockNexusUser,
        details: { ...mockNexusUser.details, image: null },
      };
      vi.spyOn(Core.SearchApplication, 'usersById').mockResolvedValue([userWithoutAvatar]);

      const result = await SearchController.getUsersById({ prefix: 'test', skip: 0, limit: 5 });

      expect(result[0].avatar).toBeUndefined();
    });

    it('should return empty array when no users found', async () => {
      vi.spyOn(Core.SearchApplication, 'usersById').mockResolvedValue([]);

      const result = await SearchController.getUsersById({ prefix: 'nonexistent', skip: 0, limit: 5 });

      expect(result).toEqual([]);
    });
  });

  describe('getUsersByName', () => {
    it('should call SearchApplication and map results to TSearchUserResult', async () => {
      const params = { prefix: 'Test', skip: 0, limit: 5 };
      const usersByNameSpy = vi.spyOn(Core.SearchApplication, 'usersByName').mockResolvedValue([mockNexusUser]);

      const result = await SearchController.getUsersByName(params);

      expect(usersByNameSpy).toHaveBeenCalledWith(params);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Test User');
    });

    it('should handle multiple users', async () => {
      const secondUser = {
        ...mockNexusUser,
        details: { ...mockNexusUser.details, id: 'second_user_id', name: 'Second User' },
      };
      vi.spyOn(Core.SearchApplication, 'usersByName').mockResolvedValue([mockNexusUser, secondUser]);

      const result = await SearchController.getUsersByName({ prefix: 'User', skip: 0, limit: 10 });

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Test User');
      expect(result[1].name).toBe('Second User');
    });
  });

  describe('getTags', () => {
    it('should call SearchApplication.tags with correct params', async () => {
      const params = { prefix: 'bit', skip: 0, limit: 5 };
      const mockTags = ['bitcoin', 'bitkit', 'bits'];
      const tagsSpy = vi.spyOn(Core.SearchApplication, 'tags').mockResolvedValue(mockTags);

      const result = await SearchController.getTags(params);

      expect(tagsSpy).toHaveBeenCalledWith(params);
      expect(result).toEqual(mockTags);
    });

    it('should return empty array when no tags found', async () => {
      vi.spyOn(Core.SearchApplication, 'tags').mockResolvedValue([]);

      const result = await SearchController.getTags({ prefix: 'xyz', skip: 0, limit: 5 });

      expect(result).toEqual([]);
    });
  });

  describe('getPosts', () => {
    it('should call SearchApplication.posts with correct params', async () => {
      const params = { tag: 'bitcoin', skip: 0, limit: 10 };
      const postsSpy = vi.spyOn(Core.SearchApplication, 'posts').mockResolvedValue(mockPostsKeyStream);

      const result = await SearchController.getPosts(params);

      expect(postsSpy).toHaveBeenCalledWith(params);
      expect(result).toEqual(mockPostsKeyStream);
    });

    it('should return empty stream when no posts found', async () => {
      const emptyStream = { post_keys: [], last_post_score: 0 };
      vi.spyOn(Core.SearchApplication, 'posts').mockResolvedValue(emptyStream);

      const result = await SearchController.getPosts({ tag: 'nonexistent', skip: 0, limit: 10 });

      expect(result.post_keys).toHaveLength(0);
    });
  });
});
