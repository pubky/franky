import { describe, it, expect, beforeEach } from 'vitest';
import * as Core from '@/core';

describe('LocalModerationService', () => {
  beforeEach(async () => {
    await Core.db.initialize();
    await Core.db.transaction('rw', [Core.ModerationModel.table], async () => {
      await Core.ModerationModel.table.clear();
    });
  });

  describe('setBlur', () => {
    it('should update is_blurred to true when blur is true', async () => {
      const postId = 'author:post1';
      await Core.ModerationModel.upsert({ id: postId, is_blurred: false, created_at: Date.now() });

      await Core.LocalModerationService.setBlur(postId, true);

      const record = await Core.ModerationModel.table.get(postId);
      expect(record).toBeTruthy();
      expect(record!.is_blurred).toBe(true);
    });

    it('should update is_blurred to false when blur is false', async () => {
      const postId = 'author:post1';
      await Core.ModerationModel.upsert({ id: postId, is_blurred: true, created_at: Date.now() });

      await Core.LocalModerationService.setBlur(postId, false);

      const record = await Core.ModerationModel.table.get(postId);
      expect(record).toBeTruthy();
      expect(record!.is_blurred).toBe(false);
    });

    it('should do nothing if post is not in moderation table', async () => {
      const postId = 'author:post1';

      // Should not throw
      await Core.LocalModerationService.setBlur(postId, false);

      const record = await Core.ModerationModel.table.get(postId);
      expect(record).toBeUndefined();
    });
  });

  describe('getModerationRecord', () => {
    it('should return null when record does not exist', async () => {
      const postId = 'author:post1';

      const result = await Core.LocalModerationService.getModerationRecord(postId);

      expect(result).toBeNull();
    });

    it('should return record when it exists', async () => {
      const postId = 'author:post1';
      await Core.ModerationModel.upsert({ id: postId, is_blurred: true, created_at: Date.now() });

      const result = await Core.LocalModerationService.getModerationRecord(postId);

      expect(result).toBeTruthy();
      expect(result!.id).toBe(postId);
      expect(result!.is_blurred).toBe(true);
    });

    it('should return correct record for specific post', async () => {
      const postId1 = 'author:post1';
      const postId2 = 'author:post2';
      await Core.ModerationModel.upsert({ id: postId1, is_blurred: false, created_at: Date.now() });
      await Core.ModerationModel.upsert({ id: postId2, is_blurred: true, created_at: Date.now() });

      const result1 = await Core.LocalModerationService.getModerationRecord(postId1);
      const result2 = await Core.LocalModerationService.getModerationRecord(postId2);

      expect(result1!.is_blurred).toBe(false);
      expect(result2!.is_blurred).toBe(true);
    });
  });
});
