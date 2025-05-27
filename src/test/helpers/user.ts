import { db } from '@/database';
import type { UserPK } from '@/database/types';
import { UserDetails } from '@/database/schemas/user';

/**
 * Generate a test user ID
 */
export function generateTestUserId(index: number = 0): UserPK {
  return `operrr8wsbpr3ue9d4qj41ge1kcc6r7fdiy6o3ugjrrhi4y77rd${index}`;
}

/**
 * Create test user details
 */
export function createTestUserDetails(overrides: Partial<UserDetails> = {}): UserDetails {
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

/**
 * Helper to create multiple test users
 */
export async function createTestUsers(count: number): Promise<UserPK[]> {
  const userIds: UserPK[] = [];
  for (let i = 0; i < count; i++) {
    const userId = generateTestUserId(i);
    await db.users.add({
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
      mutes: [],
      indexed_at: null,
      updated_at: Date.now(),
      sync_status: 'local',
      sync_ttl: Date.now() + 60 * 60 * 1000, // 1 hour
    });
    userIds.push(userId);
  }
  return userIds;
}
