import { describe, it, expect, beforeEach } from 'vitest';
import * as Core from '@/core';

describe('UserTtlModel', () => {
  beforeEach(async () => {
    await Core.resetDatabase();
  });

  const testUserId1 = Core.generateTestUserId(1);
  const testUserId2 = Core.generateTestUserId(2);

  const MOCK_TTL_1 = {
    ttl: Date.now() + 3600000, // 1 hour from now
  };

  const MOCK_TTL_2 = {
    ttl: Date.now() + 7200000, // 2 hours from now
  };

  describe('Constructor', () => {
    it('should create UserTtlModel instance with all properties', () => {
      const mockData = {
        id: testUserId1,
        ...MOCK_TTL_1,
      };

      const model = new Core.UserTtlModel(mockData);

      expect(model.id).toBe(mockData.id);
      expect(model.ttl).toBe(MOCK_TTL_1.ttl);
    });
  });

  describe('Static Methods', () => {
    it('should insert user ttl', async () => {
      const mockData = {
        id: testUserId1,
        ...MOCK_TTL_1,
      };

      const result = await Core.UserTtlModel.insert(mockData);
      expect(result).toBeDefined();
    });

    it('should find user ttl by id', async () => {
      const mockData = {
        id: testUserId1,
        ...MOCK_TTL_1,
      };

      await Core.UserTtlModel.insert(mockData);
      const result = await Core.UserTtlModel.findById(testUserId1);

      expect(result).toBeInstanceOf(Core.UserTtlModel);
      expect(result.id).toBe(testUserId1);
      expect(result.ttl).toBe(MOCK_TTL_1.ttl);
    });

    it('should throw error for non-existent user ttl', async () => {
      const nonExistentId = Core.generateTestUserId(999);
      await expect(Core.UserTtlModel.findById(nonExistentId)).rejects.toThrow(`TTL not found: ${nonExistentId}`);
    });

    it('should bulk save user ttl from tuples', async () => {
      const mockTuples: Core.NexusModelTuple<{ ttl: number }>[] = [
        [testUserId1, MOCK_TTL_1],
        [testUserId2, MOCK_TTL_2],
      ];

      const result = await Core.UserTtlModel.bulkSave(mockTuples);
      expect(result).toBeDefined();

      // Verify the data was saved correctly
      const userTtl1 = await Core.UserTtlModel.findById(testUserId1);
      const userTtl2 = await Core.UserTtlModel.findById(testUserId2);

      expect(userTtl1.ttl).toBe(MOCK_TTL_1.ttl);
      expect(userTtl2.ttl).toBe(MOCK_TTL_2.ttl);
    });

    it('should handle empty array in bulk save', async () => {
      const result = await Core.UserTtlModel.bulkSave([]);
      // bulkPut with empty array returns undefined, which is expected
      expect(result).toBeUndefined();
    });

    it('should handle multiple tuples with different ttl values', async () => {
      const currentTime = Date.now();
      const mockTuples: Core.NexusModelTuple<{ ttl: number }>[] = [
        [testUserId1, { ttl: currentTime + 1000 }],
        [testUserId2, { ttl: currentTime + 5000 }],
      ];

      await Core.UserTtlModel.bulkSave(mockTuples);

      const userTtl1 = await Core.UserTtlModel.findById(testUserId1);
      const userTtl2 = await Core.UserTtlModel.findById(testUserId2);

      expect(userTtl1.ttl).toBe(currentTime + 1000);
      expect(userTtl2.ttl).toBe(currentTime + 5000);
    });
  });
});
