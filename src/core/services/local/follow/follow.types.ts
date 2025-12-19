import * as Core from '@/core';

export interface CreateFollowParams extends Core.TFollowParams {
  activeStreamId?: Core.PostStreamTypes | null;
}

export interface DeleteFollowParams extends Core.TFollowParams {
  activeStreamId?: Core.PostStreamTypes | null;
}

export interface InvalidateTimelineStreamsParams {
  includeFriends: boolean;
  activeStreamId?: Core.PostStreamTypes | null;
}

export interface UpdateUserStreamsParams {
  isFollowing: boolean;
  follower: Core.Pubky;
  followee: Core.Pubky;
  friendshipChanged: boolean;
  activeStreamId?: Core.PostStreamTypes | null;
}
