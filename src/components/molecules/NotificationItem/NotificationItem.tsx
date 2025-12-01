'use client';

import { useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import Link from 'next/link';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Core from '@/core';
import * as Libs from '@/libs';
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

  // Extract post URI for notifications with post content
  const postUri = getPostUriFromNotification(notification);
  const postCompositeId = postUri ? pubkyUriToCompositeId(postUri) : null;

  // Trigger fetching user data if not in local database
  useEffect(() => {
    if (!actorUserId) return;

    // ProfileController.read handles the caching strategy:
    // 1. Check local DB first
    // 2. If missing, fetch from Nexus
    // 3. Write to local DB
    Core.ProfileController.read({ userId: actorUserId }).catch((error) => {
      Libs.Logger.warn('Failed to fetch notification actor profile:', { actorUserId, error });
    });
  }, [actorUserId]);

  // Trigger fetching post data if not in local database
  useEffect(() => {
    if (!postCompositeId) return;

    // Try to fetch post content if not in local DB
    Core.LocalPostService.readPostDetails({ postId: postCompositeId }).then((post) => {
      if (!post) {
        // Post not in local DB, fetch from Nexus
        const viewerId = Core.useAuthStore.getState().currentUserPubky;
        if (viewerId) {
          Core.PostController.getOrFetchPost({ compositeId: postCompositeId, viewerId }).catch((error) => {
            Libs.Logger.warn('Failed to fetch notification post:', { postCompositeId, error });
          });
        }
      }
    });
  }, [postCompositeId]);

  // Reactively get user data from local database
  const userDetails = useLiveQuery(async () => {
    if (!actorUserId) return null;
    return await Core.UserController.getDetails({ userId: actorUserId });
  }, [actorUserId]);

  // Reactively get post data from local database
  const postDetails = useLiveQuery(async () => {
    if (!postCompositeId) return null;
    return await Core.LocalPostService.readPostDetails({ postId: postCompositeId });
  }, [postCompositeId]);

  // Get user name and avatar
  const userName = userDetails?.name || 'User';
  const avatarUrl = userDetails?.image ? Core.FileController.getAvatarUrl(userDetails.id) : undefined;

  // Get notification text with the actual user name
  const notificationText = getNotificationText(notification, userName);

  // Get post preview text
  const previewText = hasPostPreview(notification.type) ? formatPreviewText(postDetails?.content) : null;

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
