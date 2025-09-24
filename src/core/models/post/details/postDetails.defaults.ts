import * as Core from '@/core';

// Post details defaults
export const DEFAULT_POST_DETAILS: Omit<Core.NexusPostDetails, 'id' | 'author' | 'indexed_at'> = {
  content: '',
  kind: 'short',
  uri: '',
  attachments: null,
};
