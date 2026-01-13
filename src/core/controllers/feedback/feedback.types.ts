import type { Pubky } from '@/core/models/models.types';

export interface TFeedbackSubmitParams {
  pubky: Pubky;
  comment: string;
  name: string;
}
