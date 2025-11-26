'use client';

import Link from 'next/link';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Hooks from '@/hooks';
import * as Libs from '@/libs';
import { FlatNotification, NotificationType } from '@/core';
import { POST_ROUTES, PROFILE_ROUTES } from '@/app';
import { getUserIdFromNotification } from './NotificationItem.utils';

interface NotificationItemProps {
  notification: FlatNotification;
  isUnread: boolean;
}

/**
 * Configuration for notification types that should use user profile as primary link
 */
const USER_CENTRIC_NOTIFICATION_TYPES = [
  NotificationType.Follow,
  NotificationType.LostFriend,
  NotificationType.NewFriend,
] as const;

/**
 * Configuration for notification types that show post preview text
 */
const NOTIFICATION_TYPES_WITH_PREVIEW = [
  NotificationType.Mention,
  NotificationType.Reply,
  NotificationType.Repost,
  NotificationType.PostDeleted,
] as const;

/**
 * MOCK: Preview text mapping for different notification types
 *
 * TODO: Replace with actual post content from database
 *
 * How to implement:
 * 1. Fetch the post using post_uri/reply_uri from notification
 * 2. Get the post.content from database
 * 3. Truncate to ~20-30 characters
 * 4. Wrap with single quotes: `'${truncatedContent}...'`
 *
 * Example:
 * const postContent = await getPostContent(notification.post_uri);
 * const preview = `'${truncateText(postContent, 30)}...'`;
 */
const MOCK_NOTIFICATION_PREVIEW_TEXT: Record<string, string> = {
  [NotificationType.Mention]: `'The reason why...'`, // Mock - should be from post content
  [NotificationType.Reply]: `'I have said it...'`, // Mock - should be from reply content
  [NotificationType.Repost]: `'I have said it...'`, // Mock - should be from reposted post content
  [NotificationType.PostDeleted]: `'One of the...'`, // Mock - should be from deleted post content
  [NotificationType.TagPost]: `'I have said it...'`, // Mock - should be from tagged post content
};

/**
 * Get the appropriate link for a notification based on its type
 * - For post-related notifications: link to the post
 * - For user-related notifications: link to the user profile
 */
function getNotificationLink(notification: FlatNotification): string | null {
  // Use Record to access notification properties dynamically
  // This is needed because FlatNotification is a discriminated union
  const notif = notification as Record<string, unknown>;

  switch (notification.type) {
    case NotificationType.Reply:
      // Link to the reply post
      return notif.reply_uri ? `${POST_ROUTES.POST}/${notif.reply_uri}` : null;
    case NotificationType.Mention:
    case NotificationType.TagPost:
      // Link to the post where user was mentioned/tagged
      return notif.post_uri ? `${POST_ROUTES.POST}/${notif.post_uri}` : null;
    case NotificationType.Repost:
      // Link to the repost
      return notif.repost_uri ? `${POST_ROUTES.POST}/${notif.repost_uri}` : null;
    case NotificationType.PostDeleted:
      // Link to the linked post (parent or related post)
      return notif.linked_uri ? `${POST_ROUTES.POST}/${notif.linked_uri}` : null;
    case NotificationType.PostEdited:
      // Link to the edited post
      return notif.edited_uri ? `${POST_ROUTES.POST}/${notif.edited_uri}` : null;
    case NotificationType.Follow:
    case NotificationType.NewFriend:
      // For follow notifications, link to user profile will be set below
      return null;
    case NotificationType.LostFriend:
      // When someone unfollows you, link to their profile
      // We'll return the user profile link directly for this case
      return null; // Will be handled by getUserProfileLink
    case NotificationType.TagProfile:
      // When someone tags your profile, link to your tagged page
      return PROFILE_ROUTES.UNIQUE_TAGS;
    default:
      return null;
  }
}

/**
 * Get the user profile link for the notification actor
 */
function getUserProfileLink(userId: string): string {
  // TODO: Update when we have proper user profile routes with userId
  // For now, using a placeholder that we'll implement later
  return `/profile/${userId}`;
}

/**
 * Check if notification should use user profile as main link
 */
function shouldUsePrimaryUserLink(notification: FlatNotification): boolean {
  return (USER_CENTRIC_NOTIFICATION_TYPES as readonly NotificationType[]).includes(notification.type);
}

/**
 * Get preview text for notification
 *
 * MOCK IMPLEMENTATION - Returns placeholder text
 * TODO: Replace with actual post content from database
 *
 * Real implementation should:
 * - Accept the full notification object
 * - Extract post_uri/reply_uri/repost_uri
 * - Fetch post content from PostModel or PostController
 * - Truncate and format the content
 */
function getNotificationPreviewText(notificationType: NotificationType): string | null {
  return MOCK_NOTIFICATION_PREVIEW_TEXT[notificationType] || null;
}

export function NotificationItem({ notification, isUnread }: NotificationItemProps) {
  const { userName, avatarUrl, notificationText } = Hooks.getNotificationDisplayData(notification);
  const timestampShort = Libs.formatNotificationTime(notification.timestamp, false);
  const timestampLong = Libs.formatNotificationTime(notification.timestamp, true);

  // Determine the main notification link
  // For user-centric notifications (follow/unfollow/friend), use profile link
  // For post-centric notifications, use post link
  const postLink = getNotificationLink(notification);
  const usePrimaryUserLink = shouldUsePrimaryUserLink(notification);

  const userId = getUserIdFromNotification(notification);
  const userProfileLink = userId ? getUserProfileLink(userId) : null;
  const notificationLink = usePrimaryUserLink ? userProfileLink : postLink;

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

          {/* Post preview text for desktop - MOCK DATA - should fetch from database */}
          {(NOTIFICATION_TYPES_WITH_PREVIEW as readonly NotificationType[]).includes(notification.type) && (
            <Atoms.Typography as="p" className="hidden text-base font-medium text-muted-foreground xl:inline">
              {getNotificationPreviewText(notification.type)}
            </Atoms.Typography>
          )}

          {/* Tag badge for tagged post notifications - MOCK preview text */}
          {notification.type === NotificationType.TagPost && 'tag_label' in notification && (
            <Atoms.Typography as="p" className="hidden text-base font-medium text-muted-foreground xl:inline">
              {getNotificationPreviewText(NotificationType.TagPost)}
            </Atoms.Typography>
          )}
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
