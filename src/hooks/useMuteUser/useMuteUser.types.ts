import * as Core from '@/core';

export interface MuteUserOptions {
  /** Skip showing toast notification */
  silent?: boolean;
}

export interface UseMuteUserResult {
  /**
   * Mute a user
   * @param userId - The user ID to mute
   * @param options - Optional settings (e.g., silent mode)
   */
  muteUser: (userId: Core.Pubky, options?: MuteUserOptions) => Promise<void>;

  /**
   * Unmute a user
   * @param userId - The user ID to unmute
   * @param options - Optional settings (e.g., silent mode)
   */
  unmuteUser: (userId: Core.Pubky, options?: MuteUserOptions) => Promise<void>;

  /**
   * Global loading state (true if any user is being muted/unmuted)
   */
  isLoading: boolean;

  /**
   * The user ID currently being processed (null if none)
   */
  loadingUserId: Core.Pubky | null;

  /**
   * Check if a specific user is currently being muted/unmuted
   * @param userId - The user ID to check
   * @returns True if the specified user is currently being processed
   */
  isUserLoading: (userId: Core.Pubky) => boolean;

  /**
   * Error message if mute/unmute failed (null if no error)
   */
  error: string | null;
}
