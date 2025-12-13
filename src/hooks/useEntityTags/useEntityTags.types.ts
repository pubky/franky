import type * as Core from '@/core';

export interface UseEntityTagsOptions {
  /** Custom viewer ID (defaults to current user) */
  viewerId?: string;
  /** Tags to use instead of fetching (for controlled mode) */
  providedTags?: Core.NexusTag[];
}

export interface UseEntityTagsResult {
  /** Array of tags with relationship and avatar data */
  tags: Core.NexusTag[];
  /** Total count of tags */
  count: number;
  /** Whether initial loading is in progress */
  isLoading: boolean;
  /** Whether the viewer is a tagger for a specific tag */
  isViewerTagger: (tag: Core.NexusTag) => boolean;
  /** Toggle tag (add/remove current user as tagger) */
  handleTagToggle: (tag: Core.NexusTag) => Promise<void>;
  /** Add a new tag */
  handleTagAdd: (label: string) => Promise<{ success: boolean; error?: string }>;
}
