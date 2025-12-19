import type { TagWithAvatars } from '@/molecules/TaggedItem/TaggedItem.types';

export interface TaggedListProps {
  /** Array of tags to display */
  tags: TagWithAvatars[];
  /** Whether there are more tags to load */
  hasMore?: boolean;
  /** Whether currently loading more tags */
  isLoadingMore?: boolean;
  /** Function to load more tags */
  onLoadMore?: () => void;
  /** Function to toggle tag (add/remove as tagger) */
  onTagToggle: (tag: TagWithAvatars) => void | Promise<void>;
}
