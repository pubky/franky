import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as Core from '@/core';
import { SearchApplication } from './search';

describe('SearchApplication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('usersById', () => {
    it('should call NexusSearchService.usersById with correct params', async () => {
      const params = { prefix: 'pxnu33', skip: 0, limit: 5 };
      const mockUserIds = ['user1', 'user2'];
      const usersByIdSpy = vi.spyOn(Core.NexusSearchService, 'usersById').mockResolvedValue(mockUserIds);

      const result = await SearchApplication.usersById(params);

      expect(usersByIdSpy).toHaveBeenCalledWith(params);
      expect(result).toEqual(mockUserIds);
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
      const mockUserIds = ['user1', 'user2'];
      const usersByNameSpy = vi.spyOn(Core.NexusSearchService, 'usersByName').mockResolvedValue(mockUserIds);

      const result = await SearchApplication.usersByName(params);

      expect(usersByNameSpy).toHaveBeenCalledWith(params);
      expect(result).toEqual(mockUserIds);
    });

    it('should return empty array when no users found', async () => {
      vi.spyOn(Core.NexusSearchService, 'usersByName').mockResolvedValue([]);

      const result = await SearchApplication.usersByName({ prefix: 'nonexistent', skip: 0, limit: 5 });

      expect(result).toEqual([]);
    });

    it('should propagate errors from service', async () => {
      vi.spyOn(Core.NexusSearchService, 'usersByName').mockRejectedValue(new Error('API error'));

      await expect(SearchApplication.usersByName({ prefix: 'test', skip: 0, limit: 5 })).rejects.toThrow('API error');
    });
  });

  describe('tagsByPrefix', () => {
    it('should call NexusSearchService.tags with correct params', async () => {
      const params = { prefix: 'bit', skip: 0, limit: 5 };
      const mockTags = ['bitcoin', 'bitkit', 'bits'];
      const tagsSpy = vi.spyOn(Core.NexusSearchService, 'tags').mockResolvedValue(mockTags);

      const result = await SearchApplication.tagsByPrefix(params);

      expect(tagsSpy).toHaveBeenCalledWith(params);
      expect(result).toEqual(mockTags);
    });

    it('should return empty array when no tags found', async () => {
      vi.spyOn(Core.NexusSearchService, 'tags').mockResolvedValue([]);

      const result = await SearchApplication.tagsByPrefix({ prefix: 'xyz', skip: 0, limit: 5 });

      expect(result).toEqual([]);
    });

    it('should propagate errors from service', async () => {
      vi.spyOn(Core.NexusSearchService, 'tags').mockRejectedValue(new Error('API error'));

      await expect(SearchApplication.tagsByPrefix({ prefix: 'test', skip: 0, limit: 5 })).rejects.toThrow('API error');
    });
  });
});
