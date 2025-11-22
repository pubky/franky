import * as Core from '@/core';

export interface TTagEventParams {
  taggerId: Core.Pubky | string;
  taggedId: Core.Pubky;
  label: string;
  taggedKind: Core.TagKind;
}

export interface TTagFromResponse {
  taggerId: Core.Pubky;
  taggedId: Core.Pubky;
  label: string;
  taggedKind: Core.TagKind;
  tagUrl: string;
  tagJson: Record<string, unknown>;
};
