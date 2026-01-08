'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import * as Core from '@/core';
import type {
  UseTtlViewportSubscriptionOptions,
  UseTtlViewportSubscriptionResult,
} from './useTtlViewportSubscription.types';
import { DEFAULT_ROOT_MARGIN, DEFAULT_THRESHOLD } from './useTtlViewportSubscription.constants';

/**
 * Hook to manage TTL coordinator subscriptions based on viewport visibility.
 *
 * When the observed element enters the viewport:
 * - Subscribes the post to the TTL coordinator for freshness tracking
 * - Optionally subscribes the post author for user TTL tracking
 *
 * When the element leaves the viewport:
 * - Unsubscribes the post from TTL tracking
 * - Unsubscribes the author if subscribeAuthor was enabled
 *
 * @param options - Configuration options
 * @returns Object containing the ref callback and visibility state
 *
 * @example
 * ```tsx
 * function PostCard({ postId }) {
 *   const { ref, isVisible } = useTtlViewportSubscription({
 *     compositePostId: postId,
 *     subscribeAuthor: true,
 *   });
 *
 *   return (
 *     <div ref={ref}>
 *       <PostContent postId={postId} />
 *     </div>
 *   );
 * }
 * ```
 */
export function useTtlViewportSubscription({
  compositePostId,
  subscribeAuthor = true,
  rootMargin = DEFAULT_ROOT_MARGIN,
  threshold = DEFAULT_THRESHOLD,
}: UseTtlViewportSubscriptionOptions): UseTtlViewportSubscriptionResult {
  // Track observed element via state (ensures useEffect re-runs when element changes)
  const [element, setElement] = useState<HTMLElement | null>(null);

  // Track visibility state
  const [isVisible, setIsVisible] = useState(false);

  // Keep track of current subscription to handle postId changes
  const currentSubscriptionRef = useRef<{
    compositePostId: string;
    authorPubky: string | null;
  } | null>(null);

  // Callback ref to attach to the DOM element
  const ref = useCallback((node: HTMLElement | null) => {
    setElement(node);
  }, []);

  /**
   * Extract author pubky from composite post ID
   * Format: "authorPubky:postId"
   */
  const getAuthorFromCompositeId = useCallback((id: string): string | null => {
    const colonIndex = id.indexOf(':');
    if (colonIndex === -1) return null;
    return id.substring(0, colonIndex);
  }, []);

  /**
   * Subscribe to TTL tracking
   */
  const subscribe = useCallback(
    (postId: string) => {
      const coordinator = Core.TtlCoordinator.getInstance();
      const authorPubky = subscribeAuthor ? getAuthorFromCompositeId(postId) : null;

      // Subscribe post
      coordinator.subscribePost({ compositePostId: postId });

      // Subscribe author if enabled and extractable
      if (authorPubky) {
        coordinator.subscribeUser({ pubky: authorPubky as Core.Pubky });
      }

      // Track current subscription
      currentSubscriptionRef.current = {
        compositePostId: postId,
        authorPubky,
      };
    },
    [subscribeAuthor, getAuthorFromCompositeId],
  );

  /**
   * Unsubscribe from TTL tracking
   */
  const unsubscribe = useCallback(() => {
    const subscription = currentSubscriptionRef.current;
    if (!subscription) return;

    const coordinator = Core.TtlCoordinator.getInstance();

    // Unsubscribe post
    coordinator.unsubscribePost({ compositePostId: subscription.compositePostId });

    // Unsubscribe author if was subscribed
    if (subscription.authorPubky) {
      coordinator.unsubscribeUser({ pubky: subscription.authorPubky as Core.Pubky });
    }

    currentSubscriptionRef.current = null;
  }, []);

  // Setup IntersectionObserver
  useEffect(() => {
    // Skip if no element or no postId
    if (!element || !compositePostId) {
      return;
    }

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      const entry = entries[0];
      const nowVisible = entry.isIntersecting;

      setIsVisible(nowVisible);

      if (nowVisible) {
        // Element became visible - subscribe
        // First unsubscribe any existing subscription (handles postId changes)
        if (currentSubscriptionRef.current && currentSubscriptionRef.current.compositePostId !== compositePostId) {
          unsubscribe();
        }

        // Subscribe if not already subscribed to this post
        if (currentSubscriptionRef.current?.compositePostId !== compositePostId) {
          subscribe(compositePostId);
        }
      } else {
        // Element left viewport - unsubscribe
        unsubscribe();
      }
    };

    const observer = new IntersectionObserver(handleIntersection, {
      root: null, // Use viewport as root
      rootMargin,
      threshold,
    });

    observer.observe(element);

    // Cleanup on unmount or when dependencies change
    return () => {
      observer.unobserve(element);
      observer.disconnect();
      unsubscribe();
    };
  }, [element, compositePostId, rootMargin, threshold, subscribe, unsubscribe]);

  // Handle postId changes while visible
  useEffect(() => {
    if (!isVisible || !compositePostId) return;

    // If postId changed while visible, update subscription
    if (currentSubscriptionRef.current && currentSubscriptionRef.current.compositePostId !== compositePostId) {
      unsubscribe();
      subscribe(compositePostId);
    }
  }, [compositePostId, isVisible, subscribe, unsubscribe]);

  return { ref, isVisible };
}
