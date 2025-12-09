import * as Core from '@/core';

export interface UserWithAvatar {
  id: Core.Pubky;
  name?: string;
  avatarUrl?: string;
}

export interface UseBulkUserAvatarsResult {
  /** Map of user ID to user data with avatar */
  usersMap: Map<Core.Pubky, UserWithAvatar>;
  /** Get users with avatars for a list of IDs */
  getUsersWithAvatars: (userIds: Core.Pubky[]) => UserWithAvatar[];
  /** Whether the data is still loading */
  isLoading: boolean;
}
