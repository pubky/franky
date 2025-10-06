import * as Core from '@/core';

export type TCreateTagParams = {
  targetId: string;
  label: string;
  taggerId: Core.Pubky;
};

export type TDeleteTagParams = {
  targetId: string;
  label: string;
  taggerId: Core.Pubky;
};
