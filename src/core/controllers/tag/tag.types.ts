import * as Core from '@/core';

export type TTagEventParams = {
  taggerId: Core.Pubky | string;
  taggedId: Core.Pubky;
  label: string;
  taggedKind: Core.TagKind;
};
