import * as Core from '@/core';

export type TFollowParams = {
  follower: Core.Pubky;
  followee: Core.Pubky;
};

export type TMuteParams = {
  muter: Core.Pubky;
  mutee: Core.Pubky;
};
