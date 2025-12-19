'use client';

import * as Atoms from '@/atoms';
import * as Organisms from '@/organisms';
import * as Hooks from '@/hooks';
import type { ReplyWithNestedProps } from './ReplyWithNested.types';

/**
 * ReplyWithNested Organism
 *
 * Displays a reply post with its nested replies (if any).
 * Shows up to maxNestedReplies sub-replies underneath the main reply.
 *
 * Fetches from Nexus if not in local cache, then displays from cache.
 * Nested replies are indented and shown in chronological order.
 */
export function ReplyWithNested({
  replyId,
  isLastReply = false,
  onPostClick,
  maxNestedReplies = Hooks.DEFAULT_MAX_NESTED,
  depth = 0,
  maxDepth = Hooks.DEFAULT_MAX_DEPTH,
}: ReplyWithNestedProps) {
  const { nestedReplyIds, hasMoreReplies, hasNestedReplies, replyCount } = Hooks.useNestedReplies(replyId, {
    maxNestedReplies,
    depth,
    maxDepth,
  });

  return (
    <Atoms.Container overrideDefaults>
      {/* Main reply */}
      <Atoms.PostThreadSpacer />
      <Organisms.PostMain
        postId={replyId}
        isReply={true}
        onClick={() => onPostClick(replyId)}
        isLastReply={isLastReply && !hasNestedReplies}
      />

      {/* Nested replies */}
      {hasNestedReplies && (
        <Atoms.Container overrideDefaults className="ml-6">
          {nestedReplyIds.map((nestedId, index) => (
            <Atoms.Container key={`nested_${nestedId}`} overrideDefaults>
              <Atoms.PostThreadSpacer />
              <Organisms.PostMain
                postId={nestedId}
                isReply={true}
                onClick={() => onPostClick(nestedId)}
                isLastReply={isLastReply && index === nestedReplyIds.length - 1 && !hasMoreReplies}
              />
            </Atoms.Container>
          ))}

          {/* Show "View more replies" if there are more */}
          {hasMoreReplies && (
            <Atoms.Container overrideDefaults className="py-2 pl-4">
              <Atoms.Button
                variant="link"
                size="sm"
                onClick={() => onPostClick(replyId)}
                className="text-muted-foreground hover:text-foreground"
              >
                View {replyCount - nestedReplyIds.length} more{' '}
                {replyCount - nestedReplyIds.length === 1 ? 'reply' : 'replies'}...
              </Atoms.Button>
            </Atoms.Container>
          )}
        </Atoms.Container>
      )}
    </Atoms.Container>
  );
}
