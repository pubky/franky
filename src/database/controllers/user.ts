import { logger } from '@/lib/logger';
import { UserPK, type PaginationParams } from '../types';
import { type NexusUser } from '@/services/nexus/types';
import { User } from '../model/User';
import { type User as UserSchema } from '../schemas/user';

export class UserController {
  private constructor() {
    // Prevent instantiation
  }

  static async get(userPK: UserPK): Promise<User> {
    const user = await User.findById(userPK);
    if (!user) throw new Error(`User not found: ${userPK}`);
    return user;
  }

  static async getAll(): Promise<User[]> {
    try {
      const users = await User.findAll();
      logger.debug('Retrieved all users');
      return users;
    } catch (error) {
      logger.error('Failed to get all users:', error);
      throw error;
    }
  }

  static async getByIds(userPKs: UserPK[]): Promise<User[]> {
    try {
      const users = await Promise.all(
        userPKs.map(async (id) => {
          try {
            return await this.get(id);
          } catch (error) {
            logger.warn(`Failed to get user ${id}:`, error);
            return null;
          }
        }),
      );
      return users.filter((user): user is User => user !== null);
    } catch (error) {
      logger.error('Failed to get users by ids:', error);
      throw error;
    }
  }

  static async save(userData: NexusUser): Promise<User> {
    try {
      const existingUser = await User.findById(userData.details.id);
      if (existingUser) {
        await existingUser.edit(userData);
        return existingUser;
      }
      return User.create(userData);
    } catch (error) {
      logger.error('Failed to save user:', error);
      throw error;
    }
  }

  static async delete(userPK: UserPK): Promise<void> {
    try {
      const user = await this.get(userPK);
      await user.delete();
      logger.debug('Deleted user:', { userPK });
    } catch (error) {
      logger.error('Failed to delete user:', error);
      throw error;
    }
  }

  static async search(query: Partial<UserSchema>): Promise<User[]> {
    try {
      const users = await User.findAll();
      return users.filter((user) => {
        return Object.entries(query).every(([key, value]) => {
          return user[key as keyof User] === value;
        });
      });
    } catch (error) {
      logger.error('Failed to search users:', error);
      throw error;
    }
  }

  static async count(query?: Partial<UserSchema>): Promise<number> {
    try {
      const users = await User.findAll();
      if (query) {
        return users.filter((user) => {
          return Object.entries(query).every(([key, value]) => {
            return user[key as keyof User] === value;
          });
        }).length;
      }
      return users.length;
    } catch (error) {
      logger.error('Failed to count users:', error);
      throw error;
    }
  }

  static async bulkSave(usersData: NexusUser[]): Promise<User[]> {
    const results: User[] = [];

    await Promise.all(
      usersData.map(async (userData) => {
        try {
          const user = await this.save(userData);
          results.push(user);
        } catch (error) {
          logger.warn(`Failed to save user ${userData.details.id}:`, error);
        }
      }),
    );

    logger.debug('Bulk save operation completed:', {
      total: usersData.length,
      successful: results.length,
    });

    return results;
  }

  static async bulkDelete(userPKs: UserPK[]): Promise<{ success: UserPK[]; failed: UserPK[] }> {
    const results = {
      success: [] as UserPK[],
      failed: [] as UserPK[],
    };

    await Promise.all(
      userPKs.map(async (userPK) => {
        try {
          await this.delete(userPK);
          results.success.push(userPK);
        } catch (error) {
          logger.warn(`Failed to delete user ${userPK}:`, error);
          results.failed.push(userPK);
        }
      }),
    );

    logger.debug('Bulk delete operation completed:', {
      total: userPKs.length,
      successful: results.success.length,
      failed: results.failed.length,
    });

    return results;
  }

  // User relationship get methods with fallback capabilities
  static async getFollowing(userPK: UserPK, pagination?: PaginationParams): Promise<UserPK[]> {
    try {
      const user = await this.get(userPK);
      const following = user.getFollowing(pagination);

      // TODO: If empty or stale, try fetching from API/other services

      return following;
    } catch (error) {
      logger.error('Failed to get following:', error);
      throw error;
    }
  }

  static async getFollowers(userPK: UserPK, pagination?: PaginationParams): Promise<UserPK[]> {
    try {
      const user = await this.get(userPK);
      const followers = user.getFollowers(pagination);

      // TODO: If empty or stale, try fetching from API/other services

      return followers;
    } catch (error) {
      logger.error('Failed to get followers:', error);
      throw error;
    }
  }

  static async getMuted(userPK: UserPK, pagination?: PaginationParams): Promise<UserPK[]> {
    try {
      const user = await this.get(userPK);
      const muted = user.getMuted(pagination);

      // TODO: If empty or stale, try fetching from API/other services

      return muted;
    } catch (error) {
      logger.error('Failed to get muted users:', error);
      throw error;
    }
  }

