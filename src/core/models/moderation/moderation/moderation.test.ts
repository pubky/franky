import { describe, it, expect, beforeEach } from 'vitest';
import * as Core from '@/core';

describe('ModerationModel', () => {
  beforeEach(async () => {
    await Core.db.initialize();
    await Core.db.transaction('rw', [Core.ModerationModel.table], async () => {
      await Core.ModerationModel.table.clear();
    });
  });

  describe('bulkExists', () => {
    it('should return empty set for empty input', async () => {
      const result = await Core.ModerationModel.bulkExists([]);

      expect(result).toEqual(new Set());
    });

    it('should return set of existing post IDs', async () => {
      const postIds = ['author:post1', 'author:post2', 'author:post3'];
      await Core.ModerationModel.upsert({ id: 'author:post1', created_at: 123456 });
      await Core.ModerationModel.upsert({ id: 'author:post3', created_at: 123458 });

      const result = await Core.ModerationModel.bulkExists(postIds);

      expect(result).toEqual(new Set(['author:post1', 'author:post3']));
    });

    it('should return empty set when no records exist', async () => {
      const postIds = ['author:post1', 'author:post2', 'author:post3'];

      const result = await Core.ModerationModel.bulkExists(postIds);

      expect(result).toEqual(new Set());
    });

    it('should return all IDs when all records exist', async () => {
      const postIds = ['author:post1', 'author:post2', 'author:post3'];
      await Core.ModerationModel.upsert({ id: 'author:post1', created_at: 123456 });
      await Core.ModerationModel.upsert({ id: 'author:post2', created_at: 123457 });
      await Core.ModerationModel.upsert({ id: 'author:post3', created_at: 123458 });

      const result = await Core.ModerationModel.bulkExists(postIds);

      expect(result).toEqual(new Set(postIds));
    });

    it('should handle single post ID', async () => {
      const postIds = ['author:post1'];
      await Core.ModerationModel.upsert({ id: 'author:post1', created_at: 123456 });

      const result = await Core.ModerationModel.bulkExists(postIds);

      expect(result).toEqual(new Set(['author:post1']));
    });

    it('should handle mixed existing and non-existing records', async () => {
      const postIds = ['author:post1', 'author:post2', 'author:post3', 'author:post4', 'author:post5'];
      await Core.ModerationModel.upsert({ id: 'author:post1', created_at: Date.now() });
      await Core.ModerationModel.upsert({ id: 'author:post3', created_at: Date.now() });
      await Core.ModerationModel.upsert({ id: 'author:post5', created_at: Date.now() });

      const result = await Core.ModerationModel.bulkExists(postIds);

      expect(result).toEqual(new Set(['author:post1', 'author:post3', 'author:post5']));
      expect(result.has('author:post2')).toBe(false);
      expect(result.has('author:post4')).toBe(false);
    });
  });
});
