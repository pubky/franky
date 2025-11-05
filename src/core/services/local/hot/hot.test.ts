import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as Core from '@/core';
import * as Libs from '@/libs';

describe('LocalHotService', () => {
  const streamId = 'hot-tags-timeline';

  beforeEach(async () => {
    await Core.db.initialize();
    await Core.TagStreamModel.table.clear();
    vi.clearAllMocks();
  });

  describe('upsert', () => {
    it('should persist hot tags stream to IndexedDB', async () => {
      const mockHotTags: Core.NexusHotTag[] = [
        {
          label: 'bitcoin',
          tagged_count: 100,
          taggers_count: 2,
          taggers_id: ['user1' as Core.Pubky, 'user2' as Core.Pubky],
        },
        {
          label: 'pubky',
          tagged_count: 50,
          taggers_count: 1,
          taggers_id: ['user3' as Core.Pubky],
        },
      ];

      await Core.LocalHotService.upsert(streamId, mockHotTags);

      const savedStream = await Core.TagStreamModel.findById(streamId as Core.TagStreamTypes);
      expect(savedStream).toBeTruthy();
      expect(savedStream!.stream).toHaveLength(2);
      expect(savedStream!.stream[0].label).toBe('bitcoin');
      expect(savedStream!.stream[0].tagged_count).toBe(100);
      expect(savedStream!.stream[1].label).toBe('pubky');
    });

    it('should update existing hot tags stream', async () => {
      const initialTags: Core.NexusHotTag[] = [
        {
          label: 'javascript',
          tagged_count: 75,
          taggers_count: 1,
          taggers_id: ['user4' as Core.Pubky],
        },
      ];

      const updatedTags: Core.NexusHotTag[] = [
        {
          label: 'typescript',
          tagged_count: 120,
          taggers_count: 2,
          taggers_id: ['user5' as Core.Pubky, 'user6' as Core.Pubky],
        },
        {
          label: 'rust',
          tagged_count: 90,
          taggers_count: 1,
          taggers_id: ['user7' as Core.Pubky],
        },
      ];

      await Core.LocalHotService.upsert(streamId, initialTags);
      await Core.LocalHotService.upsert(streamId, updatedTags);

      const savedStream = await Core.TagStreamModel.findById(streamId as Core.TagStreamTypes);
      expect(savedStream).toBeTruthy();
      expect(savedStream!.stream).toHaveLength(2);
      expect(savedStream!.stream[0].label).toBe('typescript');
      expect(savedStream!.stream[1].label).toBe('rust');
    });

    it('should handle empty hot tags array', async () => {
      const emptyTags: Core.NexusHotTag[] = [];

      await Core.LocalHotService.upsert(streamId, emptyTags);

      const savedStream = await Core.TagStreamModel.findById(streamId as Core.TagStreamTypes);
      expect(savedStream).toBeTruthy();
      expect(savedStream!.stream).toEqual([]);
    });

    it('should throw error on database failure', async () => {
      const mockHotTags: Core.NexusHotTag[] = [
        {
          label: 'test',
          tagged_count: 10,
          taggers_count: 1,
          taggers_id: ['user1' as Core.Pubky],
        },
      ];

      const spy = vi.spyOn(Core.TagStreamModel, 'upsert').mockRejectedValueOnce(new Error('Database error'));

      await expect(Core.LocalHotService.upsert(streamId, mockHotTags)).rejects.toThrow('Database error');

      spy.mockRestore();
    });

    it('should log error on failure', async () => {
      const mockHotTags: Core.NexusHotTag[] = [
        {
          label: 'test',
          tagged_count: 10,
          taggers_count: 1,
          taggers_id: ['user1' as Core.Pubky],
        },
      ];

      const loggerSpy = vi.spyOn(Libs.Logger, 'error');
      const upsertSpy = vi.spyOn(Core.TagStreamModel, 'upsert').mockRejectedValueOnce(new Error('Database error'));

      await expect(Core.LocalHotService.upsert(streamId, mockHotTags)).rejects.toThrow();

      expect(loggerSpy).toHaveBeenCalledWith('Failed to upsert hot tag stream', {
        streamId,
        error: expect.any(Error),
      });

      loggerSpy.mockRestore();
      upsertSpy.mockRestore();
    });
  });

  describe('findById', () => {
    it('should retrieve hot tags stream by id', async () => {
      const mockHotTags: Core.NexusHotTag[] = [
        {
          label: 'bitcoin',
          tagged_count: 100,
          taggers_count: 1,
          taggers_id: ['user1' as Core.Pubky],
        },
      ];

      await Core.LocalHotService.upsert(streamId, mockHotTags);

      const result = await Core.LocalHotService.findById(streamId);

      expect(result).toBeTruthy();
      expect(result!.stream).toHaveLength(1);
      expect(result!.stream[0].label).toBe('bitcoin');
    });

    it('should return null when stream does not exist', async () => {
      const result = await Core.LocalHotService.findById('non-existent-stream');

      expect(result).toBeNull();
    });

    it('should throw error on database failure', async () => {
      const spy = vi.spyOn(Core.TagStreamModel, 'findById').mockRejectedValueOnce(new Error('Database error'));

      await expect(Core.LocalHotService.findById(streamId)).rejects.toThrow('Database error');

      spy.mockRestore();
    });

    it('should log error on failure', async () => {
      const loggerSpy = vi.spyOn(Libs.Logger, 'error');
      const findSpy = vi.spyOn(Core.TagStreamModel, 'findById').mockRejectedValueOnce(new Error('Database error'));

      await expect(Core.LocalHotService.findById(streamId)).rejects.toThrow();

      expect(loggerSpy).toHaveBeenCalledWith('Failed to find hot tag stream by id', {
        streamId,
        error: expect.any(Error),
      });

      loggerSpy.mockRestore();
      findSpy.mockRestore();
    });
  });

  describe('deleteById', () => {
    it('should delete hot tags stream by id', async () => {
      const mockHotTags: Core.NexusHotTag[] = [
        {
          label: 'bitcoin',
          tagged_count: 100,
          taggers_count: 1,
          taggers_id: ['user1' as Core.Pubky],
        },
      ];

      await Core.LocalHotService.upsert(streamId, mockHotTags);

      const streamBefore = await Core.TagStreamModel.findById(streamId as Core.TagStreamTypes);
      expect(streamBefore).toBeTruthy();

      await Core.LocalHotService.deleteById(streamId);

      const streamAfter = await Core.TagStreamModel.findById(streamId as Core.TagStreamTypes);
      expect(streamAfter).toBeNull();
    });

    it('should not throw when deleting non-existent stream', async () => {
      await expect(Core.LocalHotService.deleteById('non-existent-stream')).resolves.not.toThrow();
    });

    it('should log info when stream is cleared', async () => {
      const mockHotTags: Core.NexusHotTag[] = [
        {
          label: 'bitcoin',
          tagged_count: 100,
          taggers_count: 1,
          taggers_id: ['user1' as Core.Pubky],
        },
      ];

      await Core.LocalHotService.upsert(streamId, mockHotTags);

      const loggerSpy = vi.spyOn(Libs.Logger, 'info');

      await Core.LocalHotService.deleteById(streamId);

      expect(loggerSpy).toHaveBeenCalledWith('Hot tag stream cleared', { streamId });

      loggerSpy.mockRestore();
    });

    it('should throw error on database failure', async () => {
      const spy = vi.spyOn(Core.TagStreamModel, 'deleteById').mockRejectedValueOnce(new Error('Database error'));

      await expect(Core.LocalHotService.deleteById(streamId)).rejects.toThrow('Database error');

      spy.mockRestore();
    });

    it('should log error on failure', async () => {
      const loggerSpy = vi.spyOn(Libs.Logger, 'error');
      const deleteSpy = vi.spyOn(Core.TagStreamModel, 'deleteById').mockRejectedValueOnce(new Error('Database error'));

      await expect(Core.LocalHotService.deleteById(streamId)).rejects.toThrow();

      expect(loggerSpy).toHaveBeenCalledWith('Failed to clear hot tag stream', {
        streamId,
        error: expect.any(Error),
      });

      loggerSpy.mockRestore();
      deleteSpy.mockRestore();
    });
  });

  describe('stream persistence patterns', () => {
    it('should handle multiple streams independently', async () => {
      const stream1Id = 'hot-tags-timeline';
      const stream2Id = 'hot-tags-following';

      const tags1: Core.NexusHotTag[] = [
        {
          label: 'stream1-tag',
          tagged_count: 50,
          taggers_count: 1,
          taggers_id: ['user1' as Core.Pubky],
        },
      ];

      const tags2: Core.NexusHotTag[] = [
        {
          label: 'stream2-tag',
          tagged_count: 75,
          taggers_count: 1,
          taggers_id: ['user2' as Core.Pubky],
        },
      ];

      await Core.LocalHotService.upsert(stream1Id, tags1);
      await Core.LocalHotService.upsert(stream2Id, tags2);

      const result1 = await Core.LocalHotService.findById(stream1Id);
      const result2 = await Core.LocalHotService.findById(stream2Id);

      expect(result1!.stream[0].label).toBe('stream1-tag');
      expect(result2!.stream[0].label).toBe('stream2-tag');
    });

    it('should preserve hot tag metadata when persisting', async () => {
      const mockHotTags: Core.NexusHotTag[] = [
        {
          label: 'bitcoin',
          tagged_count: 150,
          taggers_count: 3,
          taggers_id: ['user1' as Core.Pubky, 'user2' as Core.Pubky, 'user3' as Core.Pubky],
        },
      ];

      await Core.LocalHotService.upsert(streamId, mockHotTags);

      const result = await Core.LocalHotService.findById(streamId);

      expect(result!.stream[0].tagged_count).toBe(150);
      expect(result!.stream[0].taggers_id).toEqual(['user1', 'user2', 'user3']);
      expect(result!.stream[0].taggers_count).toBe(3);
    });
  });
});
