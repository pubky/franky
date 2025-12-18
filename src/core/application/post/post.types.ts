import * as Core from '@/core';

export interface TCreatePostInput extends Core.TLocalSavePostParams {
  postUrl: string;
  fileAttachments?: Core.TFileAttachmentResult[];
  tags?: Core.TCreateTagInput[];
}

export type TGetOrFetchPostParams = {
  compositeId: string;
  viewerId: Core.Pubky;
};
