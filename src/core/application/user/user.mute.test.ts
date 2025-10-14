import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as Core from '@/core';
import { UserApplication } from './user';

describe('UserApplication.mute', () => {
  const muter = 'pubky_muter' as Core.Pubky;
  const mutee = 'pubky_mutee' as Core.Pubky;
  const muteUrl = 'pubky://muter/pub/pubky.app/mutes/mutee';
  const muteJson = { created_at: BigInt(Date.now()) } as unknown as Record<string, unknown>;

  async function clearUserRelationshipsTable() {
    await Core.db.transaction('rw', [Core.UserRelationshipsModel.table], async () => {
      await Core.UserRelationshipsModel.table.clear();
    });
  }

  beforeEach(async () => {
    await Core.db.initialize();
    await clearUserRelationshipsTable();
    vi.clearAllMocks();
  });

  describe('PUT (mute user)', () => {
    it('should create relationship with muted=true when no relationship exists', async () => {
      const requestSpy = vi.spyOn(Core.HomeserverService, 'request').mockResolvedValue(undefined as unknown as void);

      await UserApplication.mute({
        eventType: Core.HomeserverAction.PUT,
        muteUrl,
        muteJson,
        muter,
        mutee,
      });

      const rel = await Core.UserRelationshipsModel.findById(mutee);
      expect(rel).toBeDefined();
      expect(rel?.muted).toBe(true);
      expect(rel?.following).toBe(false);
      expect(rel?.followed_by).toBe(false);
      expect(requestSpy).toHaveBeenCalledWith(Core.HomeserverAction.PUT, muteUrl, muteJson);
    });

    it('should update existing relationship to muted=true', async () => {
      await Core.UserRelationshipsModel.create({
        id: mutee,
        following: true,
        followed_by: true,
        muted: false,
      });

      const requestSpy = vi.spyOn(Core.HomeserverService, 'request').mockResolvedValue(undefined as unknown as void);

      await UserApplication.mute({
        eventType: Core.HomeserverAction.PUT,
        muteUrl,
        muteJson,
        muter,
        mutee,
      });

      const rel = await Core.UserRelationshipsModel.findById(mutee);
      expect(rel).toBeDefined();
      expect(rel?.muted).toBe(true);
      expect(rel?.following).toBe(true);
      expect(rel?.followed_by).toBe(true);
      expect(requestSpy).toHaveBeenCalledWith(Core.HomeserverAction.PUT, muteUrl, muteJson);
    });

    it('should be idempotent when user already muted', async () => {
      await Core.UserRelationshipsModel.create({
        id: mutee,
        following: false,
        followed_by: false,
        muted: true,
      });

      const updateSpy = vi.spyOn(Core.UserRelationshipsModel, 'update');
      const requestSpy = vi.spyOn(Core.HomeserverService, 'request').mockResolvedValue(undefined as unknown as void);

      await UserApplication.mute({
        eventType: Core.HomeserverAction.PUT,
        muteUrl,
        muteJson,
        muter,
        mutee,
      });

      const rel = await Core.UserRelationshipsModel.findById(mutee);
      expect(rel?.muted).toBe(true);
      expect(updateSpy).not.toHaveBeenCalled();
      expect(requestSpy).toHaveBeenCalledWith(Core.HomeserverAction.PUT, muteUrl, muteJson);
    });
  });

  describe('DELETE (unmute user)', () => {
    it('should update existing relationship to muted=false', async () => {
      await Core.UserRelationshipsModel.create({
        id: mutee,
        following: true,
        followed_by: false,
        muted: true,
      });

      const requestSpy = vi.spyOn(Core.HomeserverService, 'request').mockResolvedValue(undefined as unknown as void);

      await UserApplication.mute({
        eventType: Core.HomeserverAction.DELETE,
        muteUrl,
        muteJson,
        muter,
        mutee,
      });

      const rel = await Core.UserRelationshipsModel.findById(mutee);
      expect(rel).toBeDefined();
      expect(rel?.muted).toBe(false);
      expect(rel?.following).toBe(true);
      expect(rel?.followed_by).toBe(false);
      expect(requestSpy).toHaveBeenCalledWith(Core.HomeserverAction.DELETE, muteUrl, muteJson);
    });

    it('should create relationship with muted=false when no relationship exists', async () => {
      const requestSpy = vi.spyOn(Core.HomeserverService, 'request').mockResolvedValue(undefined as unknown as void);

      await UserApplication.mute({
        eventType: Core.HomeserverAction.DELETE,
        muteUrl,
        muteJson,
        muter,
        mutee,
      });

      const rel = await Core.UserRelationshipsModel.findById(mutee);
      expect(rel).toBeDefined();
      expect(rel?.muted).toBe(false);
      expect(rel?.following).toBe(false);
      expect(rel?.followed_by).toBe(false);
      expect(requestSpy).toHaveBeenCalledWith(Core.HomeserverAction.DELETE, muteUrl, muteJson);
    });

    it('should be idempotent when user already unmuted', async () => {
      await Core.UserRelationshipsModel.create({
        id: mutee,
        following: false,
        followed_by: false,
        muted: false,
      });

      const updateSpy = vi.spyOn(Core.UserRelationshipsModel, 'update');
      const requestSpy = vi.spyOn(Core.HomeserverService, 'request').mockResolvedValue(undefined as unknown as void);

      await UserApplication.mute({
        eventType: Core.HomeserverAction.DELETE,
        muteUrl,
        muteJson,
        muter,
        mutee,
      });

      const rel = await Core.UserRelationshipsModel.findById(mutee);
      expect(rel?.muted).toBe(false);
      expect(updateSpy).not.toHaveBeenCalled();
      expect(requestSpy).toHaveBeenCalledWith(Core.HomeserverAction.DELETE, muteUrl, muteJson);
    });
  });

  describe('error handling', () => {
    it('should propagate error when database transaction fails and not call homeserver', async () => {
      const findByIdSpy = vi.spyOn(Core.UserRelationshipsModel, 'findById').mockRejectedValue(new Error('db-fail'));
      const requestSpy = vi.spyOn(Core.HomeserverService, 'request').mockResolvedValue(undefined as unknown as void);

      try {
        await expect(
          UserApplication.mute({
            eventType: Core.HomeserverAction.PUT,
            muteUrl,
            muteJson,
            muter,
            mutee,
          }),
        ).rejects.toThrow('Failed to create mute relationship');

        expect(requestSpy).not.toHaveBeenCalled();
      } finally {
        findByIdSpy.mockRestore();
      }
    });

    it('should propagate error when homeserver request fails', async () => {
      const requestSpy = vi.spyOn(Core.HomeserverService, 'request').mockRejectedValue(new Error('homeserver-fail'));

      await expect(
        UserApplication.mute({
          eventType: Core.HomeserverAction.PUT,
          muteUrl,
          muteJson,
          muter,
          mutee,
        }),
      ).rejects.toThrow('homeserver-fail');

      expect(requestSpy).toHaveBeenCalledWith(Core.HomeserverAction.PUT, muteUrl, muteJson);
    });

    it('should rollback transaction when update fails', async () => {
      await Core.UserRelationshipsModel.create({
        id: mutee,
        following: false,
        followed_by: false,
        muted: false,
      });

      const updateSpy = vi.spyOn(Core.UserRelationshipsModel, 'update').mockRejectedValue(new Error('update-fail'));
      const requestSpy = vi.spyOn(Core.HomeserverService, 'request').mockResolvedValue(undefined as unknown as void);

      try {
        await expect(
          UserApplication.mute({
            eventType: Core.HomeserverAction.PUT,
            muteUrl,
            muteJson,
            muter,
            mutee,
          }),
        ).rejects.toThrow('Failed to create mute relationship');

        const rel = await Core.UserRelationshipsModel.findById(mutee);
        expect(rel?.muted).toBe(false);
        expect(requestSpy).not.toHaveBeenCalled();
      } finally {
        updateSpy.mockRestore();
      }
    });
  });
});
