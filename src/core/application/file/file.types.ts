import { BlobResult, FileResult } from 'pubky-app-specs';
import * as Core from '@/core';

export interface FilesListParams {
  fileAttachments: Core.TFileAttachmentResult[];
}

export interface ReadFilesInput {
  fileUris: Core.Pubky[];
}
