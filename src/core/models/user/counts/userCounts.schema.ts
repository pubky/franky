import * as Core from '@/core';

export interface UserCountsModelSchema extends Core.NexusUserCounts {
  id: Core.Pubky;
}

export type TUserCountsFields = keyof Omit<UserCountsModelSchema, 'id'>;

// Enum for user count fields
export enum UserCountsFields {
  TAGGED = 'tagged',
  TAGS = 'tags',
  UNIQUE_TAGS = 'unique_tags',
  POSTS = 'posts',
  REPLIES = 'replies',
  FOLLOWING = 'following',
  FOLLOWERS = 'followers',
  FRIENDS = 'friends',
  BOOKMARKS = 'bookmarks',
}

// Primary and compound indexes for Dexie
export const userCountsTableSchema = `
  &id,
  tagged,
  tags,
  unique_tags,
  posts,
  replies,
  following,
  followers,
  friends,
  bookmarks
`;
