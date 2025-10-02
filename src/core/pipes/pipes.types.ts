import { PubkyAppPostKind } from 'pubky-app-specs';
import { NexusUserDetails } from '@/core';

export type PostValidatorData = {
  content: string;
  kind: PubkyAppPostKind;
  parentUri?: string;
  embed?: string;
  attachments?: File[];
};

export type UserValidatorData = Omit<NexusUserDetails, 'id' | 'indexed_at'>;
