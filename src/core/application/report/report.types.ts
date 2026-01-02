import * as Core from '@/core';
import type { ReportIssueType } from '@/core/pipes/report';

export interface TReportSubmitInput {
  pubky: Core.Pubky;
  postUrl: string;
  issueType: ReportIssueType;
  reason: string;
  name: string;
}
