import * as Core from '@/core';

export interface TUserCountsParams {
  userId: Core.Pubky;
  countChanges: TUserCountsCountChanges;
};

export interface TUserCountsCountChanges {
  tagged?: number;
  tags?: number;
  unique_tags?: number;
  posts?: number;
  replies?: number;
  following?: number;
  followers?: number;
  friends?: number;
  bookmarks?: number;
};
