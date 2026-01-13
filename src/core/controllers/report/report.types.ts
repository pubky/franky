import type { Pubky } from '@/core/models/models.types';

export interface TReportSubmitParams {
  pubky: Pubky;
  postUrl: string;
  issueType: string;
  reason: string;
  name: string;
}
