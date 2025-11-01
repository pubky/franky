import { Table } from 'dexie';

import * as Core from '@/core';
import { TupleModelBase } from '@/core/models/shared/base/tuple/baseTuple';

export class UserCountsModel
  extends TupleModelBase<Core.Pubky, Core.UserCountsModelSchema>
  implements Core.UserCountsModelSchema
{
  static table: Table<Core.UserCountsModelSchema> = Core.db.table('user_counts');

  tagged: number;
  tags: number;
  unique_tags: number;
  posts: number;
  replies: number;
  following: number;
  followers: number;
  friends: number;
  bookmarks: number;

  constructor(userCounts: Core.UserCountsModelSchema) {
    super(userCounts);
    this.tagged = userCounts.tagged;
    this.tags = userCounts.tags;
    this.unique_tags = userCounts.unique_tags;
    this.posts = userCounts.posts;
    this.replies = userCounts.replies;
    this.following = userCounts.following;
    this.followers = userCounts.followers;
    this.friends = userCounts.friends;
    this.bookmarks = userCounts.bookmarks;
  }

  // Adapter function to convert NexusUserCounts to UserCountsModelSchema
  static toSchema(data: Core.NexusModelTuple<Core.NexusUserCounts>): Core.UserCountsModelSchema {
    return { id: data[0], ...data[1] };
  }

  static async updateCounts(
    userId: Core.Pubky,
    countChanges: {
      tagged?: number;
      tags?: number;
      unique_tags?: number;
      posts?: number;
      replies?: number;
      following?: number;
      followers?: number;
      friends?: number;
    },
  ): Promise<void> {
    const userCounts = await Core.UserCountsModel.findById(userId);
    if (!userCounts) return;

    const updates: Partial<Core.UserCountsModelSchema> = {};

    if (countChanges.tagged !== undefined) {
      updates.tagged = Math.max(0, userCounts.tagged + countChanges.tagged);
    }
    if (countChanges.tags !== undefined) {
      updates.tags = Math.max(0, userCounts.tags + countChanges.tags);
    }
    if (countChanges.unique_tags !== undefined && countChanges.unique_tags !== 0) {
      updates.unique_tags = Math.max(0, userCounts.unique_tags + countChanges.unique_tags);
    }
    if (countChanges.posts !== undefined) {
      updates.posts = Math.max(0, userCounts.posts + countChanges.posts);
    }
    if (countChanges.replies !== undefined && countChanges.replies !== 0) {
      updates.replies = Math.max(0, userCounts.replies + countChanges.replies);
    }
    if (countChanges.following !== undefined) {
      updates.following = Math.max(0, userCounts.following + countChanges.following);
    }
    if (countChanges.followers !== undefined) {
      updates.followers = Math.max(0, userCounts.followers + countChanges.followers);
    }
    if (countChanges.friends !== undefined) {
      updates.friends = Math.max(0, userCounts.friends + countChanges.friends);
    }

    if (Object.keys(updates).length > 0) {
      await this.update(userId, updates);
    }
  }
}
