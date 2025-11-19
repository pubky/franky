import * as Core from '@/core';

export enum USER_STREAM_PREFIX {
  USERS = 'v0/stream/users/ids',
  USERNAME = 'v0/stream/users/username',
  USERS_BY_IDS = 'v0/stream/users/by_ids',
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

export type TUserStreamBase = Core.TPaginationParams & {
  viewer_id?: Core.Pubky;
  // Provide a random selection of size 3 for sources supporting preview. Passing 'preview', ignores skip and limit parameters
  preview?: boolean;
};

export type TUserStreamWithUserIdParams = Core.TUserId & TUserStreamBase;

export type TUserStreamInfluencersParams = TUserStreamBase &
  Core.TUserId & {
    reach?: Core.UserStreamReach;
    timeframe?: Core.UserStreamTimeframe;
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

/**
 * Parameters for fetching user stream from Nexus
 * streamId: Composite stream identifier (e.g., 'user123:followers', 'influencers:today:all')
 * params: Pagination parameters
 */
export type TFetchUserStreamParams = {
  streamId: Core.UserStreamId;
  params: TUserStreamBase;
};

/**
 * Union type of all supported user stream parameter shapes
 * Provides type safety for buildUserStreamUrl function
 */
export type TUserStreamQueryParams =
  | TUserStreamWithUserIdParams
  | TUserStreamInfluencersParams
  | TUserStreamPostRepliesParams
  | TUserStreamWithDepthParams
  | TUserStreamBase
  | TUserStreamUsernameParams;
