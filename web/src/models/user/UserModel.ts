import { IUserModel, UserPK, UserDetails, UserCounts, UserRelationship, TagDetails, Timestamp, SyncStatus } from './types';
import { db } from '../database';
import { ErrorHandler } from '../../utils/errorHandler';

export class UserModel implements IUserModel {
  id: UserPK;
  details: UserDetails;
  counts: UserCounts;
  relationship: UserRelationship;
  followers: UserPK[];
  following: UserPK[];
  tags: TagDetails[];
  mutes: UserPK[];
  indexed_at: Timestamp | null;
  updated_at: Timestamp;
  sync_status: SyncStatus;
  sync_ttl: Timestamp;

  constructor(data: IUserModel) {
    this.id = data.id;
    this.details = data.details;
    this.counts = data.counts;
    this.relationship = data.relationship;
    this.followers = data.followers;
    this.following = data.following;
    this.tags = data.tags;
    this.mutes = data.mutes;
    this.indexed_at = data.indexed_at;
    this.updated_at = data.updated_at;
    this.sync_status = data.sync_status;
    this.sync_ttl = data.sync_ttl;
  }

  // Returns user's tags with pagination
  static async get_tags(user_pk: UserPK, skip: number = 0, limit: number = 20): Promise<TagDetails[]> {
    return ErrorHandler.handleAsync(
      async () => {
        const user = await db.users.get(user_pk);
        if (!user) {
          return ErrorHandler.handle(null, {
            type: 'NOT_FOUND',
            message: `User not found with ID: ${user_pk}`,
            context: { user_pk, skip, limit }
          });
        }
        
        return user.tags.slice(skip, skip + limit);
      },
      {
        type: 'DATABASE',
        message: (error) => `Failed to fetch tags for user ${user_pk}: ${error}`,
        context: { user_pk, skip, limit }
      }
    );
  }

  // Returns taggers for a specific tag of the user
  static async get_taggers(user_pk: UserPK, label: string): Promise<UserPK[]> {
    return ErrorHandler.handleAsync(
      async () => {
        const user = await db.users.get(user_pk);
        if (!user) {
          return ErrorHandler.handle(null, {
            type: 'NOT_FOUND',
            message: `User not found with ID: ${user_pk}`,
            context: { user_pk, label }
          });
        }

        const tag = user.tags.find(t => t.label === label);
        if (!tag) {
          return ErrorHandler.handle(null, {
            type: 'NOT_FOUND',
            message: `Tag "${label}" not found for user ${user_pk}`,
            context: { user_pk, label }
          });
        }

        return tag.taggers;
      },
      {
        type: 'DATABASE',
        message: (error) => `Failed to fetch taggers for user ${user_pk} and tag ${label}: ${error}`,
        context: { user_pk, label }
      }
    );
  }

  // Returns the list of users that user_pk is following
  static async get_following(user_pk: UserPK): Promise<UserPK[]> {
    return ErrorHandler.handleAsync(
      async () => {
        const user = await db.users.get(user_pk);
        if (!user) {
          return ErrorHandler.handle(null, {
            type: 'NOT_FOUND',
            message: `User not found with ID: ${user_pk}`,
            context: { user_pk }
          });
        }

        return user.following;
      },
      {
        type: 'DATABASE',
        message: (error) => `Failed to fetch following list for user ${user_pk}: ${error}`,
        context: { user_pk }
      }
    );
  }

  // Returns the list of users following user_pk
  static async get_followers(user_pk: UserPK): Promise<UserPK[]> {
    return ErrorHandler.handleAsync(
      async () => {
        const user = await db.users.get(user_pk);
        if (!user) {
          return ErrorHandler.handle(null, {
            type: 'NOT_FOUND',
            message: `User not found with ID: ${user_pk}`,
            context: { user_pk }
          });
        }

        return user.followers;
      },
      {
        type: 'DATABASE',
        message: (error) => `Failed to fetch followers for user ${user_pk}: ${error}`,
        context: { user_pk }
      }
    );
  }

  // Returns a preview of the user (basic information)
  static async get_preview(user_pk: UserPK): Promise<{
    id: UserPK;
    name: string;
    image: string;
    status: string;
  } | null> {
    return ErrorHandler.handleAsync(
      async () => {
        const user = await db.users.get(user_pk);
        if (!user) {
          return ErrorHandler.handle(null, {
            type: 'NOT_FOUND',
            message: `User not found with ID: ${user_pk}`,
            context: { user_pk }
          });
        }

        return {
          id: user.id,
          name: user.details.name,
          image: user.details.image,
          status: user.details.status
        };
      },
      {
        type: 'DATABASE',
        message: (error) => `Failed to fetch preview for user ${user_pk}: ${error}`,
        context: { user_pk }
      }
    );
  }

  // Returns only the user's name
  static async get_name(user_pk: UserPK): Promise<string> {
    return ErrorHandler.handleAsync(
      async () => {
        const user = await db.users.get(user_pk);
        if (!user) {
          return ErrorHandler.handle(null, {
            type: 'NOT_FOUND',
            message: `User not found with ID: ${user_pk}`,
            context: { user_pk }
          });
        }

        return user.details.name;
      },
      {
        type: 'DATABASE',
        message: (error) => `Failed to fetch name for user ${user_pk}: ${error}`,
        context: { user_pk }
      }
    );
  }

  // Returns the complete user model
  static async get_user(user_pk: UserPK): Promise<UserModel> {
    return ErrorHandler.handleAsync(
      async () => {
        const user = await db.users.get(user_pk);
        if (!user) {
          return ErrorHandler.handle(null, {
            type: 'NOT_FOUND',
            message: `User not found with ID: ${user_pk}`,
            context: { user_pk }
          });
        }

        return new UserModel(user);
      },
      {
        type: 'DATABASE',
        message: (error) => `Failed to fetch user ${user_pk}: ${error}`,
        context: { user_pk }
      }
    );
  }
}