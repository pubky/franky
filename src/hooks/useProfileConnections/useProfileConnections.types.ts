import * as Core from '@/core';

// ============================================================================
// Constants
// ============================================================================

export const CONNECTION_TYPE = {
  FOLLOWERS: 'followers',
  FOLLOWING: 'following',
  FRIENDS: 'friends',
} as const;

export type ConnectionType = (typeof CONNECTION_TYPE)[keyof typeof CONNECTION_TYPE];

// ============================================================================
// Types
// ============================================================================

export interface UserConnectionData extends Core.NexusUserDetails {
  /** Avatar URL computed from user ID */
  avatarUrl: string;
  tags?: string[];
  stats?: {
    tags: number;
    posts: number;
  };
}

export interface UseProfileConnectionsResult {
  /** Array of user connection data */
  connections: UserConnectionData[];
  /** Total count of connections loaded */
  count: number;
  /** Whether the initial load is in progress */
  isLoading: boolean;
  /** Whether loading more connections (pagination) */
  isLoadingMore: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** Whether there are more connections to load */
  hasMore: boolean;
  /** Function to trigger loading more connections */
  loadMore: () => Promise<void>;
  /** Function to manually trigger a refresh */
  refresh: () => Promise<void>;
}
