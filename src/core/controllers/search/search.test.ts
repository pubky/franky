import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as Core from '@/core';
import { SearchController } from './search';

describe('SearchController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUsersById', () => {
    it('should call SearchApplication.usersById and return user IDs', async () => {
      const params = { prefix: 'pxnu33', skip: 0, limit: 5 };
      const mockUserIds = ['user1', 'user2'];
      const usersByIdSpy = vi.spyOn(Core.SearchApplication, 'usersById').mockResolvedValue(mockUserIds);

      const result = await SearchController.getUsersById(params);

      expect(usersByIdSpy).toHaveBeenCalledWith(params);
      expect(result).toEqual(mockUserIds);
    });

    it('should return empty array when no users found', async () => {
      vi.spyOn(Core.SearchApplication, 'usersById').mockResolvedValue([]);

      const result = await SearchController.getUsersById({ prefix: 'nonexistent', skip: 0, limit: 5 });

      expect(result).toEqual([]);
    });

    it('should propagate errors from application layer', async () => {
      vi.spyOn(Core.SearchApplication, 'usersById').mockRejectedValue(new Error('API error'));

      await expect(SearchController.getUsersById({ prefix: 'test', skip: 0, limit: 5 })).rejects.toThrow('API error');
    });
  });

  describe('getUsersByName', () => {
    it('should call SearchApplication.usersByName and return user IDs', async () => {
      const params = { prefix: 'Test', skip: 0, limit: 5 };
      const mockUserIds = ['user1', 'user2'];
      const usersByNameSpy = vi.spyOn(Core.SearchApplication, 'usersByName').mockResolvedValue(mockUserIds);

      const result = await SearchController.getUsersByName(params);

      expect(usersByNameSpy).toHaveBeenCalledWith(params);
      expect(result).toEqual(mockUserIds);
    });

    it('should return empty array when no users found', async () => {
      vi.spyOn(Core.SearchApplication, 'usersByName').mockResolvedValue([]);

      const result = await SearchController.getUsersByName({ prefix: 'nonexistent', skip: 0, limit: 5 });

      expect(result).toEqual([]);
    });

    it('should propagate errors from application layer', async () => {
      vi.spyOn(Core.SearchApplication, 'usersByName').mockRejectedValue(new Error('API error'));

      await expect(SearchController.getUsersByName({ prefix: 'test', skip: 0, limit: 5 })).rejects.toThrow('API error');
    });
  });

  describe('getTagsByPrefix', () => {
    it('should call SearchApplication.tagsByPrefix with correct params', async () => {
      const params = { prefix: 'bit', skip: 0, limit: 5 };
      const mockTags = ['bitcoin', 'bitkit', 'bits'];
      const tagsSpy = vi.spyOn(Core.SearchApplication, 'tagsByPrefix').mockResolvedValue(mockTags);

      const result = await SearchController.getTagsByPrefix(params);

      expect(tagsSpy).toHaveBeenCalledWith(params);
      expect(result).toEqual(mockTags);
    });

    it('should return empty array when no tags found', async () => {
      vi.spyOn(Core.SearchApplication, 'tagsByPrefix').mockResolvedValue([]);

      const result = await SearchController.getTagsByPrefix({ prefix: 'xyz', skip: 0, limit: 5 });

      expect(result).toEqual([]);
    });

    it('should propagate errors from application layer', async () => {
      vi.spyOn(Core.SearchApplication, 'tagsByPrefix').mockRejectedValue(new Error('API error'));

      await expect(SearchController.getTagsByPrefix({ prefix: 'test', skip: 0, limit: 5 })).rejects.toThrow(
        'API error',
      );
    });
  });
});
