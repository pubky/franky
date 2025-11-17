import { BlobResult, FileResult } from 'pubky-app-specs';
import * as Core from '@/core';

export type TUploadFileInput = {
  blobResult: BlobResult;
  fileResult: FileResult;
};

export type TReadFilesInput = {
  fileUris: Core.Pubky[];
};

