import { describe, it, expect, beforeEach } from 'vitest';
import * as Core from '@/core';

describe('LocalModerationService', () => {
  beforeEach(async () => {
    await Core.db.initialize();
    await Core.db.transaction('rw', [Core.ModerationModel.table], async () => {
      await Core.ModerationModel.table.clear();
    });
  });

  describe('setUnblur', () => {
    it('should set is_blurred to false for posts', async () => {
      const postId = 'author:post1';
      await Core.ModerationModel.upsert({
        id: postId,
        type: Core.ModerationType.POST,
        is_blurred: true,
        created_at: Date.now(),
      });

      await Core.LocalModerationService.setUnblur(postId);

      const record = await Core.ModerationModel.table.get(postId);
      expect(record).toBeTruthy();
      expect(record!.is_blurred).toBe(false);
    });

    it('should set is_blurred to false for profiles', async () => {
      const profileId = 'pk:user1';
      await Core.ModerationModel.upsert({
        id: profileId,
        type: Core.ModerationType.PROFILE,
        is_blurred: true,
        created_at: Date.now(),
      });

      await Core.LocalModerationService.setUnblur(profileId);

      const record = await Core.ModerationModel.table.get(profileId);
      expect(record).toBeTruthy();
      expect(record!.is_blurred).toBe(false);
    });

    it('should do nothing if item is not in moderation table', async () => {
      const postId = 'author:post1';

      await Core.LocalModerationService.setUnblur(postId);

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
      await Core.ModerationModel.upsert({
        id: postId,
        type: Core.ModerationType.POST,
        is_blurred: true,
        created_at: Date.now(),
      });

      const result = await Core.LocalModerationService.getModerationRecord(postId);

      expect(result).toBeTruthy();
      expect(result!.id).toBe(postId);
      expect(result!.is_blurred).toBe(true);
    });

    it('should return correct record for specific post', async () => {
      const postId1 = 'author:post1';
      const postId2 = 'author:post2';
      await Core.ModerationModel.upsert({
        id: postId1,
        type: Core.ModerationType.POST,
        is_blurred: false,
        created_at: Date.now(),
      });
      await Core.ModerationModel.upsert({
        id: postId2,
        type: Core.ModerationType.POST,
        is_blurred: true,
        created_at: Date.now(),
      });

      const result1 = await Core.LocalModerationService.getModerationRecord(postId1);
      const result2 = await Core.LocalModerationService.getModerationRecord(postId2);

      expect(result1!.is_blurred).toBe(false);
      expect(result2!.is_blurred).toBe(true);
    });

    it('should return null when type filter does not match', async () => {
      const postId = 'author:post1';
      await Core.ModerationModel.upsert({
        id: postId,
        type: Core.ModerationType.POST,
        is_blurred: true,
        created_at: Date.now(),
      });

      const result = await Core.LocalModerationService.getModerationRecord(postId, Core.ModerationType.PROFILE);

      expect(result).toBeNull();
    });

    it('should return record when type filter matches', async () => {
      const profileId = 'pk:user1';
      await Core.ModerationModel.upsert({
        id: profileId,
        type: Core.ModerationType.PROFILE,
        is_blurred: true,
        created_at: Date.now(),
      });

      const result = await Core.LocalModerationService.getModerationRecord(profileId, Core.ModerationType.PROFILE);

      expect(result).toBeTruthy();
      expect(result!.id).toBe(profileId);
      expect(result!.type).toBe(Core.ModerationType.PROFILE);
    });
  });

  describe('getModerationRecords', () => {
    it('should return all records when no type filter', async () => {
      await Core.ModerationModel.upsert({
        id: 'pk:user1',
        type: Core.ModerationType.PROFILE,
        is_blurred: true,
        created_at: Date.now(),
      });
      await Core.ModerationModel.upsert({
        id: 'author:post1',
        type: Core.ModerationType.POST,
        is_blurred: true,
        created_at: Date.now(),
      });

      const results = await Core.LocalModerationService.getModerationRecords(['pk:user1', 'author:post1']);

      expect(results).toHaveLength(2);
      expect(results.map((r) => r.id)).toContain('pk:user1');
      expect(results.map((r) => r.id)).toContain('author:post1');
    });

    it('should return only profile records when filtered by type', async () => {
      await Core.ModerationModel.upsert({
        id: 'pk:user1',
        type: Core.ModerationType.PROFILE,
        is_blurred: true,
        created_at: Date.now(),
      });
      await Core.ModerationModel.upsert({
        id: 'pk:user2',
        type: Core.ModerationType.PROFILE,
        is_blurred: false,
        created_at: Date.now(),
      });
      await Core.ModerationModel.upsert({
        id: 'author:post1',
        type: Core.ModerationType.POST,
        is_blurred: true,
        created_at: Date.now(),
      });

      const results = await Core.LocalModerationService.getModerationRecords(
        ['pk:user1', 'pk:user2', 'author:post1'],
        Core.ModerationType.PROFILE,
      );

      expect(results).toHaveLength(2);
      expect(results.map((r) => r.id)).toContain('pk:user1');
      expect(results.map((r) => r.id)).toContain('pk:user2');
      expect(results.map((r) => r.id)).not.toContain('author:post1');
    });

    it('should return only post records when filtered by type', async () => {
      await Core.ModerationModel.upsert({
        id: 'pk:user1',
        type: Core.ModerationType.PROFILE,
        is_blurred: true,
        created_at: Date.now(),
      });
      await Core.ModerationModel.upsert({
        id: 'author:post1',
        type: Core.ModerationType.POST,
        is_blurred: true,
        created_at: Date.now(),
      });

      const results = await Core.LocalModerationService.getModerationRecords(
        ['pk:user1', 'author:post1'],
        Core.ModerationType.POST,
      );

      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('author:post1');
    });
  });
});
