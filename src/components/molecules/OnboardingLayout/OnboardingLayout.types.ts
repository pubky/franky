export interface OnboardingLayoutProps {
  /**
   * Unique identifier for the content container
   */
  testId: string;
  /**
   * Main content to be displayed
   */
  children: React.ReactNode;
  /**
   * Optional navigation component to be displayed at the bottom
   */
  navigation?: React.ReactNode;
}
