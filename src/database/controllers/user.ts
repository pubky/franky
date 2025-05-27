import { Table } from 'dexie';
import { logger } from '@/lib/logger';
import { type User, type UserDetails, type TagDetails, type UserCounts } from '../schemas/user';
import { HomeserverActions, UserPK } from '../types';
import { NexusUser } from '@/services/nexus/types';
import { DEFAULT_USER_COUNTS, DEFAULT_USER_DETAILS, DEFAULT_USER_RELATIONSHIP } from '../defaults';
import { SYNC_TTL } from '../config';
import { db } from '@/database';

export class UserController {
  private static table: Table<User> = db.table('users');

  private constructor() {
    // Prevent instantiation
  }

  static async checkIfUserExists(userPK: UserPK): Promise<User> {
    const user = await this.getUser(userPK);
    if (!user) throw new Error(`User not found: ${userPK}`);
    return user;
  }

  static async create(user: NexusUser): Promise<User> {
    const now = Date.now();
    const newUser: User = {
      id: user.details.id,
      details: { ...DEFAULT_USER_DETAILS, ...user.details },
      counts: { ...DEFAULT_USER_COUNTS },
      tags: [],
      relationship: { ...DEFAULT_USER_RELATIONSHIP },
      followers: [],
      following: [],
      mutes: [],
      indexed_at: null, // TODO
      updated_at: now, // TODO
      sync_status: 'local', // TODO
      sync_ttl: now + SYNC_TTL,
    };

    try {
      await db.transaction('rw', this.table, async () => {
        await this.table.add(newUser);
      });

      logger.debug('Created new user:', { id: newUser.id });
      return newUser;
    } catch (error) {
      logger.error('Failed to create user:', error);
      throw error;
    }
  }

  static async edit(details: Partial<UserDetails> & { id: UserPK }): Promise<void> {
    try {
      await this.checkIfUserExists(details.id);

      await db.transaction('rw', this.table, async () => {
        await this.table
          .where('id')
          .equals(details.id)
          .modify((user) => {
            user.details = { ...user.details, ...details };
            user.updated_at = Date.now();
          });
      });

      logger.debug('Updated user details:', { id: details.id, details });
    } catch (error) {
      logger.error('Failed to edit user:', error);
      throw error;
    }
  }

  static async follow(action: HomeserverActions, fromPK: UserPK, toPK: UserPK): Promise<void> {
    try {
      // Validate both users exist
      await Promise.all([this.checkIfUserExists(fromPK), this.checkIfUserExists(toPK)]);

      await db.transaction('rw', this.table, async () => {
        const updateRelationship = async (userId: UserPK, targetId: UserPK, isFollowing: boolean) => {
          const listKey = isFollowing ? 'following' : 'followers';
          const countKey = isFollowing ? 'following' : 'followers';
          const otherUser = isFollowing ? targetId : userId;

          await this.table
            .where('id')
            .equals(userId)
            .modify((user) => {
              if (action === 'PUT') {
                if (!user[listKey].includes(otherUser)) {
                  user[listKey].push(otherUser);
                  user.counts[countKey]++;

                  // check if they are friends
                  if (user.relationship.following) {
                    user.counts.friends++;
                  }
                }
              } else {
                user[listKey] = user[listKey].filter((id) => id !== otherUser);
                user.counts[countKey] = Math.max(0, user.counts[countKey] - 1);
              }
              user.updated_at = Date.now();
            });
        };

        // Update follower's following list
        await updateRelationship(fromPK, toPK, true);

        // Update followed user's followers list
        await updateRelationship(toPK, fromPK, false);
      });

      logger.debug('Updated follow relationship:', { action, fromPK, toPK });
    } catch (error) {
      logger.error('Failed to update follow relationship:', error);
      throw error;
    }
  }

