import * as Core from '@/core';

export type TAddTagParams = {
  targetId: string;
  label: string;
  taggerId: Core.Pubky;
};

export type TRemoveTagParams = {
  targetId: string;
  label: string;
  taggerId: Core.Pubky;
};
