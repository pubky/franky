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
    it('should delete record when blur is true', async () => {
      const postId = 'author:post1';
      await Core.ModerationModel.upsert({ id: postId, created_at: Date.now() });

      await Core.LocalModerationService.setBlur(postId, true);

      const record = await Core.ModerationModel.table.get(postId);
      expect(record).toBeUndefined();
    });

    it('should upsert record when blur is false', async () => {
      const postId = 'author:post1';

      await Core.LocalModerationService.setBlur(postId, false);

      const record = await Core.ModerationModel.table.get(postId);
      expect(record).toBeTruthy();
      expect(record!.id).toBe(postId);
      expect(record!.created_at).toBeGreaterThan(0);
    });

    it('should remove existing record when blur is true', async () => {
      const postId = 'author:post1';
      await Core.ModerationModel.upsert({ id: postId, created_at: Date.now() });

      const before = await Core.ModerationModel.exists(postId);
      expect(before).toBe(true);

      await Core.LocalModerationService.setBlur(postId, true);

      const after = await Core.ModerationModel.exists(postId);
      expect(after).toBe(false);
    });

    it('should create record when blur is false', async () => {
      const postId = 'author:post1';

      const before = await Core.ModerationModel.exists(postId);
      expect(before).toBe(false);

      await Core.LocalModerationService.setBlur(postId, false);

      const after = await Core.ModerationModel.exists(postId);
      expect(after).toBe(true);
    });
  });

  describe('isBlurred', () => {
    it('should return true when record does not exist (blurred)', async () => {
      const postId = 'author:post1';

      const result = await Core.LocalModerationService.isBlurred(postId);

      expect(result).toBe(true);
    });

    it('should return false when record exists (unblurred by user)', async () => {
      const postId = 'author:post1';
      await Core.ModerationModel.upsert({ id: postId, created_at: Date.now() });

      const result = await Core.LocalModerationService.isBlurred(postId);

      expect(result).toBe(false);
    });

    it('should return true for different post without record', async () => {
      const postId1 = 'author:post1';
      const postId2 = 'author:post2';
      await Core.ModerationModel.upsert({ id: postId1, created_at: Date.now() });

      const result1 = await Core.LocalModerationService.isBlurred(postId1);
      const result2 = await Core.LocalModerationService.isBlurred(postId2);

      expect(result1).toBe(false);
      expect(result2).toBe(true);
    });
  });
});
