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
  /** Maximum number of users to fetch. Default: 3 */
  limit?: number;
  /** Whether to also fetch user counts (posts, tags, etc). Default: false */
  includeCounts?: boolean;
  /** Whether to include relationship data (isFollowing). Default: false */
  includeRelationships?: boolean;
  /** Whether to include user tags. Default: false */
  includeTags?: boolean;
}

export interface UseUserStreamResult {
  /** Array of user details */
  users: UserStreamUser[];
  /** User IDs in the stream */
  userIds: Core.Pubky[];
  /** Whether the hook is currently loading data */
  isLoading: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** Re-fetch the users */
  refetch: () => Promise<void>;
}
