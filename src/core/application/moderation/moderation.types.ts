import * as Core from '@/core';

export type EnrichedPostDetails = Core.PostDetailsModelSchema & {
  is_moderated: boolean;
  is_blurred: boolean;
};
