/**
 * Report post dialog step identifiers
 */
export const REPORT_POST_STEPS = {
  ISSUE_SELECTION: 'issue-selection',
  REASON_INPUT: 'reason-input',
} as const;

export type ReportPostStep = (typeof REPORT_POST_STEPS)[keyof typeof REPORT_POST_STEPS];

/**
 * API endpoint for report submission
 */
export const REPORT_API_ENDPOINT = '/api/report';
