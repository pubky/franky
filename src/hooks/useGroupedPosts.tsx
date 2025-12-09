'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import * as Core from '@/core';

export type GroupedRepostEntry = {
  type: 'group';
  groupId: string;
  originalUri: string;
  originalPostId: string | null;
  postIds: string[];
  representativePostId: string;
  reposterIds: string[];
};

export type SinglePostEntry = {
  type: 'post';
  postId: string;
};

export type TimelineEntry = GroupedRepostEntry | SinglePostEntry;

/**
 * UI-layer grouping for reposts:
 * - Groups reposts that share the same original URI
 * - Only groups “blank” reposts (no content and no attachments)
 * - Preserves original ordering by walking the incoming postIds list
 */
export function useGroupedPosts(postIds: string[]): { entries: TimelineEntry[]; isLoading: boolean } {
  const entries = useLiveQuery(async () => {
    if (!postIds?.length) return [] as TimelineEntry[];

    // Fetch details + relationships for each postId in order
    const hydrated = await Promise.all(
      postIds.map(async (postId) => {
        const [details, relationships] = await Promise.all([
          Core.PostDetailsModel.findById(postId),
          Core.PostRelationshipsModel.findById(postId),
        ]);
        return { postId, details, relationships };
      }),
    );

    const processed = new Set<string>();
    const result: TimelineEntry[] = [];

    hydrated.forEach((item) => {
      if (processed.has(item.postId)) return;

      const isRepost = !!item.relationships?.reposted;
      const isBlankContent = !item.details?.content?.trim();
      const hasAttachments = !!item.details?.attachments?.length;
      const canGroup = isRepost && isBlankContent && !hasAttachments;

      if (!canGroup) {
        result.push({ type: 'post', postId: item.postId });
        processed.add(item.postId);
        return;
      }

      const groupKey = item.relationships!.reposted!;

      // Build group members in a single pass
      const groupMembers: typeof hydrated = [];
      for (const candidate of hydrated) {
        if (
          !processed.has(candidate.postId) &&
          candidate.relationships?.reposted === groupKey &&
          !candidate.details?.content?.trim() &&
          !candidate.details?.attachments?.length
        ) {
          groupMembers.push(candidate);
        }
      }

      if (groupMembers.length <= 1) {
        result.push({ type: 'post', postId: item.postId });
        processed.add(item.postId);
        return;
      }

      // Find representative post (earliest by indexed_at) and build arrays in single pass
      let representativePostId = groupMembers[0].postId;
      let earliestTimestamp = groupMembers[0].details?.indexed_at ?? Number.MAX_SAFE_INTEGER;
      const postIds: string[] = [groupMembers[0].postId];
      const reposterIds: string[] = [groupMembers[0].postId.split(':')[0]];

      for (let i = 1; i < groupMembers.length; i++) {
        const member = groupMembers[i];
        postIds.push(member.postId);
        reposterIds.push(member.postId.split(':')[0]);

        const timestamp = member.details?.indexed_at ?? Number.MAX_SAFE_INTEGER;
        if (timestamp < earliestTimestamp) {
          earliestTimestamp = timestamp;
          representativePostId = member.postId;
        }
      }

      const groupId = `grouped-${groupKey}`;
      const originalComposite = buildCompositeId(groupKey);

      result.push({
        type: 'group',
        groupId,
        originalUri: groupKey,
        originalPostId: originalComposite,
        postIds,
        representativePostId,
        reposterIds,
      });

      groupMembers.forEach((m) => processed.add(m.postId));
    });

    return result;
  }, [postIds]);

  return { entries: entries ?? [], isLoading: entries === undefined };
}

function buildCompositeId(repostedUri: string | null | undefined): string | null {
  if (!repostedUri) return null;
  try {
    // buildCompositeIdFromPubkyUri returns a string in format "pubky:id", not an object
    return Core.buildCompositeIdFromPubkyUri({
      uri: repostedUri,
      domain: Core.CompositeIdDomain.POSTS,
    });
  } catch {
    return null;
  }
}

