import * as Core from '@/core';

export type TCreatePostInput = {
  postId: string;
  content: string;
  kind: Core.NexusPostKind;
  authorId: Core.Pubky;
  postUrl: string;
  postJson: Record<string, unknown>;
  parentUri?: string;
  attachments?: string[];
};
