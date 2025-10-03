import * as Core from '@/core';

export type TCreateTagInput = {
  postId: string;
  label: string;
  taggerId: Core.Pubky;
  tagUrl: string;
  tagJson: object;
};

export type TCreateTagOutput = {
  success: boolean;
};

export type TDeleteTagInput = {
  postId: string;
  label: string;
  taggerId: Core.Pubky;
  tagUrl: string;
};

export type TDeleteTagOutput = {
  success: boolean;
};
