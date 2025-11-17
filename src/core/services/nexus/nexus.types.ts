import { type Pubky, type Timestamp, type TagModel } from '@/core';

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

// Defining this type for usage in userId:reach id format. Not sure whether WOT needs
// to be supported here, so I'm excluding it for now.
export type UserStreamCompositeReach = Exclude<UserStreamReach, UserStreamReach.WOT>;

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

export type NexusHotTag = {
  label: string;
  taggers_id: Pubky[];
  tagged_count: number;
  taggers_count: number;
};

export type NexusUser = {
  details: NexusUserDetails;
  counts: NexusUserCounts;
  tags: NexusTag[];
  relationship: NexusUserRelationship;
};

// User ID stream response containing only user identifiers
export type NexusUserIdStream = {
  user_ids: Pubky[];
};

// Post types
export type NexusPostDetails = {
  id: string;
  content: string;
  indexed_at: number;
  author: Pubky;
  // If we type this as PubkyAppPostKind, we need to map it to the correct string value
  // if not we get a index from the enum and in indexdb is written as a number
  // TODO: https://github.com/pubky/pubky-app-specs/issues/74
  kind: string;
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

export type NexusNotification = {
  timestamp: number;
  body: Record<string, unknown>; // Generic object to handle all notification types
};

// File types
export type NexusFileDetails = {
  id: Pubky;
  name: string;
  src: string;
  content_type: string;
  size: number;
  created_at: number;
  indexed_at: Timestamp;
};
