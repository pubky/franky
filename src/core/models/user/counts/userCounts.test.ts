import { describe, it, expect, beforeEach } from 'vitest';
import * as Core from '@/core';

describe('UserCountsModel', () => {
  beforeEach(async () => {
    await Core.resetDatabase();
  });

  const testUserId1 = Core.generateTestUserId(1);
  const testUserId2 = Core.generateTestUserId(2);

  const MOCK_NEXUS_USER_COUNTS: Core.NexusUserCounts = {
    tagged: 3,
    tags: 7,
    unique_tags: 6,
    posts: 15,
    replies: 8,
    following: 80,
    followers: 120,
    friends: 60,
    bookmarks: 20,
  };

  describe('Constructor', () => {
    it('should create UserCountsModel instance with all properties', () => {
      const mockUserCountsData = {
        id: testUserId1,
        ...MOCK_NEXUS_USER_COUNTS,
      };

      const userCounts = new Core.UserCountsModel(mockUserCountsData);

      expect(userCounts.id).toBe(mockUserCountsData.id);
      expect(userCounts.tagged).toBe(mockUserCountsData.tagged);
      expect(userCounts.tags).toBe(mockUserCountsData.tags);
      expect(userCounts.unique_tags).toBe(mockUserCountsData.unique_tags);
      expect(userCounts.posts).toBe(mockUserCountsData.posts);
      expect(userCounts.replies).toBe(mockUserCountsData.replies);
      expect(userCounts.following).toBe(mockUserCountsData.following);
      expect(userCounts.followers).toBe(mockUserCountsData.followers);
      expect(userCounts.friends).toBe(mockUserCountsData.friends);
      expect(userCounts.bookmarks).toBe(mockUserCountsData.bookmarks);
    });
  });

  describe('Static Methods', () => {
    it('should insert user counts', async () => {
      const mockUserCountsData = {
        id: testUserId1,
        ...MOCK_NEXUS_USER_COUNTS,
      };

      const result = await Core.UserCountsModel.insert(mockUserCountsData);
      expect(result).toBeDefined();
    });

    it('should find user counts by id', async () => {
      const mockUserCountsData = {
        id: testUserId1,
        ...MOCK_NEXUS_USER_COUNTS,
      };

      await Core.UserCountsModel.insert(mockUserCountsData);
      const result = await Core.UserCountsModel.findById(testUserId1);

      expect(result).toBeInstanceOf(Core.UserCountsModel);
      expect(result.id).toBe(testUserId1);
      expect(result.posts).toBe(MOCK_NEXUS_USER_COUNTS.posts);
    });

    it('should throw error for non-existent user counts', async () => {
      const nonExistentId = Core.generateTestUserId(999);
      await expect(Core.UserCountsModel.findById(nonExistentId)).rejects.toThrow(
        `Record not found in user_counts: ${nonExistentId}`,
      );
    });

    it('should bulk save user counts from tuples', async () => {
      const mockNexusModelTuples: Core.NexusModelTuple<Core.NexusUserCounts>[] = [
        [testUserId1, MOCK_NEXUS_USER_COUNTS],
        [testUserId2, { ...MOCK_NEXUS_USER_COUNTS, posts: 20 }],
      ];

      const result = await Core.UserCountsModel.bulkSave(mockNexusModelTuples);
      expect(result).toBeDefined();

      // Verify the data was saved correctly
      const userCounts1 = await Core.UserCountsModel.findById(testUserId1);
      const userCounts2 = await Core.UserCountsModel.findById(testUserId2);

      expect(userCounts1.posts).toBe(15);
      expect(userCounts2.posts).toBe(20);
    });

    it('should handle empty array in bulk save', async () => {
      const result = await Core.UserCountsModel.bulkSave([]);
      // bulkPut with empty array returns undefined, which is expected
      expect(result).toBeUndefined();
    });

    it('should handle multiple tuples with different data', async () => {
      const mockTuples: Core.NexusModelTuple<Core.NexusUserCounts>[] = [
        [testUserId1, MOCK_NEXUS_USER_COUNTS],
        [testUserId2, { ...MOCK_NEXUS_USER_COUNTS, posts: 999, followers: 0 }],
      ];

      await Core.UserCountsModel.bulkSave(mockTuples);

      const userCounts1 = await Core.UserCountsModel.findById(testUserId1);
      const userCounts2 = await Core.UserCountsModel.findById(testUserId2);

      expect(userCounts1.posts).toBe(15);
      expect(userCounts1.followers).toBe(120);
      expect(userCounts2.posts).toBe(999);
      expect(userCounts2.followers).toBe(0);
    });
  });
});
