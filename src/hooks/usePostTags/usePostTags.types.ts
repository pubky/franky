import type { TagWithAvatars } from '@/molecules/TaggedItem/TaggedItem.types';

export interface UsePostTagsOptions {
  /** Custom viewer ID for relationship data (defaults to current user) */
  viewerId?: string | null;
}

export interface UsePostTagsResult {
  /** Array of tags with avatar URLs */
  tags: TagWithAvatars[];
  /** Count of tags on this post */
  count: number;
  /** Loading state while fetching tags */
  isLoading: boolean;
  /** Loading state while fetching more tags (kept for API compatibility) */
  isLoadingMore: boolean;
  /** Whether there are more tags to load (kept for API compatibility) */
  hasMore: boolean;
  /** Function to load more tags (no-op, kept for API compatibility) */
  loadMore: () => Promise<void>;
  /** Function to add a new tag */
  handleTagAdd: (tagString: string) => Promise<{ success: boolean; error?: string }>;
  /** Function to toggle tag (add/remove as tagger) */
  handleTagToggle: (tag: { label: string }) => Promise<void>;
}
