import * as Core from '@/core';

export interface UserStreamUserCounts {
  posts: number;
  tags: number;
  followers: number;
  following: number;
}

export interface UserStreamUser {
  id: Core.Pubky;
  name: string;
  bio: string;
  image: string | null;
  /** Avatar URL computed from user ID (CDN URL), null if user has no avatar */
  avatarUrl: string | null;
  status: string | null;
  counts?: UserStreamUserCounts;
  /** Whether the current user is following this user */
  isFollowing?: boolean;
  /** User tags (labels only) */
  tags?: string[];
}

export interface UseUserStreamParams {
  /** Stream ID to fetch (e.g., UserStreamTypes.TODAY_INFLUENCERS_ALL) */
  streamId: Core.UserStreamId;
  /** Number of users to fetch (or per page when paginated). Default: 3 */
  limit?: number;
  /** Whether to also fetch user counts (posts, tags, etc). Default: false */
  includeCounts?: boolean;
  /** Whether to include relationship data (isFollowing). Default: false */
  includeRelationships?: boolean;
  /** Whether to include user tags. Default: false */
  includeTags?: boolean;
  /** Enable infinite scroll pagination. Default: false */
  paginated?: boolean;
}

export interface UseUserStreamResult {
  /** Array of user details */
  users: UserStreamUser[];
  /** User IDs in the stream */
  userIds: Core.Pubky[];
  /** Whether the initial load is in progress */
  isLoading: boolean;
  /** Whether more data is being loaded (only when paginated) */
  isLoadingMore: boolean;
  /** Whether there are more users to load (only when paginated) */
  hasMore: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** Load next page of users (only works when paginated) */
  loadMore: () => Promise<void>;
  /** Re-fetch the users */
  refetch: () => Promise<void>;
}
