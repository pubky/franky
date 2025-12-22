import type { Pubky } from '@/core';

export interface UseMuteUserResult {
  /** Toggles mute status for a user */
  toggleMute: (userId: Pubky, isCurrentlyMuted: boolean) => Promise<void>;
  /** Whether the target user is muted (only available if targetUserId is provided) */
  isMuted?: boolean;
  /** Whether a mute/unmute action is in progress */
  isLoading: boolean;
  /** Whether the mute status check is loading (only available if targetUserId is provided) */
  isMutedLoading: boolean;
  /** The user ID currently being muted/unmuted (null if none) */
  loadingUserId: Pubky | null;
  /** Helper to check if a specific user is loading */
  isUserLoading: (userId: Pubky) => boolean;
  /** Error message if the action failed */
  error: string | null;
}
