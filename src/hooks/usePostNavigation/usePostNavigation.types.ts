export interface UsePostNavigationResult {
  /**
   * Navigate to a post detail page using composite ID
   */
  navigateToPost: (postId: string) => void;
}
