import { db } from '@/database';
import type { UserPK } from '@/database/types';

/**
 * Helper to create a follow relationship between users
 */
export async function createFollowRelationship(followerId: UserPK, followedId: UserPK): Promise<void> {
  await db.transaction('rw', db.users, async () => {
    // Update follower
    await db.users
      .where('id')
      .equals(followerId)
      .modify((user) => {
        user.following.push(followedId);
        user.counts.following++;
        user.updated_at = Date.now();
      });

    // Update followed user
    await db.users
      .where('id')
      .equals(followedId)
      .modify((user) => {
        user.followers.push(followerId);
        user.counts.followers++;
        user.updated_at = Date.now();
      });
  });
}

/**
 * Helper to create a tag relationship between users
 */
export async function createTagRelationship(taggerId: UserPK, taggedId: UserPK, label: string): Promise<void> {
  await db.users
    .where('id')
    .equals(taggedId)
    .modify((user) => {
      const existingTag = user.tags.find((t) => t.label === label);
      if (existingTag) {
        if (!existingTag.taggers.includes(taggerId)) {
          existingTag.taggers.push(taggerId);
          existingTag.taggers_count++;
          user.counts.tagged++;
        }
      } else {
        user.tags.push({
          label,
          relationship: false,
          taggers: [taggerId],
          taggers_count: 1,
        });
        user.counts.tags++;
        user.counts.unique_tags++;
        user.counts.tagged++;
      }
      user.updated_at = Date.now();
    });
}
