import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as Core from '@/core';
import { Logger } from '@/libs';

const muter = 'pubky_muter' as Core.Pubky;
const mutee = 'pubky_mutee' as Core.Pubky;

async function clearTables() {
  await Core.db.transaction('rw', [Core.UserRelationshipsModel.table, Core.UserStreamModel.table], async () => {
    await Core.UserRelationshipsModel.table.clear();
    await Core.UserStreamModel.table.clear();
  });
}

const getMutedStreamId = () => Core.UserStreamTypes.MUTED;

describe('LocalMuteService', () => {
  beforeEach(async () => {
    await Core.db.initialize();
    await clearTables();
  });

  describe.each([
    ['create', 'mute', true, 'Failed to create mute relationship'],
    ['delete', 'unmute', false, 'Failed to delete mute relationship'],
  ])('%s operation', (operation, action, expectedStatus, expectedErrorMessage) => {
    const service = Core.LocalMuteService[
      operation as keyof typeof Core.LocalMuteService
    ] as typeof Core.LocalMuteService.create;

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

      await Core.LocalMuteService.create({ muter, mutee });
      expect(debugSpy).toHaveBeenCalledWith('Mute created successfully', { muter, mutee });

      await Core.LocalMuteService.delete({ muter, mutee });
      expect(debugSpy).toHaveBeenCalledWith('Unmute completed successfully', { muter, mutee });

      debugSpy.mockRestore();
    });

    it('should log error messages correctly', async () => {
      const errorSpy = vi.spyOn(Logger, 'error');
      const spy = vi.spyOn(Core.UserRelationshipsModel, 'create').mockRejectedValueOnce(new Error('test-error'));

      try {
        await Core.LocalMuteService.create({ muter, mutee });
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
        await Core.LocalMuteService.create({ muter, mutee });
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
        await Core.LocalMuteService.delete({ muter, mutee });
        expect.unreachable('should throw');
      } catch (err: unknown) {
        const e = err as { type?: string };
        expect(e.type).toBe('DELETE_FAILED');
      }

      spy.mockRestore();
    });
  });

  describe('Stream Updates', () => {
    it('should add mutee to muted stream on mute', async () => {
      await Core.LocalMuteService.create({ muter, mutee });

      const mutedStream = await Core.UserStreamModel.findById(getMutedStreamId());
      expect(mutedStream?.stream).toContain(mutee);
    });

    it('should remove mutee from muted stream on unmute', async () => {
      // First mute
      await Core.LocalMuteService.create({ muter, mutee });
      expect((await Core.UserStreamModel.findById(getMutedStreamId()))?.stream).toContain(mutee);

      // Then unmute
      await Core.LocalMuteService.delete({ muter, mutee });

      const mutedStream = await Core.UserStreamModel.findById(getMutedStreamId());
      expect(mutedStream?.stream).not.toContain(mutee);
    });

    it('should prepend new muted user to beginning of stream', async () => {
      const mutee2 = 'pubky_mutee_2' as Core.Pubky;

      await Core.LocalMuteService.create({ muter, mutee });
      await Core.LocalMuteService.create({ muter, mutee: mutee2 });

      const mutedStream = await Core.UserStreamModel.findById(getMutedStreamId());
      expect(mutedStream?.stream).toEqual([mutee2, mutee]);
    });

    it('should not add duplicate users to muted stream', async () => {
      await Core.LocalMuteService.create({ muter, mutee });
      await Core.LocalMuteService.create({ muter, mutee });

      const mutedStream = await Core.UserStreamModel.findById(getMutedStreamId());
      expect(mutedStream?.stream.filter((id) => id === mutee)).toHaveLength(1);
    });

    it('should not update streams when mute status does not change', async () => {
      // Already muted
      await Core.UserRelationshipsModel.create({
        id: mutee,
        following: false,
        followed_by: false,
        muted: true,
      });

      const prependSpy = vi.spyOn(Core.LocalStreamUsersService, 'prependToStream');

      await Core.LocalMuteService.create({ muter, mutee });

      expect(prependSpy).not.toHaveBeenCalled();
      prependSpy.mockRestore();
    });

    it('should handle unmute when stream does not exist', async () => {
      // Create relationship without stream
      await Core.UserRelationshipsModel.create({
        id: mutee,
        following: false,
        followed_by: false,
        muted: true,
      });

      // Unmute should not throw even if stream doesn't exist
      await expect(Core.LocalMuteService.delete({ muter, mutee })).resolves.not.toThrow();
    });
  });
});
