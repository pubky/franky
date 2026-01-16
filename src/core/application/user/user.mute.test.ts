import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as Core from '@/core';
import { HttpMethod } from '@/libs';
import { UserApplication } from './user';

describe('UserApplication.commitMute', () => {
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

  describe.each<['PUT' | 'DELETE', 'mute' | 'unmute', boolean]>([
    ['PUT', 'mute', true],
    ['DELETE', 'unmute', false],
  ])('%s operation', (eventType, action, expectedStatus) => {
    const homeserverAction = eventType === 'PUT' ? HttpMethod.PUT : HttpMethod.DELETE;

    it(`should ${action} when no relationship exists`, async () => {
      const requestSpy = vi.spyOn(Core.HomeserverService, 'request').mockResolvedValue(undefined as unknown as void);

      await UserApplication.commitMute({
        eventType: homeserverAction,
        muteUrl,
        muteJson,
        muter,
        mutee,
      });

      const rel = await Core.UserRelationshipsModel.findById(mutee);
      expect(rel).toBeDefined();
      expect(rel?.muted).toBe(expectedStatus);
      expect(rel?.following).toBe(false);
      expect(rel?.followed_by).toBe(false);
      expect(requestSpy).toHaveBeenCalledWith({ method: homeserverAction, url: muteUrl, bodyJson: muteJson });
    });

    it(`should update existing relationship to muted=${expectedStatus}`, async () => {
      await Core.UserRelationshipsModel.create({
        id: mutee,
        following: true,
        followed_by: true,
        muted: !expectedStatus,
      });

      const requestSpy = vi.spyOn(Core.HomeserverService, 'request').mockResolvedValue(undefined as unknown as void);

      await UserApplication.commitMute({
        eventType: homeserverAction,
        muteUrl,
        muteJson,
        muter,
        mutee,
      });

      const rel = await Core.UserRelationshipsModel.findById(mutee);
      expect(rel?.muted).toBe(expectedStatus);
      expect(rel?.following).toBe(true);
      expect(rel?.followed_by).toBe(true);
      expect(requestSpy).toHaveBeenCalledWith({ method: homeserverAction, url: muteUrl, bodyJson: muteJson });
    });

    it(`should be idempotent when user already ${action}d`, async () => {
      await Core.UserRelationshipsModel.create({
        id: mutee,
        following: false,
        followed_by: false,
        muted: expectedStatus,
      });

      const updateSpy = vi.spyOn(Core.UserRelationshipsModel, 'update');
      const requestSpy = vi.spyOn(Core.HomeserverService, 'request').mockResolvedValue(undefined as unknown as void);

      await UserApplication.commitMute({
        eventType: homeserverAction,
        muteUrl,
        muteJson,
        muter,
        mutee,
      });

      const rel = await Core.UserRelationshipsModel.findById(mutee);
      expect(rel?.muted).toBe(expectedStatus);
      expect(updateSpy).not.toHaveBeenCalled();
      expect(requestSpy).toHaveBeenCalledWith({ method: homeserverAction, url: muteUrl, bodyJson: muteJson });
    });
  });

  describe('Operation Order', () => {
    it('should call database operation before homeserver for PUT', async () => {
      const createSpy = vi.spyOn(Core.LocalMuteService, 'create');
      const requestSpy = vi.spyOn(Core.HomeserverService, 'request').mockResolvedValue(undefined as unknown as void);

      await UserApplication.commitMute({
        eventType: HttpMethod.PUT,
        muteUrl,
        muteJson,
        muter,
        mutee,
      });

      expect(createSpy.mock.invocationCallOrder[0]).toBeLessThan(requestSpy.mock.invocationCallOrder[0]);
    });

    it('should call database operation before homeserver for DELETE', async () => {
      const deleteSpy = vi.spyOn(Core.LocalMuteService, 'delete');
      const requestSpy = vi.spyOn(Core.HomeserverService, 'request').mockResolvedValue(undefined as unknown as void);

      await UserApplication.commitMute({
        eventType: HttpMethod.DELETE,
        muteUrl,
        muteJson,
        muter,
        mutee,
      });

      expect(deleteSpy.mock.invocationCallOrder[0]).toBeLessThan(requestSpy.mock.invocationCallOrder[0]);
    });
  });

  describe('Error Handling', () => {
    it('should not call homeserver when database operation fails', async () => {
      const findByIdSpy = vi.spyOn(Core.UserRelationshipsModel, 'findById').mockRejectedValue(new Error('db-fail'));
      const requestSpy = vi.spyOn(Core.HomeserverService, 'request').mockResolvedValue(undefined as unknown as void);

      try {
        await expect(
          UserApplication.commitMute({
            eventType: HttpMethod.PUT,
            muteUrl,
            muteJson,
            muter,
            mutee,
          }),
        ).rejects.toThrow('Failed to mute mute relationship');

        expect(requestSpy).not.toHaveBeenCalled();
      } finally {
        findByIdSpy.mockRestore();
      }
    });

    it('should propagate homeserver errors', async () => {
      const requestSpy = vi.spyOn(Core.HomeserverService, 'request').mockRejectedValue(new Error('homeserver-fail'));

      await expect(
        UserApplication.commitMute({
          eventType: HttpMethod.PUT,
          muteUrl,
          muteJson,
          muter,
          mutee,
        }),
      ).rejects.toThrow('homeserver-fail');

      expect(requestSpy).toHaveBeenCalledWith({ method: HttpMethod.PUT, url: muteUrl, bodyJson: muteJson });
    });

    it('should rollback database transaction when update fails', async () => {
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
          UserApplication.commitMute({
            eventType: HttpMethod.PUT,
            muteUrl,
            muteJson,
            muter,
            mutee,
          }),
        ).rejects.toThrow('Failed to mute mute relationship');

        const rel = await Core.UserRelationshipsModel.findById(mutee);
        expect(rel?.muted).toBe(false);
        expect(requestSpy).not.toHaveBeenCalled();
      } finally {
        updateSpy.mockRestore();
      }
    });

    it('should handle both database and homeserver failures', async () => {
      const createSpy = vi.spyOn(Core.LocalMuteService, 'create').mockRejectedValue(new Error('db-fail'));
      const requestSpy = vi.spyOn(Core.HomeserverService, 'request').mockRejectedValue(new Error('homeserver-fail'));

      await expect(
        UserApplication.commitMute({
          eventType: HttpMethod.PUT,
          muteUrl,
          muteJson,
          muter,
          mutee,
        }),
      ).rejects.toThrow('db-fail');

      expect(createSpy).toHaveBeenCalled();
      expect(requestSpy).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid event types gracefully', async () => {
      const requestSpy = vi.spyOn(Core.HomeserverService, 'request').mockResolvedValue(undefined as unknown as void);

      await UserApplication.commitMute({
        eventType: 'INVALID' as unknown as HttpMethod,
        muteUrl,
        muteJson,
        muter,
        mutee,
      });

      expect(requestSpy).not.toHaveBeenCalled();
    });

    it('should handle undefined return values correctly', async () => {
      const requestSpy = vi.spyOn(Core.HomeserverService, 'request').mockResolvedValue(undefined as unknown as void);

      const result = await UserApplication.commitMute({
        eventType: HttpMethod.DELETE,
        muteUrl,
        muteJson,
        muter,
        mutee,
      });

      expect(result).toBeUndefined();
      expect(requestSpy).toHaveBeenCalled();
    });
  });
});
