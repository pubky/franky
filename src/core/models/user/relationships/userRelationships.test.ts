import { describe, it, expect, beforeEach } from 'vitest';
import * as Core from '@/core';

describe('UserRelationshipsModel', () => {
  beforeEach(async () => {
    await Core.resetDatabase();
  });

  const testUserId1 = Core.generateTestUserId(1);
  const testUserId2 = Core.generateTestUserId(2);

  const MOCK_NEXUS_USER_RELATIONSHIP: Omit<Core.NexusUserRelationship, 'id'> = {
    following: true,
    followed_by: false,
    muted: false,
  };

  describe('Constructor', () => {
    it('should create UserRelationshipsModel instance with all properties', () => {
      const mockUserRelationshipsData = {
        id: testUserId1,
        ...MOCK_NEXUS_USER_RELATIONSHIP,
      };

      const userRelationships = new Core.UserRelationshipsModel(mockUserRelationshipsData);

      expect(userRelationships.id).toBe(mockUserRelationshipsData.id);
      expect(userRelationships.following).toBe(mockUserRelationshipsData.following);
      expect(userRelationships.followed_by).toBe(mockUserRelationshipsData.followed_by);
      expect(userRelationships.muted).toBe(mockUserRelationshipsData.muted);
    });
  });

  describe('Static Methods', () => {
    it('should create user relationships', async () => {
      const mockUserRelationshipsData = {
        id: testUserId1,
        ...MOCK_NEXUS_USER_RELATIONSHIP,
      };

      const result = await Core.UserRelationshipsModel.create(mockUserRelationshipsData);
      expect(result).toBeUndefined();
    });

    it('should find user relationships by id', async () => {
      const mockUserRelationshipsData = {
        id: testUserId1,
        ...MOCK_NEXUS_USER_RELATIONSHIP,
      };

      await Core.UserRelationshipsModel.create(mockUserRelationshipsData);
      const result = await Core.UserRelationshipsModel.findById(testUserId1);

      expect(result).not.toBeNull();
      expect(result!).toBeInstanceOf(Core.UserRelationshipsModel);
      expect(result!.id).toBe(testUserId1);
      expect(result!.following).toBe(MOCK_NEXUS_USER_RELATIONSHIP.following);
      expect(result!.followed_by).toBe(MOCK_NEXUS_USER_RELATIONSHIP.followed_by);
      expect(result!.muted).toBe(MOCK_NEXUS_USER_RELATIONSHIP.muted);
    });

    it('should return null for non-existent user relationships', async () => {
      const nonExistentId = Core.generateTestUserId(999);
      const result = await Core.UserRelationshipsModel.findById(nonExistentId);
      expect(result).toBeNull();
    });

    it('should bulk save user relationships from tuples', async () => {
      const mockNexusModelTuples: Core.NexusModelTuple<Core.NexusUserRelationship>[] = [
        [testUserId1, MOCK_NEXUS_USER_RELATIONSHIP],
        [testUserId2, { following: false, followed_by: true, muted: true }],
      ];

      const result = await Core.UserRelationshipsModel.bulkSave(mockNexusModelTuples);
      expect(result).toBeDefined();

      // Verify the data was saved correctly
      const userRelationships1 = await Core.UserRelationshipsModel.findById(testUserId1);
      const userRelationships2 = await Core.UserRelationshipsModel.findById(testUserId2);

      expect(userRelationships1).not.toBeNull();
      expect(userRelationships2).not.toBeNull();
      expect(userRelationships1!.following).toBe(true);
      expect(userRelationships1!.followed_by).toBe(false);
      expect(userRelationships1!.muted).toBe(false);
      expect(userRelationships2!.following).toBe(false);
      expect(userRelationships2!.followed_by).toBe(true);
      expect(userRelationships2!.muted).toBe(true);
    });

    it('should handle empty array in bulk save', async () => {
      const result = await Core.UserRelationshipsModel.bulkSave([]);
      // bulkPut with empty array returns undefined, which is expected
      expect(result).toBeUndefined();
    });

    it('should handle multiple tuples with different relationship states', async () => {
      const mockTuples: Core.NexusModelTuple<Core.NexusUserRelationship>[] = [
        [testUserId1, { following: true, followed_by: true, muted: false }],
        [testUserId2, { following: false, followed_by: false, muted: true }],
      ];

      await Core.UserRelationshipsModel.bulkSave(mockTuples);

      const userRelationships1 = await Core.UserRelationshipsModel.findById(testUserId1);
      const userRelationships2 = await Core.UserRelationshipsModel.findById(testUserId2);

      // User 1: mutual following, not muted
      expect(userRelationships1).not.toBeNull();
      expect(userRelationships1!.following).toBe(true);
      expect(userRelationships1!.followed_by).toBe(true);
      expect(userRelationships1!.muted).toBe(false);

      // User 2: no following relationship, but muted
      expect(userRelationships2).not.toBeNull();
      expect(userRelationships2!.following).toBe(false);
      expect(userRelationships2!.followed_by).toBe(false);
      expect(userRelationships2!.muted).toBe(true);
    });
  });
});
