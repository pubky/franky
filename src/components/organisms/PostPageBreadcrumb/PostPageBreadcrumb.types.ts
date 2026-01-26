import type { Ancestor } from '@/hooks/usePostAncestors/usePostAncestors.types';

export interface PostPageBreadcrumbProps {
  /** Array of ancestors ordered from root post to current post */
  ancestors: Ancestor[];
  /** Map of userId to user display name */
  userDetailsMap: Map<string, string>;
  /** Callback to navigate to a post */
  onNavigate: (postId: string) => void;
}
