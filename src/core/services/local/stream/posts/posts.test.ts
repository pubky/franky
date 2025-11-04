import { describe, it, expect, beforeEach } from 'vitest';
import * as Core from '@/core';

describe('LocalStreamPostsService', () => {
  const streamId = Core.PostStreamTypes.TIMELINE_ALL;

  beforeEach(async () => {
    // Clear post_streams table
    await Core.PostStreamModel.table.clear();
  });

  describe('upsert', () => {
    it('should create a new stream with post IDs', async () => {
      const postIds = ['user1:post1', 'user2:post2', 'user3:post3'];

      await Core.LocalStreamPostsService.upsert(streamId, postIds);

      const result = await Core.PostStreamModel.findById(streamId);
      expect(result).toBeTruthy();
      expect(result!.stream).toEqual(postIds);
    });

    it('should update an existing stream with new post IDs', async () => {
      const initialIds = ['user1:post1', 'user2:post2'];
      const updatedIds = ['user1:post1', 'user2:post2', 'user3:post3'];

      // Create initial stream
      await Core.LocalStreamPostsService.upsert(streamId, initialIds);

      // Update with more IDs
      await Core.LocalStreamPostsService.upsert(streamId, updatedIds);

      const result = await Core.PostStreamModel.findById(streamId);
      expect(result).toBeTruthy();
      expect(result!.stream).toEqual(updatedIds);
    });

    it('should handle empty array', async () => {
      await Core.LocalStreamPostsService.upsert(streamId, []);

      const result = await Core.PostStreamModel.findById(streamId);
      expect(result).toBeTruthy();
      expect(result!.stream).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return stream when it exists', async () => {
      const postIds = ['user1:post1', 'user2:post2'];
      await Core.PostStreamModel.create(streamId, postIds);

      const result = await Core.LocalStreamPostsService.findById(streamId);

      expect(result).toBeTruthy();
      expect(result!.stream).toEqual(postIds);
    });

    it('should return null when stream does not exist', async () => {
      const result = await Core.LocalStreamPostsService.findById(Core.PostStreamTypes.TIMELINE_FOLLOWING);

      expect(result).toBeNull();
    });
  });

  describe('deleteById', () => {
    it('should delete an existing stream', async () => {
      const postIds = ['user1:post1', 'user2:post2'];
      await Core.PostStreamModel.create(streamId, postIds);

      // Verify it exists
      let result = await Core.PostStreamModel.findById(streamId);
      expect(result).toBeTruthy();

      // Delete it
      await Core.LocalStreamPostsService.deleteById(streamId);

      // Verify it's gone
      result = await Core.PostStreamModel.findById(streamId);
      expect(result).toBeNull();
    });

    it('should not throw error when deleting non-existent stream', async () => {
      await expect(
        Core.LocalStreamPostsService.deleteById(Core.PostStreamTypes.TIMELINE_FOLLOWING),
      ).resolves.not.toThrow();
    });
  });
});