  // User relationship action methods
  static async muteUser(sourceUserPK: UserPK, targetUserPK: UserPK): Promise<void> {
    try {
      const [sourceUser, targetUser] = await Promise.all([this.get(sourceUserPK), this.get(targetUserPK)]);

      // Execute Model Action
      await sourceUser.mute('PUT', targetUser);

      // TODO: Call other services HERE

      logger.debug('Additional services processed for mute action', {
        sourceUser: sourceUser.details.id,
        targetUser: targetUser.details.id,
      });
    } catch (error) {
      logger.error('Failed to mute user:', error);
      throw error;
    }
  }

  static async bulkMuteUsers(
    sourceUserPK: UserPK,
    targetUserPKs: UserPK[],
  ): Promise<{ success: UserPK[]; failed: UserPK[] }> {
    const results = {
      success: [] as UserPK[],
      failed: [] as UserPK[],
    };

    const sourceUser = await this.get(sourceUserPK);

    // Process each mute in parallel
    await Promise.all(
      targetUserPKs.map(async (targetPK) => {
        try {
          const targetUser = await this.get(targetPK);
          await sourceUser.mute('PUT', targetUser);

          // TODO: Call other services HERE

          results.success.push(targetPK);
        } catch (error) {
          logger.warn(`Failed to mute user ${targetPK}:`, error);
          results.failed.push(targetPK);
        }
      }),
    );

    logger.debug('Bulk mute operation completed:', {
      total: targetUserPKs.length,
      successful: results.success.length,
      failed: results.failed.length,
    });

    return results;
  }

  static async follow(sourceUserPK: UserPK, targetUserPK: UserPK): Promise<void> {
    try {
      const [sourceUser, targetUser] = await Promise.all([this.get(sourceUserPK), this.get(targetUserPK)]);

      // Execute Model Action
      await sourceUser.follow('PUT', targetUser);

      // TODO: Call other services HERE

      logger.debug('Additional services processed for follow action', {
        sourceUser: sourceUser.details.id,
        targetUser: targetUser.details.id,
      });
    } catch (error) {
      logger.error('Failed to follow user:', error);
      throw error;
    }
  }

  static async bulkFollow(
    sourceUserPK: UserPK,
    targetUserPKs: UserPK[],
  ): Promise<{ success: UserPK[]; failed: UserPK[] }> {
    const results = {
      success: [] as UserPK[],
      failed: [] as UserPK[],
    };

    const sourceUser = await this.get(sourceUserPK);

    // Process each follow in parallel
    await Promise.all(
      targetUserPKs.map(async (targetPK) => {
        try {
          const targetUser = await this.get(targetPK);
          await sourceUser.follow('PUT', targetUser);

          // TODO: Call other services HERE

          results.success.push(targetPK);
        } catch (error) {
          logger.warn(`Failed to follow user ${targetPK}:`, error);
          results.failed.push(targetPK);
        }
      }),
    );

    logger.debug('Bulk follow operation completed:', {
      total: targetUserPKs.length,
      successful: results.success.length,
      failed: results.failed.length,
    });

    return results;
  }

  static async tag(sourceUserPK: UserPK, targetUserPK: UserPK, label: string): Promise<void> {
    try {
      const [sourceUser, targetUser] = await Promise.all([this.get(sourceUserPK), this.get(targetUserPK)]);

      // Execute Model Action
      await sourceUser.tag('PUT', targetUser, label);

      // TODO: Call other services HERE

      logger.debug('Additional services processed for tag action', {
        sourceUser: sourceUser.details.id,
        targetUser: targetUser.details.id,
        label,
      });
    } catch (error) {
      logger.error('Failed to tag user:', error);
      throw error;
    }
  }

  static async bulkTag(
    sourceUserPK: UserPK,
    targetUserPKs: UserPK[],
    label: string,
  ): Promise<{ success: UserPK[]; failed: UserPK[] }> {
    const results = {
      success: [] as UserPK[],
      failed: [] as UserPK[],
    };

    const sourceUser = await this.get(sourceUserPK);

    // Process each tag in parallel
    await Promise.all(
      targetUserPKs.map(async (targetPK) => {
        try {
          const targetUser = await this.get(targetPK);
          await sourceUser.tag('PUT', targetUser, label);

          // TODO: Call other services HERE

          results.success.push(targetPK);
        } catch (error) {
          logger.warn(`Failed to tag user ${targetPK}:`, error);
          results.failed.push(targetPK);
        }
      }),
    );

    logger.debug('Bulk tag operation completed:', {
      total: targetUserPKs.length,
      successful: results.success.length,
      failed: results.failed.length,
      label,
    });

    return results;
  }
}
