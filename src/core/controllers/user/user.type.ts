import * as Core from '@/core';

export type TFollowParams = {
  follower: Core.Pubky;
  followee: Core.Pubky;
};

export type TDownloadDataInput = {
  pubky: Core.Pubky;
  setProgress?: (progress: number) => void;
};
