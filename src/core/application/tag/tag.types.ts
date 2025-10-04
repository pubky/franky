import * as Core from '@/core';

export type TCreateTagInput = {
  postId: string;
  label: string;
  taggerId: Core.Pubky;
  tagUrl: string;
  tagJson: Record<string, unknown>;
};

export type TDeleteTagInput = {
  postId: string;
  label: string;
  taggerId: Core.Pubky;
  tagUrl: string;
};
