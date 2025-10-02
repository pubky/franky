import * as Core from '@/core';

export enum USER_STREAM_PREFIX {
  USERS = 'stream/users',
  USERNAME = 'stream/users/username',
  USERS_BY_IDS = 'stream/users/by_ids',
}

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

export type TUserStreamBase = Core.TPaginationParams & {
  viewer_id?: Core.Pubky;
  // Provide a random selection of size 3 for sources supporting preview. Passing 'preview', ignores skip and limit parameters
  preview?: boolean;
};

export type TUserStreamWithUserIdParams = Core.TUserId & TUserStreamBase;

export type TUserStreamInfluencersParams = TUserStreamBase &
  Core.TUserId & {
    reach?: UserStreamReach;
    timeframe?: UserStreamTimeframe;
  };

export type TUserStreamPostRepliesParams = TUserStreamBase & {
  author_id: Core.Pubky;
  post_id: string;
};

export type TUserStreamWithDepthParams = TUserStreamBase &
  Core.TUserId & {
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
