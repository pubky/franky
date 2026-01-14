import type { CHATWOOT_SUBMISSION_TYPES } from './chatwoot.constants';

/**
 * Chatwoot submission type
 */
export type ChatwootSubmissionType = (typeof CHATWOOT_SUBMISSION_TYPES)[keyof typeof CHATWOOT_SUBMISSION_TYPES];

export interface TChatwootContact {
  id: number;
  email: string;
  name: string;
  contact_inboxes: Array<{
    source_id: string;
  }>;
}

export interface TChatwootContactSearchResponse {
  payload: TChatwootContact[];
}

export interface TChatwootCreateContactResponse {
  payload: {
    contact: TChatwootContact;
  };
}
