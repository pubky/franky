import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as Core from '@/core';
import { Logger } from '@/libs';

const muter = 'pubky_muter' as Core.Pubky;
const mutee = 'pubky_mutee' as Core.Pubky;

async function clearUserRelationshipsTable() {
  await Core.db.transaction('rw', [Core.UserRelationshipsModel.table], async () => {
    await Core.UserRelationshipsModel.table.clear();
  });
}

describe('LocalMuteService', () => {
  beforeEach(async () => {
    await Core.db.initialize();
    await clearUserRelationshipsTable();
  });

  describe.each([
    ['create', 'mute', true, 'Failed to create mute relationship'],
    ['delete', 'unmute', false, 'Failed to delete mute relationship'],
  ])('%s operation', (operation, action, expectedStatus, expectedErrorMessage) => {
    const service = Core.Local.Mute[operation as keyof typeof Core.Local.Mute] as typeof Core.Local.Mute.create;

    it(`should ${action} when no relationship exists`, async () => {
      await service({ muter, mutee });

      const rel = await Core.UserRelationshipsModel.table.get(mutee);
      expect(rel).toBeDefined();
      expect(rel?.muted).toBe(expectedStatus);
      expect(rel?.following).toBe(false);
      expect(rel?.followed_by).toBe(false);
    });

    it(`should update existing relationship to muted=${expectedStatus}`, async () => {
      await Core.UserRelationshipsModel.create({
        id: mutee,
        following: true,
        followed_by: true,
        muted: !expectedStatus,
      });

      await service({ muter, mutee });

      const rel = await Core.UserRelationshipsModel.table.get(mutee);
      expect(rel?.muted).toBe(expectedStatus);
      expect(rel?.following).toBe(true);
      expect(rel?.followed_by).toBe(true);
    });

    it(`should be idempotent when user already ${action}d`, async () => {
      await Core.UserRelationshipsModel.create({
        id: mutee,
        following: false,
        followed_by: false,
        muted: expectedStatus,
      });

      const updateSpy = vi.spyOn(Core.UserRelationshipsModel, 'update');
      await service({ muter, mutee });

      const rel = await Core.UserRelationshipsModel.table.get(mutee);
      expect(rel?.muted).toBe(expectedStatus);
      expect(updateSpy).not.toHaveBeenCalled();
      updateSpy.mockRestore();
    });

    it('should handle database failures atomically', async () => {
      const spy = vi.spyOn(Core.UserRelationshipsModel, 'create').mockRejectedValueOnce(new Error('fail'));

      await expect(service({ muter, mutee })).rejects.toThrow();

      const rel = await Core.UserRelationshipsModel.table.get(mutee);
      expect(rel).toBeUndefined();
      spy.mockRestore();
    });

    it('should rollback when update fails', async () => {
      await Core.UserRelationshipsModel.create({
        id: mutee,
        following: false,
        followed_by: false,
        muted: !expectedStatus,
      });

      const spy = vi.spyOn(Core.UserRelationshipsModel, 'update').mockRejectedValueOnce(new Error('update-fail'));

      try {
        await service({ muter, mutee });
        expect.unreachable('should throw');
      } catch (err: unknown) {
        const e = err as { message?: string; details?: { error?: { message?: string } } };
        expect(e.message ?? '').toMatch(expectedErrorMessage);
        expect(e.details?.error?.message ?? '').toMatch('update-fail');
      }

      const rel = await Core.UserRelationshipsModel.table.get(mutee);
      expect(rel?.muted).toBe(!expectedStatus);
      spy.mockRestore();
    });

    it('should handle double operations without issues', async () => {
      await service({ muter, mutee });
      await service({ muter, mutee });

      const rel = await Core.UserRelationshipsModel.table.get(mutee);
      expect(rel).toBeDefined();
      expect(rel?.muted).toBe(expectedStatus);
    });
  });

  describe('Logging', () => {
    it('should log success messages correctly', async () => {
      const debugSpy = vi.spyOn(Logger, 'debug');
      
      await Core.Local.Mute.create({ muter, mutee });
      expect(debugSpy).toHaveBeenCalledWith('Mute created successfully', { muter, mutee });

      await Core.Local.Mute.delete({ muter, mutee });
      expect(debugSpy).toHaveBeenCalledWith('Unmute completed successfully', { muter, mutee });

      debugSpy.mockRestore();
    });

    it('should log error messages correctly', async () => {
      const errorSpy = vi.spyOn(Logger, 'error');
      const spy = vi.spyOn(Core.UserRelationshipsModel, 'create').mockRejectedValueOnce(new Error('test-error'));

      try {
        await Core.Local.Mute.create({ muter, mutee });
      } catch {
        // Expected to throw
      }

      expect(errorSpy).toHaveBeenCalledWith('Failed to mute a user', { muter, mutee, error: expect.any(Error) });
      
      spy.mockRestore();
      errorSpy.mockRestore();
    });
  });

  describe('Error Types', () => {
    it('should throw SAVE_FAILED for create operations', async () => {
      const spy = vi.spyOn(Core.UserRelationshipsModel, 'create').mockRejectedValueOnce(new Error('fail'));

      try {
        await Core.Local.Mute.create({ muter, mutee });
        expect.unreachable('should throw');
      } catch (err: unknown) {
        const e = err as { type?: string };
        expect(e.type).toBe('SAVE_FAILED');
      }

      spy.mockRestore();
    });

    it('should throw DELETE_FAILED for delete operations', async () => {
      const spy = vi.spyOn(Core.UserRelationshipsModel, 'create').mockRejectedValueOnce(new Error('fail'));

      try {
        await Core.Local.Mute.delete({ muter, mutee });
        expect.unreachable('should throw');
      } catch (err: unknown) {
        const e = err as { type?: string };
        expect(e.type).toBe('DELETE_FAILED');
      }

      spy.mockRestore();
    });
  });
});
