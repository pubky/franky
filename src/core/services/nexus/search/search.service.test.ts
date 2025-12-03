import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as Core from '@/core';
import { NexusSearchService } from './search';
import type { NexusUser, NexusPostsKeyStream } from '../nexus.types';

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

const mockPostsKeyStream: NexusPostsKeyStream = {
  post_keys: ['post1', 'post2', 'post3'],
  last_post_score: 123456,
};

describe('NexusSearchService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('usersById', () => {
    it('should call queryNexus with correct URL and return users', async () => {
      const queryNexusSpy = vi.spyOn(Core, 'queryNexus').mockResolvedValue([mockNexusUser]);

      const result = await NexusSearchService.usersById({ prefix: 'pxnu33', skip: 0, limit: 5 });

      expect(queryNexusSpy).toHaveBeenCalledWith(expect.stringContaining('/v0/search/users/by_id/pxnu33'));
      expect(result).toEqual([mockNexusUser]);
    });

    it('should return empty array when queryNexus returns null', async () => {
      vi.spyOn(Core, 'queryNexus').mockResolvedValue(null);

      const result = await NexusSearchService.usersById({ prefix: 'nonexistent', skip: 0, limit: 5 });

      expect(result).toEqual([]);
    });

    it('should include pagination params in URL', async () => {
      const queryNexusSpy = vi.spyOn(Core, 'queryNexus').mockResolvedValue([]);

      await NexusSearchService.usersById({ prefix: 'test', skip: 10, limit: 20 });

      expect(queryNexusSpy).toHaveBeenCalledWith(expect.stringContaining('skip=10'));
      expect(queryNexusSpy).toHaveBeenCalledWith(expect.stringContaining('limit=20'));
    });
  });

  describe('usersByName', () => {
    it('should call queryNexus with correct URL and return users', async () => {
      const queryNexusSpy = vi.spyOn(Core, 'queryNexus').mockResolvedValue([mockNexusUser]);

      const result = await NexusSearchService.usersByName({ prefix: 'Test', skip: 0, limit: 5 });

      expect(queryNexusSpy).toHaveBeenCalledWith(expect.stringContaining('/v0/search/users/by_name/Test'));
      expect(result).toEqual([mockNexusUser]);
    });

    it('should return empty array when queryNexus returns null', async () => {
      vi.spyOn(Core, 'queryNexus').mockResolvedValue(null);

      const result = await NexusSearchService.usersByName({ prefix: 'nonexistent', skip: 0, limit: 5 });

      expect(result).toEqual([]);
    });
  });

  describe('tags', () => {
    it('should call queryNexus with correct URL and return tags', async () => {
      const mockTags = ['bitcoin', 'bitkit', 'bits'];
      const queryNexusSpy = vi.spyOn(Core, 'queryNexus').mockResolvedValue(mockTags);

      const result = await NexusSearchService.tags({ prefix: 'bit', skip: 0, limit: 5 });

      expect(queryNexusSpy).toHaveBeenCalledWith(expect.stringContaining('/v0/search/tags/by_prefix/bit'));
      expect(result).toEqual(mockTags);
    });

    it('should return empty array when queryNexus returns null', async () => {
      vi.spyOn(Core, 'queryNexus').mockResolvedValue(null);

      const result = await NexusSearchService.tags({ prefix: 'xyz', skip: 0, limit: 5 });

      expect(result).toEqual([]);
    });

    it('should handle special characters in prefix', async () => {
      const queryNexusSpy = vi.spyOn(Core, 'queryNexus').mockResolvedValue([]);

      await NexusSearchService.tags({ prefix: 'tag#123', skip: 0, limit: 5 });

      expect(queryNexusSpy).toHaveBeenCalledWith(expect.stringContaining('tag%23123'));
    });
  });

  describe('posts', () => {
    it('should call queryNexus with correct URL and return posts stream', async () => {
      const queryNexusSpy = vi.spyOn(Core, 'queryNexus').mockResolvedValue(mockPostsKeyStream);

      const result = await NexusSearchService.posts({ tag: 'bitcoin', skip: 0, limit: 10 });

      expect(queryNexusSpy).toHaveBeenCalledWith(expect.stringContaining('/v0/search/posts/by_tag/bitcoin'));
      expect(result).toEqual(mockPostsKeyStream);
    });

    it('should return empty stream when queryNexus returns null', async () => {
      vi.spyOn(Core, 'queryNexus').mockResolvedValue(null);

      const result = await NexusSearchService.posts({ tag: 'nonexistent', skip: 0, limit: 10 });

      expect(result).toEqual({ post_keys: [], last_post_score: 0 });
    });

    it('should handle special characters in tag', async () => {
      const queryNexusSpy = vi.spyOn(Core, 'queryNexus').mockResolvedValue(mockPostsKeyStream);

      await NexusSearchService.posts({ tag: 'rock&roll', skip: 0, limit: 10 });

      expect(queryNexusSpy).toHaveBeenCalledWith(expect.stringContaining('rock%26roll'));
    });
  });
});
