import * as Core from '@/core';
import type { CHATWOOT_SUBMISSION_TYPES } from './chatwoot.constants';

/**
 * Chatwoot submission type
 */
export type ChatwootSubmissionType = (typeof CHATWOOT_SUBMISSION_TYPES)[keyof typeof CHATWOOT_SUBMISSION_TYPES];

/**
 * Input for Chatwoot submission (feedback or report)
 */
export interface TChatwootSubmitInput {
  pubky: Core.Pubky;
  comment: string;
  name: string;
  /** Submission type - defaults to 'feedback' */
  type?: ChatwootSubmissionType;
  /** Source label for reports (e.g., "Report Post - Personal Info Leak") */
  source?: string;
}

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
