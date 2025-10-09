import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as Core from '@/core';

const DEFAULT_USER_COUNTS: Core.NexusUserCounts = {
  tagged: 0,
  tags: 0,
  unique_tags: 0,
  posts: 0,
  replies: 0,
  following: 0,
  followers: 0,
  friends: 0,
  bookmarks: 0,
};

const userA = 'pubky_user_A' as Core.Pubky;
const userB = 'pubky_user_B' as Core.Pubky;
const userC = 'pubky_user_C' as Core.Pubky;
const userD = 'pubky_user_D' as Core.Pubky;

async function clearUserTables() {
  await Core.db.transaction(
    'rw',
    [Core.UserCountsModel.table, Core.UserConnectionsModel.table, Core.UserRelationshipsModel.table],
    async () => {
      await Core.UserCountsModel.table.clear();
      await Core.UserConnectionsModel.table.clear();
      await Core.UserRelationshipsModel.table.clear();
    },
  );
}

describe('LocalFollowService.create', () => {
  beforeEach(async () => {
    await Core.db.initialize();
    await clearUserTables();

    // Precreate counts rows so updates succeed deterministically
    await Core.db.transaction('rw', [Core.UserCountsModel.table], async () => {
      await Core.UserCountsModel.table.bulkAdd([
        { id: userA, ...DEFAULT_USER_COUNTS },
        { id: userB, ...DEFAULT_USER_COUNTS },
      ]);
    });
  });

  it('increments following and followers and updates connections', async () => {
    await Core.Local.Follow.create({ follower: userA, followee: userB });

    const [aCounts, bCounts, aConn, bConn] = await Promise.all([
      Core.UserCountsModel.table.get(userA),
      Core.UserCountsModel.table.get(userB),
      Core.UserConnectionsModel.table.get(userA),
      Core.UserConnectionsModel.table.get(userB),
    ]);

    expect(aCounts?.following ?? 0).toBe(1);
    expect(bCounts?.followers ?? 0).toBe(1);
    expect(aConn?.following ?? []).toContain(userB);
    expect(bConn?.followers ?? []).toContain(userA);
  });

  it('increments friends when mutual relationship exists and preserves prepopulated connections', async () => {
    // Seed relationships so that when A follows B, they are friends (mutual)
    await Core.UserRelationshipsModel.create({ id: userB, following: true, followed_by: true, muted: false });

    // Prepopulate connections with additional entries, including existing A<->B link
    await Core.db.transaction('rw', [Core.UserConnectionsModel.table], async () => {
      await Core.UserConnectionsModel.create({
        id: userA,
        following: [userC, userB, userD],
        followers: [userD],
      });
      await Core.UserConnectionsModel.create({
        id: userB,
        following: [userA, userC],
        followers: [userA, userD],
      });
    });

    await Core.Local.Follow.create({ follower: userA, followee: userB });

    const [aCounts, bCounts, aConn, bConn] = await Promise.all([
      Core.UserCountsModel.table.get(userA),
      Core.UserCountsModel.table.get(userB),
      Core.UserConnectionsModel.table.get(userA),
      Core.UserConnectionsModel.table.get(userB),
    ]);

    // Friends increments for both sides
    expect(aCounts?.friends ?? 0).toBe(1);
    expect(bCounts?.friends ?? 0).toBe(1);
    // Following / followers still increment by 1
    expect(aCounts?.following ?? 0).toBe(1);
    expect(bCounts?.followers ?? 0).toBe(1);

    // No duplicate entries added to connections lists
    const aFollowing = aConn?.following ?? [];
    const bFollowers = bConn?.followers ?? [];
    expect(aFollowing.filter((x) => x === userB).length).toBe(1);
    expect(bFollowers.filter((x) => x === userA).length).toBe(1);
    // Other entries preserved
    expect(aFollowing).toEqual([userC, userB, userD]);
    expect(bFollowers).toEqual([userA, userD]);
  });

  it('runs all writes atomically (rollback when a write fails)', async () => {
    const spy = vi.spyOn(Core.UserConnectionsModel, 'createConnection').mockRejectedValueOnce(new Error('fail'));

    await expect(Core.Local.Follow.create({ follower: userA, followee: userB })).rejects.toThrow();

    const [aCounts, bCounts, aConn, bConn] = await Promise.all([
      Core.UserCountsModel.table.get(userA),
      Core.UserCountsModel.table.get(userB),
      Core.UserConnectionsModel.table.get(userA),
      Core.UserConnectionsModel.table.get(userB),
    ]);

    // Counts rows are precreated in beforeEach; ensure values were not modified
    expect(aCounts?.following ?? 0).toBe(0);
    expect(bCounts?.followers ?? 0).toBe(0);
    expect(aConn).toBeUndefined();
    expect(bConn).toBeUndefined();

    spy.mockRestore();
  });
});

