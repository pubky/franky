'use client';

import type { Pubky, NexusUserDetails } from '@/core';

export const CONNECTION_TYPE = {
  FOLLOWERS: 'followers',
  FOLLOWING: 'following',
  FRIENDS: 'friends',
} as const;

export type ConnectionType = (typeof CONNECTION_TYPE)[keyof typeof CONNECTION_TYPE];

export interface UserConnectionData extends NexusUserDetails {
  tags?: string[];
  stats?: {
    tags: number;
    posts: number;
  };
}

interface UseProfileConnectionsResult {
  connections: UserConnectionData[];
  count: number;
  isLoading: boolean;
  onFollow: (userId: Pubky) => void;
}

/**
 * Unified hook for fetching and managing profile connections (followers, following, friends).
 *
 * TODO: Implement real data fetching using models from @/core/models:
 *
 * Data fetching flow:
 * 1. Get current user ID from auth context or route params
 * 2. Fetch UserConnectionsModel.findById(userId) to get connections
 *    - Returns: { id: Pubky, following: Pubky[], followers: Pubky[] }
 * 3. Based on type parameter:
 *    - FOLLOWERS: use userConnections.followers (array of Pubky IDs)
 *    - FOLLOWING: use userConnections.following (array of Pubky IDs)
 *    - FRIENDS: compute intersection of followers and following arrays
 * 4. For each connection ID in the selected array:
 *    a. Fetch UserDetailsModel.findById(connectionId) for user details
 *       - Returns: NexusUserDetails { id, name, bio, image, status, links, indexed_at }
 *    b. Fetch UserCountsModel.findById(connectionId) for stats
 *       - Extract: { tags: number, posts: number } from UserCountsModelSchema
 *    c. Fetch UserTagsModel.findById(connectionId) for tags
 *       - Extract tags array from TagCollection
 * 5. Combine all data into UserConnectionData[] format
 * 6. Handle loading states (set isLoading: true during fetching)
 * 7. Handle errors appropriately
 *
 * @param type - Type of connections to fetch: 'followers', 'following', or 'friends'
 *               Currently ignored - will be used when data fetching is implemented
 * @returns Connections array, count, loading state, and follow handler
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useProfileConnections(type: ConnectionType): UseProfileConnectionsResult {
  // TODO: Implement real data fetching here
  // See JSDoc above for detailed implementation plan

  // Return an empty array until data fetching is implemented
  const connections: UserConnectionData[] = [];

  const onFollow = (userId: Pubky) => {
    // TODO: Implement real follow/unfollow logic
    // Should call UserConnectionsModel.createConnection() or deleteConnection()
    // and update UserCountsModel accordingly
    console.log(`Follow/Unfollow user: ${userId}`);
  };

  return {
    connections,
    count: connections.length,
    isLoading: false,
    onFollow,
  };
}
