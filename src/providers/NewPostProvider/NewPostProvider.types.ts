/**
 * Callback type for new post subscribers
 */
export type NewPostCallback = (postId: string) => void;

/**
 * Context value for the NewPostProvider
 */
export interface NewPostContextValue {
  /**
   * Signal that a new post was created.
   * Called by usePostInput after successful POST or REPOST.
   * @param postId - The ID of the newly created post
   */
  signalNewPost: (postId: string) => void;

  /**
   * Subscribe to new post signals.
   * Used by TimelineFeed (HOME variant) to prepend posts optimistically.
   * @param callback - Function to call when a new post is created
   * @returns Unsubscribe function to clean up the subscription
   */
  subscribeToNewPosts: (callback: NewPostCallback) => () => void;
}

/**
 * Props for the NewPostProvider component
 */
export interface NewPostProviderProps {
  /** Children to render within the provider */
  children: React.ReactNode;
}
