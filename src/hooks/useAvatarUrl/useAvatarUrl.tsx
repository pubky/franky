'use client';

import { useMemo } from 'react';
import * as Core from '@/core';

/**
 * Hook to compute avatar URL from user details.
 * Returns undefined if user has no image.
 *
 * @param userDetails - User details object (can be null/undefined)
 * @returns Avatar URL string or undefined
 *
 * @example
 * ```tsx
 * const { userDetails } = useUserDetails(userId);
 * const avatarUrl = useAvatarUrl(userDetails);
 * return <Avatar src={avatarUrl} />;
 * ```
 */
export function useAvatarUrl(userDetails: Core.NexusUserDetails | null | undefined): string | undefined {
  return useMemo(() => {
    if (!userDetails?.image) return undefined;
    return Core.FileController.getAvatarUrl(userDetails.id);
  }, [userDetails]);
}
