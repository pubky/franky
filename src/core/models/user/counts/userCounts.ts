import { Table } from 'dexie';

import * as Core from '@/core';
import { TupleModelBase } from '@/core/models/shared/base/tuple/baseTuple';
import { UserCountsFields, TUserCountsFields } from './userCounts.schema';

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

  updateCount(key: TUserCountsFields, value: number) {
    switch (key) {
      case UserCountsFields.TAGGED:
        this.tagged += value;
        break;
      case UserCountsFields.TAGS:
        this.tags += value;
        break;
      case UserCountsFields.UNIQUE_TAGS:
        this.unique_tags += value;
        break;
      case UserCountsFields.POSTS:
        this.posts += value;
        break;
      case UserCountsFields.REPLIES:
        this.replies += value;
        break;
      case UserCountsFields.FOLLOWING:
        this.following += value;
        break;
      case UserCountsFields.FOLLOWERS:
        this.followers += value;
        break;
      case UserCountsFields.FRIENDS:
        this.friends += value;
        break;
      case UserCountsFields.BOOKMARKS:
        this.bookmarks += value;
        break;
    }
  }
}
