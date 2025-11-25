import * as Core from '@/core';

export interface TCreatePostParams {
  authorId: Core.Pubky;
  content: string;
  kind?: Core.PubkyAppPostKind;
  tags?: string[];
  attachments?: File[];
  parentPostId?: string;
  originalPostId?: string;
}

export interface TDeletePostParams {
  compositePostId: string;
}

export interface TFileAttachmentsParams {
  attachments: File[];
  pubky: Core.Pubky;
}

export interface TNormalizeTagsParams {
  tags: Core.TTagEventParams[];
}
