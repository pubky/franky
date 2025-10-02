import * as Core from '@/core';

export type AddTagParams = {
  targetId: string;
  label: string;
  taggerId: Core.Pubky;
};

export type RemoveTagParams = {
  targetId: string;
  label: string;
  taggerId: Core.Pubky;
};
