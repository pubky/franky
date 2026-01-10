import { describe, it, expect, beforeEach } from 'vitest';
import * as Core from '@/core';

describe('ModerationModel', () => {
  beforeEach(async () => {
    await Core.db.initialize();
    await Core.db.transaction('rw', [Core.ModerationModel.table], async () => {
      await Core.ModerationModel.table.clear();
    });
  });

  it('should create and retrieve post moderation records', async () => {
    const postId = 'author:post1';
    await Core.ModerationModel.upsert({
      id: postId,
      type: Core.ModerationType.POST,
      is_blurred: true,
      created_at: Date.now(),
    });

    const record = await Core.ModerationModel.table.get(postId);
    expect(record).toBeTruthy();
    expect(record!.id).toBe(postId);
    expect(record!.type).toBe(Core.ModerationType.POST);
    expect(record!.is_blurred).toBe(true);
  });

  it('should create and retrieve profile moderation records', async () => {
    const profileId = 'pk:user1';
    await Core.ModerationModel.upsert({
      id: profileId,
      type: Core.ModerationType.PROFILE,
      is_blurred: true,
      created_at: Date.now(),
    });

    const record = await Core.ModerationModel.table.get(profileId);
    expect(record).toBeTruthy();
    expect(record!.id).toBe(profileId);
    expect(record!.type).toBe(Core.ModerationType.PROFILE);
    expect(record!.is_blurred).toBe(true);
  });

  it('should delete moderation records', async () => {
    const postId = 'author:post1';
    await Core.ModerationModel.upsert({
      id: postId,
      type: Core.ModerationType.POST,
      is_blurred: true,
      created_at: Date.now(),
    });

    await Core.ModerationModel.deleteById(postId);

    const record = await Core.ModerationModel.table.get(postId);
    expect(record).toBeUndefined();
  });

  it('should check existence of records', async () => {
    const postId = 'author:post1';
    await Core.ModerationModel.upsert({
      id: postId,
      type: Core.ModerationType.POST,
      is_blurred: true,
      created_at: Date.now(),
    });

    const exists = await Core.ModerationModel.exists(postId);
    expect(exists).toBe(true);

    const notExists = await Core.ModerationModel.exists('author:post2');
    expect(notExists).toBe(false);
  });

  it('should update is_blurred field', async () => {
    const postId = 'author:post1';
    await Core.ModerationModel.upsert({
      id: postId,
      type: Core.ModerationType.POST,
      is_blurred: true,
      created_at: Date.now(),
    });

    await Core.ModerationModel.update(postId, { is_blurred: false });

    const record = await Core.ModerationModel.table.get(postId);
    expect(record!.is_blurred).toBe(false);
  });
});
