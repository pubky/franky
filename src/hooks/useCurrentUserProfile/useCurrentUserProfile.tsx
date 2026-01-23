'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import * as Core from '@/core';
import * as Libs from '@/libs';
import * as Types from './index';

/**
 * Hook to get the current logged-in user's profile details.
 * Combines authentication state with live database queries.
 *
 * @returns Object containing userDetails and currentUserPubky
 *
 * @example
 * ```tsx
 * const { userDetails, currentUserPubky } = useCurrentUserProfile();
 * if (!userDetails) return <div>Not logged in</div>;
 * return <div>{userDetails.name}</div>;
 * ```
 */
export function useCurrentUserProfile(): Types.UseCurrentUserProfileResult {
  const currentUserPubky = Core.useAuthStore((state) => state.currentUserPubky);

  const userDetails = useLiveQuery(async () => {
    try {
      if (!currentUserPubky) return null;
      return await Core.UserController.getDetails({ userId: currentUserPubky });
    } catch (error) {
      Libs.Logger.error('[useCurrentUserProfile] Failed to query user details', { error });
      return null;
    }
  }, [currentUserPubky]);

  return { userDetails, currentUserPubky };
}
