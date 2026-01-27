import type { ReportIssueType } from './report.types';

/**
 * Report-related constants
 *
 * Issue types for reporting posts, matching Pubky's implementation.
 */

/**
 * Report issue type identifiers
 */
export const REPORT_ISSUE_TYPES = {
  PERSONAL_INFO: 'personal-info',
  HATE_SPEECH: 'hate-speech',
  HARASSMENT: 'harassment',
  CHILD_ABUSE: 'child-abuse',
  TERRORISM: 'terrorism',
  VIOLENCE: 'violence',
  ILLEGAL_SALES: 'illegal-sales',
  SEXUAL_CONTENT: 'sexual-content',
  COPYRIGHT: 'copyright',
} as const;

/**
 * Report issue translation keys for i18n
 * Maps each issue type to its translation key in 'report.issues' namespace
 */
export const REPORT_ISSUE_LABEL_KEYS: Record<ReportIssueType, string> = {
  [REPORT_ISSUE_TYPES.PERSONAL_INFO]: 'personalInfoLeak',
  [REPORT_ISSUE_TYPES.HATE_SPEECH]: 'hateSpeech',
  [REPORT_ISSUE_TYPES.HARASSMENT]: 'harassment',
  [REPORT_ISSUE_TYPES.CHILD_ABUSE]: 'childAbuse',
  [REPORT_ISSUE_TYPES.TERRORISM]: 'terrorism',
  [REPORT_ISSUE_TYPES.VIOLENCE]: 'violence',
  [REPORT_ISSUE_TYPES.ILLEGAL_SALES]: 'illegalSales',
  [REPORT_ISSUE_TYPES.SEXUAL_CONTENT]: 'sexualContent',
  [REPORT_ISSUE_TYPES.COPYRIGHT]: 'copyright',
};

/**
 * Report issue labels in English (for server-side use, e.g., Chatwoot messages)
 * These are the actual display labels, not translation keys
 */
export const REPORT_ISSUE_LABELS: Record<ReportIssueType, string> = {
  [REPORT_ISSUE_TYPES.PERSONAL_INFO]: 'Personal Info Leak',
  [REPORT_ISSUE_TYPES.HATE_SPEECH]: 'Hate or Threatening Speech',
  [REPORT_ISSUE_TYPES.HARASSMENT]: 'Harassment or Targeted',
  [REPORT_ISSUE_TYPES.CHILD_ABUSE]: 'Child Sexual Abuse or Exploitation',
  [REPORT_ISSUE_TYPES.TERRORISM]: 'Promotion of Terrorist',
  [REPORT_ISSUE_TYPES.VIOLENCE]: 'Graphic or Criminal Violence',
  [REPORT_ISSUE_TYPES.ILLEGAL_SALES]: 'Illegal Sales or Criminal',
  [REPORT_ISSUE_TYPES.SEXUAL_CONTENT]: 'Non-consensual or Criminal Sexual Content',
  [REPORT_ISSUE_TYPES.COPYRIGHT]: 'Copyright Infringement',
};

/**
 * All valid issue type values as an array (for validation)
 */
export const REPORT_ISSUE_TYPE_VALUES = Object.values(REPORT_ISSUE_TYPES);

/**
 * Maximum character length for report reason text
 */
export const REPORT_REASON_MAX_LENGTH = 1000;