describe('LocalFollowService.delete', () => {
  beforeEach(async () => {
    await Core.db.initialize();
    await clearUserTables();

    // Precreate counts rows so updates succeed deterministically
    await Core.db.transaction('rw', [Core.UserCountsModel.table], async () => {
      await Core.UserCountsModel.table.bulkAdd([
        { id: userA, ...DEFAULT_USER_COUNTS, following: 1, friends: 0 },
        { id: userB, ...DEFAULT_USER_COUNTS, followers: 1, friends: 0 },
      ]);
    });

    // Precreate connections simulating existing follow relationship
    await Core.db.transaction('rw', [Core.UserConnectionsModel.table], async () => {
      await Core.UserConnectionsModel.create({
        id: userA,
        following: [userB],
        followers: [],
      });
      await Core.UserConnectionsModel.create({
        id: userB,
        following: [],
        followers: [userA],
      });
    });
  });

  it('decrements following and followers and removes connections', async () => {
    await Core.Local.Follow.delete({ follower: userA, followee: userB });

    const [aCounts, bCounts, aConn, bConn] = await Promise.all([
      Core.UserCountsModel.table.get(userA),
      Core.UserCountsModel.table.get(userB),
      Core.UserConnectionsModel.table.get(userA),
      Core.UserConnectionsModel.table.get(userB),
    ]);

    expect(aCounts?.following ?? 0).toBe(0);
    expect(bCounts?.followers ?? 0).toBe(0);
    expect(aConn?.following ?? []).not.toContain(userB);
    expect(bConn?.followers ?? []).not.toContain(userA);
  });

  it('decrements friends when breaking mutual relationship and preserves other connections', async () => {
    // Update counts to reflect existing friendship
    await Core.db.transaction('rw', [Core.UserCountsModel.table], async () => {
      await Core.UserCountsModel.update(userA, { friends: 1 });
      await Core.UserCountsModel.update(userB, { friends: 1 });
    });

    // Seed relationships showing mutual follow (friends)
    await Core.UserRelationshipsModel.create({ id: userB, following: true, followed_by: true, muted: false });

    // Add additional connections
    await Core.db.transaction('rw', [Core.UserConnectionsModel.table], async () => {
      await Core.UserConnectionsModel.update(userA, {
        following: [userB, userC, userD],
        followers: [userD],
      });
      await Core.UserConnectionsModel.update(userB, {
        following: [userA, userC],
        followers: [userA, userD],
      });
    });

    await Core.Local.Follow.delete({ follower: userA, followee: userB });

    const [aCounts, bCounts, aConn, bConn] = await Promise.all([
      Core.UserCountsModel.table.get(userA),
      Core.UserCountsModel.table.get(userB),
      Core.UserConnectionsModel.table.get(userA),
      Core.UserConnectionsModel.table.get(userB),
    ]);

    // Friends decrements for both sides
    expect(aCounts?.friends ?? 0).toBe(0);
    expect(bCounts?.friends ?? 0).toBe(0);
    // Following / followers decrement by 1
    expect(aCounts?.following ?? 0).toBe(0);
    expect(bCounts?.followers ?? 0).toBe(0);

    // User B removed from A's following, A removed from B's followers
    const aFollowing = aConn?.following ?? [];
    const bFollowers = bConn?.followers ?? [];
    expect(aFollowing).not.toContain(userB);
    expect(bFollowers).not.toContain(userA);
    // Other entries preserved
    expect(aFollowing).toEqual([userC, userD]);
    expect(bFollowers).toEqual([userD]);
  });

  it('runs all writes atomically (rollback when a write fails)', async () => {
    const spy = vi.spyOn(Core.UserConnectionsModel, 'deleteConnection').mockRejectedValueOnce(new Error('fail'));

    await expect(Core.Local.Follow.delete({ follower: userA, followee: userB })).rejects.toThrow();

    const [aCounts, bCounts, aConn, bConn] = await Promise.all([
      Core.UserCountsModel.table.get(userA),
      Core.UserCountsModel.table.get(userB),
      Core.UserConnectionsModel.table.get(userA),
      Core.UserConnectionsModel.table.get(userB),
    ]);

    // Counts remain unchanged (still showing existing follow)
    expect(aCounts?.following ?? 0).toBe(1);
    expect(bCounts?.followers ?? 0).toBe(1);
    // Connections remain unchanged
    expect(aConn?.following ?? []).toContain(userB);
    expect(bConn?.followers ?? []).toContain(userA);

    spy.mockRestore();
  });
});
