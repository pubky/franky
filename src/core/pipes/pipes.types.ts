import { PubkyAppPostKind } from 'pubky-app-specs';
import * as Core from '@/core';

export type PostValidatorData = {
  content: string;
  kind: PubkyAppPostKind;
  parentUri?: string;
  embed?: string;
  attachments?: Core.TFileAttachmentResult[];
};

export type UserValidatorData = Omit<Core.NexusUserDetails, 'id' | 'indexed_at'>;

export type ToEditPostParams = {
  compositePostId: string;
  content: string;
  currentUserPubky: Core.Pubky;
};