// ============================================================================
// GROUPED REPOST DISPLAY UTILITIES
// ============================================================================

export interface RenderReposterTextParams {
  isCurrentUserReposted: boolean;
  firstReposterName?: string | null;
  othersCount: number;
  totalReposters: number;
}

/**
 * Renders reposter text based on count and available names.
 * Formats text like "You and 1 other reposted this" or "John and 14 others reposted this".
 * On mobile, truncates to "John, others reposted".
 * Handles singular/plural correctly: "1 other" vs "2 others"
 */
export function renderReposterText({
  isCurrentUserReposted,
  firstReposterName,
  othersCount,
  totalReposters,
}: RenderReposterTextParams): { mobileText: string; desktopText: string } {
  // If current user reposted, always say "You and X other(s) reposted this"
  if (isCurrentUserReposted) {
    if (othersCount === 0) {
      return {
        mobileText: 'You reposted',
        desktopText: 'You reposted this',
      };
    }
    // Use singular "other" for 1, plural "others" for more than 1
    const otherText = othersCount === 1 ? 'other' : 'others';
    return {
      mobileText: `You, others reposted`,
      desktopText: `You and ${othersCount} ${otherText} reposted this`,
    };
  }

  // Current user didn't repost
  if (totalReposters === 1) {
    const text = firstReposterName ? `${firstReposterName} reposted` : '1 reposted';
    return {
      mobileText: text,
      desktopText: `${text} this`,
    };
  }

  // Mobile: truncated format "John, others reposted"
  const mobileText = firstReposterName ? `${firstReposterName}, others reposted` : `${totalReposters} reposted`;

  // Desktop: full format "John and 14 others reposted this"
  // Use singular "other" for 1, plural "others" for more than 1
  const otherText = othersCount === 1 ? 'other' : 'others';
  const desktopText = firstReposterName
    ? `${firstReposterName} and ${othersCount} ${otherText} reposted this`
    : `${totalReposters} reposted this`;

  return { mobileText, desktopText };
}

export interface CalculateReposterDisplayParams {
  reposterIds: string[];
  postIds: string[];
  currentUserPubky: string | null;
}

export interface ReposterDisplayValues {
  reposterIdsWithoutCurrentUser: string[];
  avatarReposterIds: string[];
  avatarOverflowCount: number;
  firstReposterId: string | null;
  isCurrentUserReposted: boolean;
  totalReposters: number;
  othersCount: number;
  undoTargets: string[];
}

const MAX_AVATARS = 5;

/**
 * Calculate reposter display values from entry and current user
 */
export function calculateReposterDisplay({
  reposterIds,
  postIds,
  currentUserPubky,
}: CalculateReposterDisplayParams): ReposterDisplayValues {
  // Filter out current user from reposter list for display (they'll see "You" in text)
  const reposterIdsWithoutCurrentUser = reposterIds.filter((id) => id !== currentUserPubky);

  // Get reposter IDs for avatars (up to 5, excluding current user)
  const avatarReposterIds = reposterIdsWithoutCurrentUser.slice(0, MAX_AVATARS);
  const avatarOverflowCount = Math.max(0, reposterIdsWithoutCurrentUser.length - MAX_AVATARS);

  // Get first reposter for text (excluding current user)
  const firstReposterId = reposterIdsWithoutCurrentUser[0] ?? null;

  // Check if current user is a reposter
  const isCurrentUserReposted = reposterIds.includes(currentUserPubky ?? '');

  // Get total count (including current user if they reposted)
  const totalReposters = reposterIds.length;
  const othersCount = totalReposters - (isCurrentUserReposted ? 1 : 0);

  // Find current user's repost IDs to enable undo functionality
  const undoTargets = postIds.filter((id) => id.startsWith(`${currentUserPubky}:`));

  return {
    reposterIdsWithoutCurrentUser,
    avatarReposterIds,
    avatarOverflowCount,
    firstReposterId,
    isCurrentUserReposted,
    totalReposters,
    othersCount,
    undoTargets,
  };
}
