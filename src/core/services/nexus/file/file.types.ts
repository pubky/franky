import * as Core from '@/core';

export type TFileBody = {
  uris: Core.Pubky[];
};

export enum FileVariant {
  SMALL = 'small',
  FEED = 'feed',
  MAIN = 'main',
}

export type TFileParams = {
  pubky: Core.Pubky;
  file_id: string;
  variant: FileVariant;
};

export type FilesApiEndpoint = 'getAvatarUrl' | 'getFileUrl' | 'getFiles';
