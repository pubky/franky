import * as Core from '@/core';

export interface TCreatePostInput extends Core.TLocalSavePostParams {
  postUrl: string;
  fileAttachments?: Core.TFileAttachmentResult[];
  tags?: Core.TCreateTagInput[];
}

export type TGetOrFetchPostParams = {
  compositeId: string;
  /** Optional viewer ID for relationship data. Null/undefined for unauthenticated views. */
  viewerId?: Core.Pubky | null;
};
