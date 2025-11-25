import * as Core from '@/core';

export interface TCreatePostInput extends Core.TLocalSavePostParams {
  postUrl: string;
  fileAttachments?: Core.TFileAttachmentResult[];
  tags?: Core.TCreateTagInput[];
}
