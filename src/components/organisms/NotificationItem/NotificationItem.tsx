'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Core from '@/core';
import * as Libs from '@/libs';
import * as Hooks from '@/hooks';
import { NotificationType } from '@/core';
import {
  getNotificationLink,
  getUserIdFromNotification,
  getNotificationText,
  getPostUriFromNotification,
  pubkyUriToCompositeId,
  formatPreviewText,
  hasPostPreview,
} from './NotificationItem.utils';
import type { NotificationItemProps } from './NotificationItem.types';

export function NotificationItem({ notification, isUnread }: NotificationItemProps) {
  // Extract the user ID from the notification (the actor who triggered it)
  const actorUserId = getUserIdFromNotification(notification);

  // Extract post composite ID for notifications with post content (memoized to avoid recalculation)
  const postCompositeId = useMemo(() => {
    const postUri = getPostUriFromNotification(notification);
    return postUri ? pubkyUriToCompositeId(postUri) : null;
  }, [notification]);

  // State for post content (fetched via controller)
  const [postContent, setPostContent] = useState<string | null>(null);

  // Use existing hook for user profile data
  const { profile } = Hooks.useUserProfile(actorUserId || '');

  // Fetch post content via controller (handles caching internally)
  useEffect(() => {
    if (!postCompositeId) return;

    const viewerId = Core.useAuthStore.getState().currentUserPubky;
    if (!viewerId) return;

    let isCancelled = false;

    // PostController.getOrFetchDetails handles the caching strategy:
    // 1. Check local DB first
    // 2. If missing, fetch from Nexus
    // 3. Write to local DB
    Core.PostController.getOrFetchDetails({ compositeId: postCompositeId, viewerId })
      .then((post) => {
        if (!isCancelled && post?.content) {
          setPostContent(post.content);
        }
      })
      .catch((error) => {
        if (!isCancelled) {
          Libs.Logger.warn('Failed to fetch notification post:', { postCompositeId, error });
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [postCompositeId]);

  // Get user name and avatar from profile hook
  const userName = profile?.name || 'User';
  const avatarUrl = profile?.avatarUrl;

  // Get notification text with the actual user name
  const notificationText = getNotificationText(notification, userName);

  // Get post preview text
  const previewText = hasPostPreview(notification.type) ? formatPreviewText(postContent) : null;

  // Format timestamps (short for mobile, long for desktop)
  const timestampShort = Libs.formatNotificationTime(notification.timestamp, false);
  const timestampLong = Libs.formatNotificationTime(notification.timestamp, true);

  // Calculate notification links (business logic separated in pure function)
  const { notificationLink } = getNotificationLink(notification);

  const contentElement = (
    <>
      <Atoms.Container overrideDefaults={true} className="flex items-center gap-2">
        {/* Avatar - navigation handled by parent notificationLink wrapper */}
        <Molecules.AvatarWithFallback avatarUrl={avatarUrl} name={userName} size="sm" className="lg:size-8" />

        <Atoms.Container overrideDefaults={true} className="flex items-center gap-2">
          <Atoms.Typography
            as="p"
            className="text-sm leading-none font-medium text-foreground lg:text-base lg:leading-normal"
          >
            {notificationText}
          </Atoms.Typography>

          {/* Post preview text for desktop - dynamically fetched from database */}
          {previewText && (
            <Atoms.Typography as="p" className="hidden text-base font-medium text-muted-foreground xl:inline">
              {previewText}
            </Atoms.Typography>
          )}

          {/* Tag badge for tagged post notifications */}
          {notification.type === NotificationType.TagPost && 'tag_label' in notification && (
            <Molecules.PostTag label={notification.tag_label} showClose={false} />
          )}

          {/* Tag badge for tagged profile notifications */}
          {notification.type === NotificationType.TagProfile && 'tag_label' in notification && (
            <Molecules.PostTag label={notification.tag_label} showClose={false} />
          )}

          {/* Friend notification extra text */}
          {notification.type === NotificationType.NewFriend && (
            <Atoms.Typography as="p" className="hidden text-base font-medium text-muted-foreground xl:inline">
              (you follow each other)
            </Atoms.Typography>
          )}
        </Atoms.Container>
      </Atoms.Container>

      <Atoms.Container overrideDefaults={true} className="flex items-center gap-2">
        {/* Short timestamp for mobile and medium screens */}
        <Atoms.Typography
          as="p"
          className="text-xs font-medium tracking-[1.2px] text-muted-foreground uppercase xl:hidden"
        >
          {timestampShort}
        </Atoms.Typography>
        {/* Long timestamp for large desktop */}
        <Atoms.Typography
          as="p"
          className="hidden text-xs font-medium tracking-[1.2px] text-muted-foreground uppercase xl:block"
        >
          {timestampLong}
        </Atoms.Typography>

        <Molecules.NotificationIcon type={notification.type} showBadge={isUnread} />
      </Atoms.Container>
    </>
  );

  return (
    <Atoms.Container overrideDefaults={true} className="flex w-full items-center justify-between gap-2">
      {notificationLink ? (
        <Link
          href={notificationLink}
          className="flex w-full items-center justify-between gap-2 transition-opacity hover:opacity-80"
        >
          {contentElement}
        </Link>
      ) : (
        contentElement
      )}
    </Atoms.Container>
  );
}
