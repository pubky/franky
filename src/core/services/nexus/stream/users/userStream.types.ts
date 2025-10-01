import * as Core from '@/core';

export enum UserStreamSource {
  FOLLOWERS = 'followers',
  FOLLOWING = 'following',
  FRIENDS = 'friends',
  MUTED = 'muted',
  INFLUENCERS = 'influencers',
  RECOMMENDED = 'recommended',
  POST_REPLIES = 'post_replies',
  MOST_FOLLOWED = 'most_followed',
}

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

export type TUserStreamBase = {
  viewer_id?: Core.Pubky;
  skip?: number;
  limit?: number;
  // Provide a random selection of size 3 for sources supporting preview. Passing 'preview', ignores skip and limit parameters
  preview?: boolean;
};

export type TUserStreamWithUserIdParams = TUserStreamBase & {
  user_id: Core.Pubky;
};

export type TUserStreamInfluencersParams = TUserStreamBase & {
  user_id: Core.Pubky;
  reach?: UserStreamReach;
  timeframe?: UserStreamTimeframe;
};

export type TUserStreamPostRepliesParams = TUserStreamBase & {
  author_id: Core.Pubky;
  post_id: Core.Pubky;
};

export type TUserStreamWithDepthParams = TUserStreamBase & {
  user_id: Core.Pubky;
  depth?: number;
};

export type TUserStreamUsernameParams = Omit<TUserStreamBase, 'preview'> & {
  username: string;
};

export type TUserStreamUsersByIdsParams = {
  user_ids: Core.Pubky[];
  viewer_id?: Core.Pubky;
  depth?: number;
};
