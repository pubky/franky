import * as Core from '@/core';

export interface UserCountsModelSchema extends Core.NexusUserCounts {
  id: Core.Pubky;
}

export type TUserCountsFields = keyof Omit<UserCountsModelSchema, 'id'>;

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
