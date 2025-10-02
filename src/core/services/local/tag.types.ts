import * as Core from '@/core';

export type LocalSaveTagParams = {
  postId: string;
  label: string;
  taggerId: Core.Pubky;
};

export type LocalRemoveTagParams = {
  postId: string;
  label: string;
  taggerId: Core.Pubky;
};
