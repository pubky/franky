'use client';

import { useMemo } from 'react';
import type { Pubky, NexusUserDetails } from '@/core';
import * as Core from '@/core';

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
 * TODO: Implement real data fetching using UserConnectionsModel and UserDetailsModel.
 * This will fetch connections from the local database and sync with the homeserver.
 *
 * @param type - Type of connections to fetch: 'followers', 'following', or 'friends'
 * @returns Connections array, count, loading state, and follow handler
 */
export function useProfileConnections(type: ConnectionType): UseProfileConnectionsResult {
  // TODO: Implement real data fetching here
  // - Fetch connections from UserConnectionsModel.findById(userId) based on type
  // - For followers: userConnections.followers
  // - For following: userConnections.following
  // - For friends: intersection of followers and following
  // - For each connection ID, fetch UserDetailsModel.findById(connectionId)
  // - Calculate stats from UserCountsModel if available

  // Mock data - different per connection type
  const connections = useMemo<UserConnectionData[]>(() => {
    if (type === CONNECTION_TYPE.FOLLOWERS) {
      return [
        {
          id: Core.generateTestUserId(1),
          name: 'Matt Jones',
          bio: 'Software developer and crypto enthusiast',
          image: null,
          status: 'active',
          links: null,
          indexed_at: 1704067200000,
          tags: ['bitcoin', 'candid'],
          stats: {
            tags: 761,
            posts: 158,
          },
        },
        {
          id: Core.generateTestUserId(2),
          name: 'Carl Smith',
          bio: 'Frontend developer',
          image: null,
          status: 'active',
          links: null,
          indexed_at: 1704067200000,
          tags: ['frontender', 'funny'],
          stats: {
            tags: 450,
            posts: 92,
          },
        },
        {
          id: Core.generateTestUserId(3),
          name: 'Username',
          bio: 'Crypto trader',
          image: null,
          status: 'active',
          links: null,
          indexed_at: 1704067200000,
          tags: ['candid', 'bitcoin'],
          stats: {
            tags: 320,
            posts: 67,
          },
        },
      ];
    }

    if (type === CONNECTION_TYPE.FOLLOWING) {
      return [
        {
          id: Core.generateTestUserId(10),
          name: 'Satoshi Nakamoto',
          bio: 'Bitcoin creator',
          image: null,
          status: 'active',
          links: null,
          indexed_at: 1704067200000,
          tags: ['bitcoin', 'og'],
          stats: {
            tags: 1200,
            posts: 1,
          },
        },
        {
          id: Core.generateTestUserId(11),
          name: 'Vitalik Buterin',
          bio: 'Ethereum co-founder',
          image: null,
          status: 'active',
          links: null,
          indexed_at: 1704067200000,
          tags: ['ethereum', 'crypto'],
          stats: {
            tags: 980,
            posts: 450,
          },
        },
        {
          id: Core.generateTestUserId(12),
          name: 'Hal Finney',
          bio: 'Early Bitcoin contributor',
          image: null,
          status: 'active',
          links: null,
          indexed_at: 1704067200000,
          tags: ['bitcoin', 'pioneer'],
          stats: {
            tags: 650,
            posts: 89,
          },
        },
        {
          id: Core.generateTestUserId(13),
          name: 'Nick Szabo',
          bio: 'Cryptographer and smart contracts pioneer',
          image: null,
          status: 'active',
          links: null,
          indexed_at: 1704067200000,
          tags: ['bitcoin', 'smart-contracts'],
          stats: {
            tags: 750,
            posts: 120,
          },
        },
      ];
    }

    if (type === CONNECTION_TYPE.FRIENDS) {
      return [
        {
          id: Core.generateTestUserId(20),
          name: 'Alice Crypto',
          bio: 'Bitcoin enthusiast and developer',
          image: null,
          status: 'active',
          links: null,
          indexed_at: 1704067200000,
          tags: ['bitcoin', 'developer'],
          stats: {
            tags: 420,
            posts: 180,
          },
        },
        {
          id: Core.generateTestUserId(21),
          name: 'Bob Hodler',
          bio: 'Long-term Bitcoin investor',
          image: null,
          status: 'active',
          links: null,
          indexed_at: 1704067200000,
          tags: ['bitcoin', 'hodl'],
          stats: {
            tags: 380,
            posts: 95,
          },
        },
      ];
    }

    return [];
  }, [type]);

  const onFollow = (userId: Pubky) => {
    // TODO: Implement real follow/unfollow logic
    console.log(`Follow/Unfollow user: ${userId}`);
  };

  return {
    connections,
    count: connections.length,
    isLoading: false,
    onFollow,
  };
}
