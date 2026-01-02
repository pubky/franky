import type * as Core from '@/core';

export interface MutedUserData {
  id: Core.Pubky;
  name?: string;
  avatarUrl?: string;
}

export interface UseMutedUsersResult {
  mutedUsers: MutedUserData[];
  isLoading: boolean;
}
