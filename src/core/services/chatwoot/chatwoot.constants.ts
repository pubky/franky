/**
 * Chatwoot service constants
 *
 * Inbox IDs and message prefixes for Chatwoot API integration.
 */

/**
 * Chatwoot Inbox IDs
 *
 * Different inboxes for different submission types.
 * These map to Chatwoot inbox configurations.
 */
export const CHATWOOT_INBOX_IDS = {
  FEEDBACK: 26,
  REPORTS: 27,
  /** Reserved for future copyright infringement reports */
  COPYRIGHT: 28,
} as const;

/**
 * Message prefix for feedback submissions
 */
export const CHATWOOT_FEEDBACK_MESSAGE_PREFIX = 'Feedback';

/**
 * Message prefix for report submissions
 */
export const CHATWOOT_REPORT_MESSAGE_PREFIX = 'Report Post';
