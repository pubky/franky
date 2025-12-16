import { describe, it, expect, beforeEach } from 'vitest';
import * as Core from '@/core';

describe('ModerationModel', () => {
  beforeEach(async () => {
    await Core.db.initialize();
    await Core.db.transaction('rw', [Core.ModerationModel.table], async () => {
      await Core.ModerationModel.table.clear();
    });
  });

  it('should create and retrieve moderation records', async () => {
    const postId = 'author:post1';
    await Core.ModerationModel.upsert({ id: postId, created_at: Date.now() });

    const record = await Core.ModerationModel.table.get(postId);
    expect(record).toBeTruthy();
    expect(record!.id).toBe(postId);
  });

  it('should delete moderation records', async () => {
    const postId = 'author:post1';
    await Core.ModerationModel.upsert({ id: postId, created_at: Date.now() });

    await Core.ModerationModel.deleteById(postId);

    const record = await Core.ModerationModel.table.get(postId);
    expect(record).toBeUndefined();
  });

  it('should check existence of records', async () => {
    const postId = 'author:post1';
    await Core.ModerationModel.upsert({ id: postId, created_at: Date.now() });

    const exists = await Core.ModerationModel.exists(postId);
    expect(exists).toBe(true);

    const notExists = await Core.ModerationModel.exists('author:post2');
    expect(notExists).toBe(false);
  });
});
