import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as Core from '@/core';

const muter = 'pubky_muter' as Core.Pubky;
const mutee = 'pubky_mutee' as Core.Pubky;

async function clearUserRelationshipsTable() {
  await Core.db.transaction('rw', [Core.UserRelationshipsModel.table], async () => {
    await Core.UserRelationshipsModel.table.clear();
  });
}

describe('LocalMuteService.create', () => {
  beforeEach(async () => {
    await Core.db.initialize();
    await clearUserRelationshipsTable();
  });

  it('creates relationship with muted=true when no relationship exists', async () => {
    await Core.Local.Mute.create({ muter, mutee });

    const rel = await Core.UserRelationshipsModel.table.get(mutee);
    expect(rel).toBeDefined();
    expect(rel?.muted).toBe(true);
    expect(rel?.following).toBe(false);
    expect(rel?.followed_by).toBe(false);
  });

  it('updates existing relationship to muted=true', async () => {
    await Core.UserRelationshipsModel.create({
      id: mutee,
      following: true,
      followed_by: true,
      muted: false,
    });

    await Core.Local.Mute.create({ muter, mutee });

    const rel = await Core.UserRelationshipsModel.table.get(mutee);
    expect(rel).toBeDefined();
    expect(rel?.muted).toBe(true);
    expect(rel?.following).toBe(true);
    expect(rel?.followed_by).toBe(true);
  });

  it('is idempotent when user already muted', async () => {
    await Core.UserRelationshipsModel.create({
      id: mutee,
      following: false,
      followed_by: false,
      muted: true,
    });

    const updateSpy = vi.spyOn(Core.UserRelationshipsModel, 'update');

    await Core.Local.Mute.create({ muter, mutee });

    const rel = await Core.UserRelationshipsModel.table.get(mutee);
    expect(rel?.muted).toBe(true);
    expect(updateSpy).not.toHaveBeenCalled();

    updateSpy.mockRestore();
  });

  it('runs all writes atomically (rollback when a write fails)', async () => {
    const spy = vi.spyOn(Core.UserRelationshipsModel, 'create').mockRejectedValueOnce(new Error('fail'));

    await expect(Core.Local.Mute.create({ muter, mutee })).rejects.toThrow();

    const rel = await Core.UserRelationshipsModel.table.get(mutee);
    expect(rel).toBeUndefined();

    spy.mockRestore();
  });

  it('double mute does not create duplicate or throw', async () => {
    await Core.Local.Mute.create({ muter, mutee });
    await Core.Local.Mute.create({ muter, mutee });

    const rel = await Core.UserRelationshipsModel.table.get(mutee);
    expect(rel).toBeDefined();
    expect(rel?.muted).toBe(true);
  });

  it('rolls back when update fails', async () => {
    await Core.UserRelationshipsModel.create({
      id: mutee,
      following: false,
      followed_by: false,
      muted: false,
    });

    const spy = vi.spyOn(Core.UserRelationshipsModel, 'update').mockRejectedValueOnce(new Error('update-fail'));

    try {
      await Core.Local.Mute.create({ muter, mutee });
      expect.unreachable('should throw');
    } catch (err: unknown) {
      const e = err as { message?: string; details?: { error?: { message?: string } } };
      expect(e.message ?? '').toMatch('Failed to create mute relationship');
      expect(e.details?.error?.message ?? '').toMatch('update-fail');
    }

    const rel = await Core.UserRelationshipsModel.table.get(mutee);
    expect(rel?.muted).toBe(false);

    spy.mockRestore();
  });
});

describe('LocalMuteService.delete', () => {
  beforeEach(async () => {
    await Core.db.initialize();
    await clearUserRelationshipsTable();
  });

  it('updates existing relationship to muted=false', async () => {
    await Core.UserRelationshipsModel.create({
      id: mutee,
      following: true,
      followed_by: false,
      muted: true,
    });

    await Core.Local.Mute.delete({ muter, mutee });

    const rel = await Core.UserRelationshipsModel.table.get(mutee);
    expect(rel).toBeDefined();
    expect(rel?.muted).toBe(false);
    expect(rel?.following).toBe(true);
    expect(rel?.followed_by).toBe(false);
  });

  it('creates relationship with muted=false when no relationship exists', async () => {
    await Core.Local.Mute.delete({ muter, mutee });

    const rel = await Core.UserRelationshipsModel.table.get(mutee);
    expect(rel).toBeDefined();
    expect(rel?.muted).toBe(false);
    expect(rel?.following).toBe(false);
    expect(rel?.followed_by).toBe(false);
  });

  it('is idempotent when user already unmuted', async () => {
    await Core.UserRelationshipsModel.create({
      id: mutee,
      following: false,
      followed_by: false,
      muted: false,
    });

    const updateSpy = vi.spyOn(Core.UserRelationshipsModel, 'update');

    await Core.Local.Mute.delete({ muter, mutee });

    const rel = await Core.UserRelationshipsModel.table.get(mutee);
    expect(rel?.muted).toBe(false);
    expect(updateSpy).not.toHaveBeenCalled();

    updateSpy.mockRestore();
  });

  it('runs all writes atomically (rollback when a write fails)', async () => {
    const spy = vi.spyOn(Core.UserRelationshipsModel, 'create').mockRejectedValueOnce(new Error('fail'));

    await expect(Core.Local.Mute.delete({ muter, mutee })).rejects.toThrow();

    const rel = await Core.UserRelationshipsModel.table.get(mutee);
    expect(rel).toBeUndefined();

    spy.mockRestore();
  });

  it('double unmute does not create duplicate or throw', async () => {
    await Core.UserRelationshipsModel.create({
      id: mutee,
      following: false,
      followed_by: false,
      muted: true,
    });

    await Core.Local.Mute.delete({ muter, mutee });
    await Core.Local.Mute.delete({ muter, mutee });

    const rel = await Core.UserRelationshipsModel.table.get(mutee);
    expect(rel).toBeDefined();
    expect(rel?.muted).toBe(false);
  });

  it('rolls back when update fails', async () => {
    await Core.UserRelationshipsModel.create({
      id: mutee,
      following: false,
      followed_by: false,
      muted: true,
    });

    const spy = vi.spyOn(Core.UserRelationshipsModel, 'update').mockRejectedValueOnce(new Error('update-fail'));

    try {
      await Core.Local.Mute.delete({ muter, mutee });
      expect.unreachable('should throw');
    } catch (err: unknown) {
      const e = err as { message?: string; details?: { error?: { message?: string } } };
      expect(e.message ?? '').toMatch('Failed to delete mute relationship');
      expect(e.details?.error?.message ?? '').toMatch('update-fail');
    }

    const rel = await Core.UserRelationshipsModel.table.get(mutee);
    expect(rel?.muted).toBe(true);

    spy.mockRestore();
  });
});
