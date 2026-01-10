export interface HumanSelectionProps {
  onClick: (card: 'sms' | 'payment') => void;
  /**
   * Callback to be called when the user clicks the dev mode options.
   * These are only available in development mode or E2E testing.
   * - inviteCode: Enter an invite code to continue the onboarding process
   * - skip: Skip the human proof and continue the onboarding process
   */
  onDevMode: (variant: 'inviteCode' | 'skip') => void;
}
