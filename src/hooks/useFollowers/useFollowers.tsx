'use client';

import { useMemo } from 'react';
import type { Pubky, NexusUserDetails } from '@/core';
import * as Core from '@/core';

export interface FollowerData extends NexusUserDetails {
  tags?: string[];
  stats?: {
    tags: number;
    posts: number;
  };
}

interface UseFollowersResult {
  followers: FollowerData[];
  count: number;
  isLoading: boolean;
  onFollow: (userId: Pubky) => void;
}

/**
 * Hook for fetching and managing followers.
 *
 * TODO: Implement real data fetching using UserConnectionsModel and UserDetailsModel.
 * This will fetch followers from the local database and sync with the homeserver.
 *
 * @returns Followers array, count, loading state, and follow handler
 */
export function useFollowers(): UseFollowersResult {
  // TODO: Implement real data fetching here
  // - Fetch followers from UserConnectionsModel.findById(userId).followers
  // - For each follower ID, fetch UserDetailsModel.findById(followerId)
  // - Calculate stats from UserCountsModel if available
  const followers = useMemo<FollowerData[]>(() => {
    // Mock followers data matching UserDetailsModelSchema structure
    // Using image: null so AvatarWithFallback will show initials
    return [
      {
        id: Core.generateTestUserId(1),
        name: 'Matt Jones',
        bio: 'Software developer and crypto enthusiast',
        image: null,
        status: 'active',
        links: null,
        indexed_at: 1704067200000, // 2024-01-01T00:00:00.000Z
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
        indexed_at: 1704067200000, // 2024-01-01T00:00:00.000Z
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
        indexed_at: 1704067200000, // 2024-01-01T00:00:00.000Z
        tags: ['candid', 'bitcoin'],
        stats: {
          tags: 320,
          posts: 67,
        },
      },
      {
        id: Core.generateTestUserId(4),
        name: 'Anna Pleb',
        bio: 'Bitcoin maximalist',
        image: null,
        status: 'active',
        links: null,
        indexed_at: 1704067200000, // 2024-01-01T00:00:00.000Z
        tags: ['pleb', 'bitcoin', 'hot'],
        stats: {
          tags: 890,
          posts: 234,
        },
      },
      {
        id: Core.generateTestUserId(5),
        name: 'Jack Anderson',
        bio: 'Blockchain developer',
        image: null,
        status: 'active',
        links: null,
        indexed_at: 1704067200000, // 2024-01-01T00:00:00.000Z
        tags: ['bitcoin', 'candid'],
        stats: {
          tags: 567,
          posts: 145,
        },
      },
    ];
  }, []);

  const onFollow = (userId: Pubky) => {
    // TODO: Implement real follow/unfollow logic
    console.log(`Follow/Unfollow user: ${userId}`);
  };

  return {
    followers,
    count: followers.length,
    isLoading: false,
    onFollow,
  };
}
