'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import * as Core from '@/core';
import type { UseMutedUsersResult } from './useMutedUsers.types';

/**
 * useMutedUsers
 *
 * Hook for accessing muted user IDs from the local muted stream.
 * Uses liveQuery for reactive updates when the muted stream changes.
 */
export function useMutedUsers(): UseMutedUsersResult {
  const mutedStream = useLiveQuery(async () => Core.LocalStreamUsersService.findById(Core.UserStreamTypes.MUTED), []);

  const mutedUserIds = mutedStream?.stream ?? [];
  const mutedUserIdSet = new Set(mutedUserIds);
  const isMuted = (userId: Core.Pubky) => mutedUserIdSet.has(userId);

  return {
    mutedUserIds,
    mutedUserIdSet,
    isMuted,
    isLoading: mutedStream === undefined,
  };
}