  static async tag(action: HomeserverActions, fromPK: UserPK, toPK: UserPK, label: string): Promise<void> {
    try {
      // Validate both users exist
      await Promise.all([this.checkIfUserExists(fromPK), this.checkIfUserExists(toPK)]);

      await db.transaction('rw', this.table, async () => {
        // Update tagged user (receiver)
        await this.table
          .where('id')
          .equals(toPK)
          .modify((user) => {
            if (action === 'PUT') {
              const existingTag = user.tags.find((t) => t.label === label);
              if (existingTag) {
                if (!existingTag.taggers.includes(fromPK)) {
                  existingTag.taggers.push(fromPK);
                  existingTag.taggers_count++;
                  user.counts.tags++;
                }
              } else {
                user.tags.push({
                  label,
                  relationship: false,
                  taggers: [fromPK],
                  taggers_count: 1,
                });
                user.counts.tags++;
                user.counts.unique_tags++;
              }
            } else {
              // DELETE
              const tagIndex = user.tags.findIndex((t) => t.label === label);
              if (tagIndex >= 0) {
                const tag = user.tags[tagIndex];
                tag.taggers = tag.taggers.filter((id) => id !== fromPK);
                tag.taggers_count--;
                user.counts.tags = Math.max(0, user.counts.tags - 1);

                if (tag.taggers.length === 0) {
                  user.tags.splice(tagIndex, 1);
                  user.counts.unique_tags = Math.max(0, user.counts.unique_tags - 1);
                }
              }
            }
            user.updated_at = Date.now();
          });

        // Update tagger user (sender)
        await this.table
          .where('id')
          .equals(fromPK)
          .modify((user) => {
            if (action === 'PUT') {
              user.counts.tagged++;
            } else {
              user.counts.tagged = Math.max(0, user.counts.tagged - 1);
            }
            user.updated_at = Date.now();
          });
      });

      logger.debug('Updated tag:', { action, fromPK, toPK, label });
    } catch (error) {
      logger.error('Failed to update tag:', error);
      throw error;
    }
  }

  static async mute(action: HomeserverActions, fromPK: UserPK, toPK: UserPK): Promise<void> {
    try {
      // Validate both users exist
      await Promise.all([this.checkIfUserExists(fromPK), this.checkIfUserExists(toPK)]);

      await db.transaction('rw', this.table, async () => {
        await this.table
          .where('id')
          .equals(fromPK)
          .modify((user) => {
            if (action === 'PUT') {
              if (!user.mutes.includes(toPK)) {
                user.mutes.push(toPK);
                user.relationship.muted = true;
              }
            } else {
              user.mutes = user.mutes.filter((id) => id !== toPK);
              user.relationship.muted = false;
            }
            user.updated_at = Date.now();
          });
      });

      logger.debug('Updated mute status:', { action, fromPK, toPK });
    } catch (error) {
      logger.error('Failed to update mute status:', error);
      throw error;
    }
  }

  static async updateCounts(userPK: UserPK, counts: Partial<UserCounts>): Promise<void> {
    try {
      // Validate user exists
      await this.checkIfUserExists(userPK);

      await db.transaction('rw', this.table, async () => {
        await this.table
          .where('id')
          .equals(userPK)
          .modify((user) => {
            user.counts = { ...user.counts, ...counts };
            user.updated_at = Date.now();
          });
      });

      logger.debug('Updated user counts:', { userPK, counts });
    } catch (error) {
      logger.error('Failed to update user counts:', error);
      throw error;
    }
  }

  static async getTags(userPK: UserPK, skip = 0, limit = 20): Promise<TagDetails[]> {
    try {
      const user = await this.checkIfUserExists(userPK);
      logger.debug('Getting tags for user:', { userPK, skip, limit });
      return user.tags.slice(skip, skip + limit);
    } catch (error) {
      logger.error('Failed to get user tags:', error);
      throw error;
    }
  }

  static async getTaggers(userPK: UserPK, label: string): Promise<UserPK[]> {
    try {
      const user = await this.checkIfUserExists(userPK);
      const tag = user.tags.find((t) => t.label === label);
      logger.debug('Getting taggers for user:', { userPK, label });
      return tag?.taggers || [];
    } catch (error) {
      logger.error('Failed to get taggers:', error);
      throw error;
    }
  }

  static async getFollowing(userPK: UserPK, skip = 0, limit = 20): Promise<UserPK[]> {
    try {
      const user = await this.checkIfUserExists(userPK);
      logger.debug('Getting following list for user:', { userPK, skip, limit });
      return user.following.slice(skip, skip + limit);
    } catch (error) {
      logger.error('Failed to get following list:', error);
      throw error;
    }
  }

  static async getFollowers(userPK: UserPK, skip = 0, limit = 20): Promise<UserPK[]> {
    try {
      const user = await this.checkIfUserExists(userPK);
      logger.debug('Getting followers list for user:', { userPK, skip, limit });
      return user.followers.slice(skip, skip + limit);
    } catch (error) {
      logger.error('Failed to get followers list:', error);
      throw error;
    }
  }

  static async getName(userPK: UserPK): Promise<string> {
    try {
      const user = await this.checkIfUserExists(userPK);
      logger.debug('Getting user name:', { userPK });
      return user.details.name;
    } catch (error) {
      logger.error('Failed to get user name:', error);
      throw error;
    }
  }

  static async getUser(userPK: UserPK): Promise<User> {
    try {
      const user = await this.table.get(userPK);
      logger.debug('Getting user:', { userPK });
      if (!user) throw new Error(`User not found: ${userPK}`);
      return user;
    } catch (error) {
      logger.error('Failed to get user:', error);
      throw error;
    }
  }
}
