import { describe, it, expect, beforeEach } from 'vitest';
import * as Core from '@/core';

describe('UserTtlModel', () => {
  beforeEach(async () => {
    await Core.resetDatabase();
  });

  const testUserId1 = Core.generateTestUserId(1);
  const testUserId2 = Core.generateTestUserId(2);

  const MOCK_TTL_1 = {
    lastUpdatedAt: Date.now() - 3600000, // 1 hour ago
  };

  const MOCK_TTL_2 = {
    lastUpdatedAt: Date.now() - 7200000, // 2 hours ago
  };

  describe('Constructor', () => {
    it('should create UserTtlModel instance with all properties', () => {
      const mockData = {
        id: testUserId1,
        ...MOCK_TTL_1,
      };

      const model = new Core.UserTtlModel(mockData);

      expect(model.id).toBe(mockData.id);
      expect(model.lastUpdatedAt).toBe(MOCK_TTL_1.lastUpdatedAt);
    });
  });

  describe('Static Methods', () => {
    it('should create user ttl', async () => {
      const mockData = {
        id: testUserId1,
        ...MOCK_TTL_1,
      };

      const result = await Core.UserTtlModel.create(mockData);
      expect(result).toBe(mockData.id);
    });

    it('should find user ttl by id', async () => {
      const mockData = {
        id: testUserId1,
        ...MOCK_TTL_1,
      };

      await Core.UserTtlModel.create(mockData);
      const result = await Core.UserTtlModel.findById(testUserId1);

      expect(result).toBeInstanceOf(Core.UserTtlModel);
      expect(result?.id).toBe(testUserId1);
      expect(result?.lastUpdatedAt).toBe(MOCK_TTL_1.lastUpdatedAt);
    });

    it('should return null for non-existent user ttl', async () => {
      const nonExistentId = Core.generateTestUserId(999);
      const result = await Core.UserTtlModel.findById(nonExistentId);
      expect(result).toBeNull();
    });

    it('should bulk save user ttl from tuples', async () => {
      const mockTuples: Core.NexusModelTuple<{ lastUpdatedAt: number }>[] = [
        [testUserId1, MOCK_TTL_1],
        [testUserId2, MOCK_TTL_2],
      ];

      const result = await Core.UserTtlModel.bulkSave(mockTuples);
      expect(result).toBeDefined();

      // Verify the data was saved correctly
      const userTtl1 = await Core.UserTtlModel.findById(testUserId1);
      const userTtl2 = await Core.UserTtlModel.findById(testUserId2);

      expect(userTtl1?.lastUpdatedAt).toBe(MOCK_TTL_1.lastUpdatedAt);
      expect(userTtl2?.lastUpdatedAt).toBe(MOCK_TTL_2.lastUpdatedAt);
    });

    it('should handle empty array in bulk save', async () => {
      const result = await Core.UserTtlModel.bulkSave([]);
      // bulkPut with empty array returns undefined, which is expected
      expect(result).toBeUndefined();
    });

    it('should handle multiple tuples with different lastUpdatedAt values', async () => {
      const currentTime = Date.now();
      const mockTuples: Core.NexusModelTuple<{ lastUpdatedAt: number }>[] = [
        [testUserId1, { lastUpdatedAt: currentTime - 1000 }],
        [testUserId2, { lastUpdatedAt: currentTime - 5000 }],
      ];

      await Core.UserTtlModel.bulkSave(mockTuples);

      const userTtl1 = await Core.UserTtlModel.findById(testUserId1);
      const userTtl2 = await Core.UserTtlModel.findById(testUserId2);

      expect(userTtl1?.lastUpdatedAt).toBe(currentTime - 1000);
      expect(userTtl2?.lastUpdatedAt).toBe(currentTime - 5000);
    });
  });
});
