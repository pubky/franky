import type { Pubky } from '@/core/models';

// Presentation-layer type for user search results
export type TSearchUserResult = {
  id: Pubky;
  name: string;
  handle: string;
  avatar?: string;
  tagsCount?: number;
  postsCount?: number;
};
