import type { TagWithAvatars } from '@/molecules/TaggedItem/TaggedItem.types';

export interface UseTaggedOptions {
  /** Enable infinite scroll pagination (default: true) */
  enablePagination?: boolean;
  /** Enable fetching unique_tags count (default: true) */
  enableStats?: boolean;
  /** Custom viewer ID for relationship data (defaults to current user) */
  viewerId?: string | null;
}

export interface UseTaggedResult {
  /** Array of tags with avatar URLs */
  tags: TagWithAvatars[];
  /** Count of unique_tags from user counts (0 if enableStats is false) */
  count: number;
  /** Loading state while fetching initial tags */
  isLoading: boolean;
  /** Loading state while fetching more tags (false if enablePagination is false) */
  isLoadingMore: boolean;
  /** Whether there are more tags to load (false if enablePagination is false) */
  hasMore: boolean;
  /** Function to load more tags (no-op if enablePagination is false) */
  loadMore: () => Promise<void>;
  /** Function to add a new tag */
  handleTagAdd: (tagString: string) => Promise<{ success: boolean; error?: string }>;
  /** Function to toggle tag (add/remove as tagger) */
  handleTagToggle: (tag: { label: string; relationship?: boolean }) => Promise<void>;
}
