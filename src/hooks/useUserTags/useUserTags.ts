import { useLiveQuery } from 'dexie-react-hooks';
import * as Core from '@/core';

/**
 * Hook to reactively get user tags
 * @param userId - User pubky ID
 * @returns Array of user tags or empty array if not loaded
 */
export function useUserTags(userId: string | null | undefined) {
  return useLiveQuery(
    async () => {
      if (!userId) return [];
      return await Core.UserController.tags({ user_id: userId });
    },
    [userId],
    [] as Core.TagModel[],
  );
}
