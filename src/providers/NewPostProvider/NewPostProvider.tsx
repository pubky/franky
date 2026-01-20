'use client';

import * as React from 'react';
import type { NewPostContextValue, NewPostProviderProps, NewPostCallback } from './NewPostProvider.types';

/**
 * Default context value - provides no-op functions when outside provider
 */
const defaultContextValue: NewPostContextValue = {
  signalNewPost: () => {},
  subscribeToNewPosts: () => () => {},
};

/**
 * Context for new post signaling
 */
const NewPostContext = React.createContext<NewPostContextValue>(defaultContextValue);

/**
 * NewPostProvider
 *
 * Provides a pub/sub mechanism for new post creation events.
 * This enables components outside of TimelineFeed (like DialogNewPost)
 * to signal when a post is created, allowing the home feed to update optimistically.
 *
 * @example
 * ```tsx
 * // In layout.tsx - wrap app with provider
 * <NewPostProvider>
 *   {children}
 * </NewPostProvider>
 *
 * // In usePostInput - signal new post
 * const { signalNewPost } = useNewPostContext();
 * signalNewPost(createdPostId);
 *
 * // In TimelineFeed - subscribe to new posts
 * const { subscribeToNewPosts } = useNewPostContext();
 * useEffect(() => {
 *   return subscribeToNewPosts((postId) => prependPosts(postId));
 * }, [subscribeToNewPosts, prependPosts]);
 * ```
 */
export function NewPostProvider({ children }: NewPostProviderProps) {
  // Store subscribers in a ref to avoid re-renders
  const subscribersRef = React.useRef<Set<NewPostCallback>>(new Set());

  // Create stable context value once using lazy useState initializer
  // The functions close over subscribersRef (stable) and only access .current when called
  const [contextValue] = React.useState<NewPostContextValue>(() => ({
    signalNewPost: (postId: string) => {
      subscribersRef.current.forEach((callback) => callback(postId));
    },
    subscribeToNewPosts: (callback: NewPostCallback) => {
      subscribersRef.current.add(callback);
      return () => subscribersRef.current.delete(callback);
    },
  }));

  return <NewPostContext.Provider value={contextValue}>{children}</NewPostContext.Provider>;
}

/**
 * Hook to access the new post context
 *
 * @returns The new post context value
 *
 * @example
 * ```tsx
 * // Signal a new post (in usePostInput)
 * const { signalNewPost } = useNewPostContext();
 * signalNewPost(postId);
 *
 * // Subscribe to new posts (in TimelineFeed)
 * const { subscribeToNewPosts } = useNewPostContext();
 * useEffect(() => {
 *   return subscribeToNewPosts((postId) => prependPosts(postId));
 * }, [subscribeToNewPosts, prependPosts]);
 * ```
 */
export function useNewPostContext(): NewPostContextValue {
  return React.useContext(NewPostContext);
}
