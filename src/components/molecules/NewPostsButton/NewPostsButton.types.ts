export interface NewPostsButtonProps {
  /**
   * Number of new posts to display
   */
  count: number;
  /**
   * Handler called when the button is clicked
   */
  onClick: () => void;
  /**
   * Whether the button should be visible
   */
  visible: boolean;
  /**
   * Whether the user has scrolled from the top
   * When true, button is fixed positioned; when false, it's sticky at the top of timeline
   */
  isScrolled?: boolean;
}
