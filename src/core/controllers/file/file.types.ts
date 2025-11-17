import * as Core from '@/core';

export type TUploadFileParams = {
  file: File;
  pubky: Core.Pubky;
};

export type TGetMetadataParams = {
  fileAttachments: string[];
};

export type TGetImageUrlParams = {
  // Composite ID: author:fileId
  fileId: string;
  variant: Core.FileVariant;
};
