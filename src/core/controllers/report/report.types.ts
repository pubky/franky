import * as Core from '@/core';

export interface TReportSubmitParams {
  pubky: Core.Pubky;
  postUrl: string;
  issueType: string;
  reason: string;
  name: string;
}
