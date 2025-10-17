import * as Core from '@/core';

export type TFileBody = {
  uris: Core.Pubky[];
};

export enum FileVariant {
  SMALL = 'small',
  FEED = 'feed',
  MAIN = 'main',
}

export type TImageParams = {
  pubky: Core.Pubky;
  file_id: string;
  variant: FileVariant;
};
