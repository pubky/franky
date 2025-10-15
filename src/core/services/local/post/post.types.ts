import * as Core from '@/core';

export type TLocalSavePostParams = {
  postId: string;
  content: string;
  kind: Core.NexusPostKind;
  authorId: Core.Pubky;
  parentUri?: string;
  attachments?: string[];
};
