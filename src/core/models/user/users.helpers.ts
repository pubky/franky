import { db, UserModelPK, NexusUserDetails, UserModel } from '@/core';

export function generateTestUserId(index: number = 0): UserModelPK {
  return `operrr8wsbpr3ue9d4qj41ge1kcc6r7fdiy6o3ugjrrhi4y77rd${index}`;
}

export function createTestUserDetails(overrides: Partial<NexusUserDetails> = {}): NexusUserDetails {
  return {
    id: generateTestUserId(0),
    indexed_at: Date.now(),
    name: 'Test User',
    bio: 'Test Bio',
    image: 'test.jpg',
    status: 'active',
    links: [],
    ...overrides,
  };
}

export async function createTestUsers(count: number): Promise<UserModelPK[]> {
  const userIds: UserModelPK[] = [];
  for (let i = 0; i < count; i++) {
    const userId = generateTestUserId(i);
    await db.users.add(
      new UserModel({
        id: userId,
        details: createTestUserDetails({ name: `Test User ${i}` }),
        counts: {
          posts: 0,
          replies: 0,
          tagged: 0,
          followers: 0,
          following: 0,
          friends: 0,
          tags: 0,
          unique_tags: 0,
          bookmarks: 0,
        },
        relationship: {
          followed_by: false,
          following: false,
          muted: false,
        },
        followers: [],
        following: [],
        tags: [],
        muted: [],
        indexed_at: null,
        updated_at: Date.now(),
        sync_status: 'local',
        sync_ttl: Date.now() + 60 * 60 * 1000, // 1 hour
      }),
    );
    userIds.push(userId);
  }
  return userIds;
}
