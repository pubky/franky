import * as Core from '@/core';

export type TLocalSaveTagParams = {
  postId: string;
  label: string;
  taggerId: Core.Pubky;
};

export type TLocalRemoveTagParams = {
  postId: string;
  label: string;
  taggerId: Core.Pubky;
};
