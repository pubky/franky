import * as Core from '@/core';

export type TUploadFileParams = {
  file: File;
  pubky: Core.Pubky;
};

export type TReadFilesParams = {
  fileUris: Core.Pubky[];
};

export type TGetImageUrlParams = {
  pubky: Core.Pubky;
  fileId: string;
  variant: Core.FileVariant;
};

