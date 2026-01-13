import type { Pubky } from '@/core/models/models.types';
import type { ReportIssueType } from '@/core/pipes/report';

export interface TReportSubmitInput {
  pubky: Pubky;
  postUrl: string;
  issueType: ReportIssueType;
  reason: string;
  name: string;
}
