import type { REPORT_ISSUE_TYPES } from './report.constants';

/**
 * Report issue type
 */
export type ReportIssueType = (typeof REPORT_ISSUE_TYPES)[keyof typeof REPORT_ISSUE_TYPES];

/**
 * Validated report submission input
 *
 * This type represents data after validation by ReportValidators.
 * All fields are guaranteed to be valid and normalized.
 */
export interface TReportValidatedInput {
  /** Post URL being reported */
  postUrl: string;
  /** Type of issue being reported */
  issueType: ReportIssueType;
  /** User's description of the issue */
  reason: string;
  /** Reporter's public key */
  pubky: string;
  /** Reporter's display name */
  name: string;
}
