import { type Pubky, type Timestamp, type TagModel } from '@/core';

export type NexusPostKind = 'short' | 'long' | 'repost' | 'reply' | 'link';

export enum StreamSorting {
  TIMELINE = 'timeline',
  ENGAGEMENT = 'total_engagement',
}

export type TUserId = {
  user_id: Pubky;
};

export type TPaginationParams = {
  skip?: number;
  limit?: number;
};

export type TPaginationRangeParams = {
  start?: number;
  end?: number;
};

export type TSkipTagsParams = {
  skip_tags?: number;
};

export type TTagsPaginationParams = {
  limit_tags?: number;
  limit_taggers?: number;
};

// The target reach of the source. Supported just for 'influencers' source
// e.g. "source=influencers&reach=followers" will return influencers with followers reach
export enum UserStreamReach {
  FOLLOWERS = 'followers',
  FOLLOWING = 'following',
  FRIENDS = 'friends',
  WOT = 'wot',
}

export enum UserStreamTimeframe {
  TODAY = 'today',
  THIS_MONTH = 'this_month',
  ALL_TIME = 'all_time',
}

export type TUserStreamReachParams = {
  reach?: UserStreamReach;
  timeframe?: UserStreamTimeframe;
};

export type NexusBookmark = {
  created_at: number;
  updated_at: number;
};

export type NexusUserLink = {
  title: string;
  url: string;
};

// User types
export type NexusUserDetails = {
  name: string;
  bio: string;
  id: Pubky;
  links: NexusUserLink[] | null;
  status: string | null;
  image: string | null;
  indexed_at: Timestamp;
};

export type NexusUserCounts = {
  tagged: number; // the number of tags assign by this user to other entities ('users' or 'posts')
  tags: number; // the number of tags received by this user from other users
  unique_tags: number; // the number of unique tags received by this user from other users (distinct)
  posts: number;
  replies: number;
  following: number;
  followers: number;
  friends: number;
  bookmarks: number;
};

export type NexusUserRelationship = {
  following: boolean;
  followed_by: boolean;
  muted: boolean;
};

export type NexusTag = {
  label: string;
  taggers: Pubky[];
  taggers_count: number;
  relationship: boolean;
};

export type NexusUser = {
  details: NexusUserDetails;
  counts: NexusUserCounts;
  tags: NexusTag[];
  relationship: NexusUserRelationship;
};

// Post types
export type NexusPostDetails = {
  id: string;
  content: string;
  indexed_at: number;
  author: Pubky;
  kind: NexusPostKind;
  uri: string;
  attachments: string[] | null;
};

export type NexusPostCounts = {
  tags: number;
  unique_tags: number;
  replies: number;
  reposts: number;
};

export type NexusPostRelationships = {
  replied: string | null;
  reposted: string | null;
  mentioned: Pubky[];
};

export type NexusPost = {
  details: NexusPostDetails;
  counts: NexusPostCounts;
  tags: TagModel[];
  relationships: NexusPostRelationships;
  bookmark: NexusBookmark | null;
};

export type NexusBootstrapList = {
  stream: string[];
  influencers: Pubky[];
  recommended: Pubky[];
};
