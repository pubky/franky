import * as Core from '@/core';

export interface UseCurrentUserProfileResult {
  userDetails: Core.NexusUserDetails | null | undefined;
  currentUserPubky: string | null;
}
