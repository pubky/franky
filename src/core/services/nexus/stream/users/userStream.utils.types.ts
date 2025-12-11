import * as Core from '@/core';

export type UserStreamApiParamsMap = {
  followers: Core.TUserStreamWithUserIdParams;
  following: Core.TUserStreamWithUserIdParams;
  friends: Core.TUserStreamWithUserIdParams;
  muted: Core.TUserStreamWithUserIdParams;
  recommended: Core.TUserStreamWithUserIdParams;
  influencers: Core.TUserStreamInfluencersParams;
  most_followed: Core.TUserStreamBase;
};

export type ReachType = keyof UserStreamApiParamsMap;

export type NexusParamsResult<T extends ReachType> = {
  reach: T;
  apiParams: UserStreamApiParamsMap[T];
};
