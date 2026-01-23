'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import * as Core from '@/core';
import type {
  UseTtlUserViewportSubscriptionOptions,
  UseTtlUserViewportSubscriptionResult,
} from './useTtlUserViewportSubscription.types';
import { DEFAULT_ROOT_MARGIN, DEFAULT_THRESHOLD } from './useTtlUserViewportSubscription.constants';

/**
 * Hook to manage TTL coordinator subscriptions for users based on viewport visibility.
 *
 * When the observed element enters the viewport:
 * - Subscribes the user to the TTL coordinator for freshness tracking
 *
 * When the element leaves the viewport:
 * - Unsubscribes the user from TTL tracking
 *
 * @param options - Configuration options
 * @returns Object containing the ref callback and visibility state
 *
 * @example
 * ```tsx
 * function UserCard({ userId }) {
 *   const { ref, isVisible } = useTtlUserViewportSubscription({
 *     pubky: userId,
 *   });
 *
 *   return (
 *     <div ref={ref}>
 *       <UserContent userId={userId} />
 *     </div>
 *   );
 * }
 * ```
 */
export function useTtlUserViewportSubscription({
  pubky,
  rootMargin = DEFAULT_ROOT_MARGIN,
  threshold = DEFAULT_THRESHOLD,
}: UseTtlUserViewportSubscriptionOptions): UseTtlUserViewportSubscriptionResult {
  // Track observed element via state (ensures useEffect re-runs when element changes)
  const [element, setElement] = useState<HTMLElement | null>(null);

  // Track visibility state
  const [isVisible, setIsVisible] = useState(false);

  // Keep track of current subscription to handle pubky changes
  const currentSubscriptionRef = useRef<string | null>(null);

  // Callback ref to attach to the DOM element
  const ref = useCallback((node: HTMLElement | null) => {
    setElement(node);
  }, []);

  /**
   * Subscribe to TTL tracking
   */
  const subscribe = useCallback((userPubky: string) => {
    const coordinator = Core.TtlCoordinator.getInstance();

    // Subscribe user
    coordinator.subscribeUser({ pubky: userPubky as Core.Pubky });

    // Track current subscription
    currentSubscriptionRef.current = userPubky;
  }, []);

  /**
   * Unsubscribe from TTL tracking
   */
  const unsubscribe = useCallback(() => {
    const subscription = currentSubscriptionRef.current;
    if (!subscription) return;

    const coordinator = Core.TtlCoordinator.getInstance();

    // Unsubscribe user
    coordinator.unsubscribeUser({ pubky: subscription as Core.Pubky });

    currentSubscriptionRef.current = null;
  }, []);

  // Setup IntersectionObserver
  useEffect(() => {
    // Skip if no element or no pubky
    if (!element || !pubky) {
      return;
    }

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      const entry = entries[0];
      const nowVisible = entry.isIntersecting;

      setIsVisible(nowVisible);

      if (nowVisible) {
        // Element became visible - subscribe
        // First unsubscribe any existing subscription (handles pubky changes)
        if (currentSubscriptionRef.current && currentSubscriptionRef.current !== pubky) {
          unsubscribe();
        }

        // Subscribe if not already subscribed to this user
        if (currentSubscriptionRef.current !== pubky) {
          subscribe(pubky);
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
  }, [element, pubky, rootMargin, threshold, subscribe, unsubscribe]);

  // Handle pubky changes while visible
  useEffect(() => {
    if (!isVisible || !pubky) return;

    // If pubky changed while visible, update subscription
    if (currentSubscriptionRef.current && currentSubscriptionRef.current !== pubky) {
      unsubscribe();
      subscribe(pubky);
    }
  }, [pubky, isVisible, subscribe, unsubscribe]);

  return { ref, isVisible };
}
