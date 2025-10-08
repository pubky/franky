import { describe, it, expect, beforeEach } from 'vitest';
import * as Core from '@/core';

describe('PostTtlModel', () => {
  beforeEach(async () => {
    await Core.resetDatabase();
  });

  const testPostId1 = 'post-test-1';
  const testPostId2 = 'post-test-2';

  const MOCK_TTL_1 = {
    ttl: Date.now() + 3600000, // 1 hour from now
  };

  const MOCK_TTL_2 = {
    ttl: Date.now() + 7200000, // 2 hours from now
  };

  describe('Constructor', () => {
    it('should create PostTtlModel instance with all properties', () => {
      const mockData = {
        id: testPostId1,
        ...MOCK_TTL_1,
      };

      const model = new Core.PostTtlModel(mockData);

      expect(model.id).toBe(mockData.id);
      expect(model.ttl).toBe(MOCK_TTL_1.ttl);
    });
  });

  describe('Static Methods', () => {
    it('should create post ttl', async () => {
      const mockData = {
        id: testPostId1,
        ...MOCK_TTL_1,
      };

      const result = await Core.PostTtlModel.create(mockData);
      expect(result).toBeUndefined();
    });

    it('should find post ttl by id', async () => {
      const mockData = {
        id: testPostId1,
        ...MOCK_TTL_1,
      };

      await Core.PostTtlModel.create(mockData);
      const result = await Core.PostTtlModel.findById(testPostId1);

      expect(result).toBeInstanceOf(Core.PostTtlModel);
      expect(result?.id).toBe(testPostId1);
      expect(result?.ttl).toBe(MOCK_TTL_1.ttl);
    });

    it('should return null for non-existent post ttl', async () => {
      const nonExistentId = 'non-existent-post-999';
      const result = await Core.PostTtlModel.findById(nonExistentId);
      expect(result).toBeNull();
    });

    it('should bulk save post ttl from tuples', async () => {
      const mockTuples: Core.NexusModelTuple<{ ttl: number }>[] = [
        [testPostId1, MOCK_TTL_1],
        [testPostId2, MOCK_TTL_2],
      ];

      await Core.PostTtlModel.bulkSave(mockTuples);

      const postTtl1 = await Core.PostTtlModel.findById(testPostId1);
      const postTtl2 = await Core.PostTtlModel.findById(testPostId2);

      expect(postTtl1?.ttl).toBe(MOCK_TTL_1.ttl);
      expect(postTtl2?.ttl).toBe(MOCK_TTL_2.ttl);
    });

    it('should handle empty array in bulk save', async () => {
      const result = await Core.PostTtlModel.bulkSave([]);
      // bulkPut with empty array returns undefined, which is expected
      expect(result).toBeUndefined();
    });

    it('should handle multiple tuples with different ttl values', async () => {
      const currentTime = Date.now();
      const mockTuples: Core.NexusModelTuple<{ ttl: number }>[] = [
        [testPostId1, { ttl: currentTime + 1000 }],
        [testPostId2, { ttl: currentTime + 5000 }],
      ];

      await Core.PostTtlModel.bulkSave(mockTuples);

      const postTtl1 = await Core.PostTtlModel.findById(testPostId1);
      const postTtl2 = await Core.PostTtlModel.findById(testPostId2);

      expect(postTtl1?.ttl).toBe(currentTime + 1000);
      expect(postTtl2?.ttl).toBe(currentTime + 5000);
    });

    it('should handle post-specific TTL scenarios', async () => {
      // Test different TTL values for different post types
      const shortTermPost = { id: testPostId1, ttl: Date.now() + 86400000 }; // 1 day
      const longTermPost = { id: testPostId2, ttl: Date.now() + 31536000000 }; // 1 year

      await Core.PostTtlModel.create(shortTermPost);
      await Core.PostTtlModel.create(longTermPost);

      const shortTtl = await Core.PostTtlModel.findById(testPostId1);
      const longTtl = await Core.PostTtlModel.findById(testPostId2);

      expect(shortTtl?.ttl).toBe(shortTermPost.ttl);
      expect(longTtl?.ttl).toBe(longTermPost.ttl);

      // Verify long term has longer TTL than short term
      expect(longTtl?.ttl).toBeGreaterThan(shortTtl?.ttl ?? 0);
    });

    it('should handle expired and non-expired TTL values', async () => {
      const currentTime = Date.now();
      const expiredTtl = { id: testPostId1, ttl: currentTime - 1000 }; // 1 second ago (expired)
      const validTtl = { id: testPostId2, ttl: currentTime + 1000 }; // 1 second from now (valid)

      await Core.PostTtlModel.create(expiredTtl);
      await Core.PostTtlModel.create(validTtl);

      const expired = await Core.PostTtlModel.findById(testPostId1);
      const valid = await Core.PostTtlModel.findById(testPostId2);

      expect(expired?.ttl).toBeLessThan(currentTime);
      expect(valid?.ttl).toBeGreaterThan(currentTime);
    });
  });
});
