'use client';

import { useEffect, useRef } from 'react';
import * as Core from '@/core';
import { useViewportObserver } from '../useViewportObserver';
import type {
  UseTtlSubscriptionOptions,
  UseTtlSubscriptionResult,
  TtlPostSubscriptionOptions,
} from './useTtlSubscription.types';

/**
 * Extract author pubky from composite post ID
 * Format: "authorPubky:postId"
 */
function extractAuthorFromPostId(compositePostId: string): string | null {
  const colonIndex = compositePostId.indexOf(':');
  return colonIndex === -1 ? null : compositePostId.substring(0, colonIndex);
}

/**
 * Unified hook for TTL-based data freshness tracking.
 *
 * Subscribes entities to the TtlCoordinator when visible in viewport,
 * ensuring data stays fresh by triggering background refreshes for stale entities.
 *
 * Supports both posts and users via a discriminated union type parameter.
 *
 * @param options - Configuration options with type discriminator
 * @returns Object containing the ref callback and visibility state
 *
 * @example
 * ```tsx
 * // For posts
 * function PostCard({ postId }) {
 *   const { ref } = useTtlSubscription({
 *     type: 'post',
 *     id: postId,
 *     subscribeAuthor: true,
 *   });
 *   return <div ref={ref}>...</div>;
 * }
 *
 * // For users
 * function UserCard({ userId }) {
 *   const { ref } = useTtlSubscription({
 *     type: 'user',
 *     id: userId,
 *   });
 *   return <div ref={ref}>...</div>;
 * }
 * ```
 */
export function useTtlSubscription(options: UseTtlSubscriptionOptions): UseTtlSubscriptionResult {
  const { type, id, enabled = true, rootMargin, threshold } = options;
  const subscribeAuthor = type === 'post' ? ((options as TtlPostSubscriptionOptions).subscribeAuthor ?? true) : false;

  // Track current subscriptions for cleanup
  const subscriptionRef = useRef<{
    postId: string | null;
    authorPubky: string | null;
    userPubky: string | null;
  }>({ postId: null, authorPubky: null, userPubky: null });

  // Use base viewport observer
  const { ref, isVisible } = useViewportObserver({
    rootMargin,
    threshold,
    enabled: enabled && !!id,
  });

  // Handle subscription lifecycle based on visibility
  useEffect(() => {
    if (!id || !enabled) return;

    const coordinator = Core.TtlCoordinator.getInstance();
    const sub = subscriptionRef.current;

    if (isVisible) {
      if (type === 'post') {
        // Handle post subscriptions
        // Unsubscribe old post if ID changed
        if (sub.postId && sub.postId !== id) {
          coordinator.unsubscribePost({ compositePostId: sub.postId });
          if (sub.authorPubky) {
            coordinator.unsubscribeUser({ pubky: sub.authorPubky as Core.Pubky });
            sub.authorPubky = null;
          }
        }

        // Subscribe new post if not already subscribed
        if (sub.postId !== id) {
          coordinator.subscribePost({ compositePostId: id });
          sub.postId = id;

          // Optionally subscribe author
          if (subscribeAuthor) {
            const author = extractAuthorFromPostId(id);
            if (author) {
              coordinator.subscribeUser({ pubky: author as Core.Pubky });
              sub.authorPubky = author;
            }
          }
        }
      } else {
        // Handle user subscriptions
        // Unsubscribe old user if ID changed
        if (sub.userPubky && sub.userPubky !== id) {
          coordinator.unsubscribeUser({ pubky: sub.userPubky as Core.Pubky });
        }

        // Subscribe new user if not already subscribed
        if (sub.userPubky !== id) {
          coordinator.subscribeUser({ pubky: id as Core.Pubky });
          sub.userPubky = id;
        }
      }
    } else {
      // Left viewport - unsubscribe everything
      if (type === 'post') {
        if (sub.postId) {
          coordinator.unsubscribePost({ compositePostId: sub.postId });
          sub.postId = null;
        }
        if (sub.authorPubky) {
          coordinator.unsubscribeUser({ pubky: sub.authorPubky as Core.Pubky });
          sub.authorPubky = null;
        }
      } else {
        if (sub.userPubky) {
          coordinator.unsubscribeUser({ pubky: sub.userPubky as Core.Pubky });
          sub.userPubky = null;
        }
      }
    }

    // Cleanup on unmount or when dependencies change
    return () => {
      const coordinator = Core.TtlCoordinator.getInstance();
      if (sub.postId) {
        coordinator.unsubscribePost({ compositePostId: sub.postId });
        sub.postId = null;
      }
      if (sub.authorPubky) {
        coordinator.unsubscribeUser({ pubky: sub.authorPubky as Core.Pubky });
        sub.authorPubky = null;
      }
      if (sub.userPubky) {
        coordinator.unsubscribeUser({ pubky: sub.userPubky as Core.Pubky });
        sub.userPubky = null;
      }
    };
  }, [type, id, isVisible, enabled, subscribeAuthor]);

  return { ref, isVisible };
}
