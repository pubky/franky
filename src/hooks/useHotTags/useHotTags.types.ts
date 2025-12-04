import * as Core from '@/core';

export interface HotTag {
  name: string;
  count: number;
}

export interface UseHotTagsParams {
  /** Maximum number of tags to fetch. Default: 5 */
  limit?: number;
}

export interface UseHotTagsResult {
  /** Array of hot tags */
  tags: HotTag[];
  /** Whether the hook is currently loading data */
  isLoading: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** Re-fetch the hot tags */
  refetch: () => Promise<void>;
}

export type NexusHotTag = Core.NexusHotTag;
