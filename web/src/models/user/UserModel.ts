import { IUserModel, UserPK, UserDetails, UserCounts, UserRelationship, TagDetails, Timestamp, SyncStatus } from './types';
import { db } from '../database';

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
    const user = await db.users.get(user_pk);
    if (!user) return [];
    
    return user.tags.slice(skip, skip + limit);
  }

  // Returns taggers for a specific tag of the user
  static async get_taggers(user_pk: UserPK, label: string): Promise<UserPK[]> {
    const user = await db.users.get(user_pk);
    if (!user) return [];

    const tag = user.tags.find(t => t.label === label);
    return tag?.taggers || [];
  }

  // Returns the list of users that user_pk is following
  static async get_following(user_pk: UserPK): Promise<UserPK[]> {
    const user = await db.users.get(user_pk);
    return user?.following || [];
  }

  // Returns the list of users following user_pk
  static async get_followers(user_pk: UserPK): Promise<UserPK[]> {
    const user = await db.users.get(user_pk);
    return user?.followers || [];
  }

  // Returns a preview of the user (basic information)
  static async get_preview(user_pk: UserPK): Promise<{
    id: UserPK;
    name: string;
    image: string;
    status: string;
  } | null> {
    const user = await db.users.get(user_pk);
    if (!user) return null;

    return {
      id: user.id,
      name: user.details.name,
      image: user.details.image,
      status: user.details.status
    };
  }

  // Returns only the user's name
  static async get_name(user_pk: UserPK): Promise<string | null> {
    const user = await db.users.get(user_pk);
    return user?.details.name || null;
  }

  // Returns the complete user model
  static async get_user(user_pk: UserPK): Promise<UserModel | null> {
    const user = await db.users.get(user_pk);
    return user ? new UserModel(user) : null;
  }
}