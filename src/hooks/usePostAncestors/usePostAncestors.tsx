'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import * as Core from '@/core';
import * as Libs from '@/libs';
import type { Ancestor, UsePostAncestorsResult } from './usePostAncestors.types';

/** Maximum depth to traverse to prevent infinite loops */
const MAX_ANCESTOR_DEPTH = 10;

/**
 * Hook to fetch the ancestor chain for a post.
 *
 * Traverses the reply chain from the current post up to the root post,
 * returning an array of ancestors ordered from root to current.
 *
 * @param postId - Composite post ID in format "userId:postId"
 * @returns Ancestor chain and loading state
 *
 * @example
 * ```tsx
 * const { ancestors, isLoading } = usePostAncestors(postId);
 *
 * // ancestors = [
 * //   { postId: 'user1:post1', userId: 'user1' },  // root (John)
 * //   { postId: 'user2:post2', userId: 'user2' },  // parent (Satoshi)
 * //   { postId: 'user3:post3', userId: 'user3' },  // current (Anna)
 * // ]
 * ```
 */
export function usePostAncestors(postId: string | null | undefined): UsePostAncestorsResult {
  const result = useLiveQuery(
    async () => {
      if (!postId) {
        return { ancestors: [], hasError: false };
      }

      try {
        const ancestors: Ancestor[] = [];
        let currentPostId: string | null = postId;
        let depth = 0;

        // Traverse up the reply chain
        while (currentPostId && depth < MAX_ANCESTOR_DEPTH) {
          // Parse the composite ID to get the userId
          let userId: string;
          try {
            const parsed = Core.parseCompositeId(currentPostId);
            userId = parsed.pubky;
          } catch (error) {
            Libs.Logger.error('[usePostAncestors] Failed to parse composite ID', {
              currentPostId,
              error,
            });
            break;
          }

          // Add current post to the front of the chain (we're going backwards)
          ancestors.unshift({ postId: currentPostId, userId });

          // Get the parent post ID from relationships
          const relationships = await Core.PostController.getRelationships({
            compositeId: currentPostId,
          });

          if (!relationships?.replied) {
            // No parent - this is the root post
            break;
          }

          // Convert parent URI to composite ID
          const parentPostId = Core.buildCompositeIdFromPubkyUri({
            uri: relationships.replied,
            domain: Core.CompositeIdDomain.POSTS,
          });

          if (!parentPostId) {
            Libs.Logger.error('[usePostAncestors] Failed to build composite ID from parent URI', {
              currentPostId,
              repliedUri: relationships.replied,
            });
            break;
          }

          currentPostId = parentPostId;
          depth++;
        }

        if (depth >= MAX_ANCESTOR_DEPTH) {
          Libs.Logger.warn('[usePostAncestors] Max ancestor depth reached', {
            postId,
            depth,
          });
        }

        return { ancestors, hasError: false };
      } catch (error) {
        Libs.Logger.error('[usePostAncestors] Failed to fetch ancestor chain', {
          postId,
          error,
        });
        return { ancestors: [], hasError: true };
      }
    },
    [postId],
    undefined,
  );

  return {
    ancestors: result?.ancestors ?? [],
    isLoading: result === undefined,
    hasError: result?.hasError ?? false,
  };
}
