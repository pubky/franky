import * as Core from '@/core';

export type TFollowParams = {
  follower: Core.Pubky;
  followee: Core.Pubky;
};

export type TDeleteAccountInput = {
  pubky: Core.Pubky;
  setProgress?: (progress: number) => void;
};
