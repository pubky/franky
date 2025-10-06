import { describe, it, expect, beforeEach } from 'vitest';
import * as Core from '@/core';

describe('PostCountsModel', () => {
  beforeEach(async () => {
    await Core.resetDatabase();
  });

  const testPostId1 = 'post-test-1';
  const testPostId2 = 'post-test-2';

  const MOCK_NEXUS_POST_COUNTS: Core.NexusPostCounts = {
    tags: 5,
    unique_tags: 3,
    replies: 12,
    reposts: 8,
  };

  describe('Constructor', () => {
    it('should create PostCountsModel instance with all properties', () => {
      const mockPostCountsData = {
        id: testPostId1,
        ...MOCK_NEXUS_POST_COUNTS,
      };

      const postCounts = new Core.PostCountsModel(mockPostCountsData);

      expect(postCounts.id).toBe(mockPostCountsData.id);
      expect(postCounts.tags).toBe(mockPostCountsData.tags);
      expect(postCounts.unique_tags).toBe(mockPostCountsData.unique_tags);
      expect(postCounts.replies).toBe(mockPostCountsData.replies);
      expect(postCounts.reposts).toBe(mockPostCountsData.reposts);
    });
  });

  describe('Static Methods', () => {
    it('should create post counts', async () => {
      const mockPostCountsData = {
        id: testPostId1,
        ...MOCK_NEXUS_POST_COUNTS,
      };

      const result = await Core.PostCountsModel.create(mockPostCountsData);
      expect(result).toBeUndefined();
    });

    it('should find post counts by id', async () => {
      const mockPostCountsData = {
        id: testPostId1,
        ...MOCK_NEXUS_POST_COUNTS,
      };

      await Core.PostCountsModel.create(mockPostCountsData);
      const result = await Core.PostCountsModel.findById(testPostId1);

      expect(result).not.toBeNull();
      expect(result!).toBeInstanceOf(Core.PostCountsModel);
      expect(result!.id).toBe(testPostId1);
      expect(result!.replies).toBe(MOCK_NEXUS_POST_COUNTS.replies);
    });

    it('should return null for non-existent post counts', async () => {
      const nonExistentId = 'non-existent-post-999';
      const result = await Core.PostCountsModel.findById(nonExistentId);
      expect(result).toBeNull();
    });

    it('should bulk save post counts from tuples', async () => {
      const mockNexusModelTuples: Core.NexusModelTuple<Core.NexusPostCounts>[] = [
        [testPostId1, MOCK_NEXUS_POST_COUNTS],
        [testPostId2, { ...MOCK_NEXUS_POST_COUNTS, replies: 25 }],
      ];

      const result = await Core.PostCountsModel.bulkSave(mockNexusModelTuples);
      expect(result).toBeDefined();

      // Verify the data was saved correctly
      const postCounts1 = await Core.PostCountsModel.findById(testPostId1);
      const postCounts2 = await Core.PostCountsModel.findById(testPostId2);

      expect(postCounts1).not.toBeNull();
      expect(postCounts2).not.toBeNull();
      expect(postCounts1!.replies).toBe(12);
      expect(postCounts2!.replies).toBe(25);
    });

    it('should handle empty array in bulk save', async () => {
      const result = await Core.PostCountsModel.bulkSave([]);
      // bulkPut with empty array returns undefined, which is expected
      expect(result).toBeUndefined();
    });

    it('should handle multiple tuples with different data', async () => {
      const mockTuples: Core.NexusModelTuple<Core.NexusPostCounts>[] = [
        [testPostId1, MOCK_NEXUS_POST_COUNTS],
        [testPostId2, { ...MOCK_NEXUS_POST_COUNTS, reposts: 100, tags: 1 }],
      ];

      await Core.PostCountsModel.bulkSave(mockTuples);

      const postCounts1 = await Core.PostCountsModel.findById(testPostId1);
      const postCounts2 = await Core.PostCountsModel.findById(testPostId2);

      expect(postCounts1).not.toBeNull();
      expect(postCounts2).not.toBeNull();
      expect(postCounts1!.reposts).toBe(8);
      expect(postCounts1!.tags).toBe(5);
      expect(postCounts2!.reposts).toBe(100);
      expect(postCounts2!.tags).toBe(1);
    });
  });
});
