import * as Core from '@/core';

export type EnrichedPostDetails = Core.PostDetailsModelSchema & {
  is_moderated: boolean;
  is_blurred: boolean;
};

export type EnrichedUserDetails = Core.UserDetailsModelSchema & {
  is_moderated: boolean;
  is_blurred: boolean;
};
