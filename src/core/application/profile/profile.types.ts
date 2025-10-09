import * as Core from '@/core';
import { BlobResult, FileResult, PubkyAppUser } from 'pubky-app-specs';

export type TUploadAvatarInput = {
  blobResult: BlobResult;
  fileResult: FileResult;
};

export type TCreateProfileInput = {
  profile: PubkyAppUser;
  url: string;
  pubky: Core.Pubky;
};
