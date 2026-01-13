import type { REPORT_ISSUE_TYPES } from './report.constants';

/**
 * Report issue type
 */
export type ReportIssueType = (typeof REPORT_ISSUE_TYPES)[keyof typeof REPORT_ISSUE_TYPES];
