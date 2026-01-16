export interface UseRequireAuthResult {
  /** Whether the current user is authenticated */
  isAuthenticated: boolean;
  /**
   * Wrap an action to require authentication.
   * If authenticated, executes the action and returns its result.
   * If not authenticated, opens sign-in dialog and returns undefined.
   */
  requireAuth: <T>(action: () => T) => T | undefined;
}
