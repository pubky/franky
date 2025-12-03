import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as Core from '@/core';
import type { NexusUser, NexusHotTag, NexusPostsKeyStream } from '@/core/services/nexus';
import { SearchApplication } from './search';

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

describe('SearchApplication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('hotTags', () => {
    it('should call NexusHotService.fetch with correct params', async () => {
      const params = { skip: 0, limit: 10 };
      const fetchSpy = vi.spyOn(Core.NexusHotService, 'fetch').mockResolvedValue([mockHotTag]);

      const result = await SearchApplication.hotTags(params);

      expect(fetchSpy).toHaveBeenCalledWith(params);
      expect(result).toEqual([mockHotTag]);
    });

    it('should return empty array when service returns empty', async () => {
      vi.spyOn(Core.NexusHotService, 'fetch').mockResolvedValue([]);

      const result = await SearchApplication.hotTags({ skip: 0, limit: 10 });

      expect(result).toEqual([]);
    });

    it('should propagate errors from service', async () => {
      vi.spyOn(Core.NexusHotService, 'fetch').mockRejectedValue(new Error('Network error'));

      await expect(SearchApplication.hotTags({ skip: 0, limit: 10 })).rejects.toThrow('Network error');
    });
  });

  describe('usersById', () => {
    it('should call NexusSearchService.usersById with correct params', async () => {
      const params = { prefix: 'pxnu33', skip: 0, limit: 5 };
      const usersByIdSpy = vi.spyOn(Core.NexusSearchService, 'usersById').mockResolvedValue([mockNexusUser]);

      const result = await SearchApplication.usersById(params);

      expect(usersByIdSpy).toHaveBeenCalledWith(params);
      expect(result).toEqual([mockNexusUser]);
    });

    it('should return empty array when no users found', async () => {
      vi.spyOn(Core.NexusSearchService, 'usersById').mockResolvedValue([]);

      const result = await SearchApplication.usersById({ prefix: 'nonexistent', skip: 0, limit: 5 });

      expect(result).toEqual([]);
    });

    it('should propagate errors from service', async () => {
      vi.spyOn(Core.NexusSearchService, 'usersById').mockRejectedValue(new Error('API error'));

      await expect(SearchApplication.usersById({ prefix: 'test', skip: 0, limit: 5 })).rejects.toThrow('API error');
    });
  });

  describe('usersByName', () => {
    it('should call NexusSearchService.usersByName with correct params', async () => {
      const params = { prefix: 'Test', skip: 0, limit: 5 };
      const usersByNameSpy = vi.spyOn(Core.NexusSearchService, 'usersByName').mockResolvedValue([mockNexusUser]);

      const result = await SearchApplication.usersByName(params);

      expect(usersByNameSpy).toHaveBeenCalledWith(params);
      expect(result).toEqual([mockNexusUser]);
    });

    it('should handle multiple users', async () => {
      const secondUser = {
        ...mockNexusUser,
        details: { ...mockNexusUser.details, id: 'second_user_id', name: 'Second User' },
      };
      vi.spyOn(Core.NexusSearchService, 'usersByName').mockResolvedValue([mockNexusUser, secondUser]);

      const result = await SearchApplication.usersByName({ prefix: 'User', skip: 0, limit: 10 });

      expect(result).toHaveLength(2);
    });
  });

  describe('tags', () => {
    it('should call NexusSearchService.tags with correct params', async () => {
      const params = { prefix: 'bit', skip: 0, limit: 5 };
      const mockTags = ['bitcoin', 'bitkit', 'bits'];
      const tagsSpy = vi.spyOn(Core.NexusSearchService, 'tags').mockResolvedValue(mockTags);

      const result = await SearchApplication.tags(params);

      expect(tagsSpy).toHaveBeenCalledWith(params);
      expect(result).toEqual(mockTags);
    });

    it('should return empty array when no tags found', async () => {
      vi.spyOn(Core.NexusSearchService, 'tags').mockResolvedValue([]);

      const result = await SearchApplication.tags({ prefix: 'xyz', skip: 0, limit: 5 });

      expect(result).toEqual([]);
    });
  });

  describe('posts', () => {
    it('should call NexusSearchService.posts with correct params', async () => {
      const params = { tag: 'bitcoin', skip: 0, limit: 10 };
      const postsSpy = vi.spyOn(Core.NexusSearchService, 'posts').mockResolvedValue(mockPostsKeyStream);

      const result = await SearchApplication.posts(params);

      expect(postsSpy).toHaveBeenCalledWith(params);
      expect(result).toEqual(mockPostsKeyStream);
    });

    it('should return empty stream when no posts found', async () => {
      const emptyStream = { post_keys: [], last_post_score: 0 };
      vi.spyOn(Core.NexusSearchService, 'posts').mockResolvedValue(emptyStream);

      const result = await SearchApplication.posts({ tag: 'nonexistent', skip: 0, limit: 10 });

      expect(result.post_keys).toHaveLength(0);
    });
  });
});
