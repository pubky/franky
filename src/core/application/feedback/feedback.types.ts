import type { Pubky } from '@/core/models/models.types';

export interface TFeedbackSubmitInput {
  pubky: Pubky;
  comment: string;
  name: string;
}
