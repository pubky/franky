/**
 * Result type for useInviteCodeSignUp.
 */
export interface UseInviteCodeSignUpResult {
  /**
   * Validates the invite code by generating keys and attempting signup.
   * On success: does nothing (caller should set invite code in store and navigate).
   * On failure: clears generated secrets, shows toast, and throws.
   */
  validateAndSignUp: (inviteCode: string) => Promise<void>;
}
