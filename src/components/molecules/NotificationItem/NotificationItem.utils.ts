import type { FlatNotification } from '@/core';
import { NotificationType } from '@/core/models/notification/notification.types';
import { POST_ROUTES, PROFILE_ROUTES } from '@/app';
import { USER_CENTRIC_NOTIFICATION_TYPES, NOTIFICATION_PREVIEW_CONFIG } from './NotificationItem.constants';

// ============================================================================
// NOTIFICATION TEXT UTILITIES
// ============================================================================

/**
 * Get notification text based on type
 */
export function getNotificationText(notification: FlatNotification, userName: string = 'User'): string {
  switch (notification.type) {
    case NotificationType.Follow:
      return `${userName} followed you`;
    case NotificationType.NewFriend:
      return `${userName} is now your friend`;
    case NotificationType.LostFriend:
      return `${userName} unfollowed you`;
    case NotificationType.TagPost:
      return `${userName} tagged your post`;
    case NotificationType.TagProfile:
      return `${userName} tagged your profile`;
    case NotificationType.Reply:
      return `${userName} replied to your post`;
    case NotificationType.Repost:
      return `${userName} reposted your post`;
    case NotificationType.Mention:
      return `${userName} mentioned you in post`;
    case NotificationType.PostDeleted:
      return `${userName} deleted his post`;
    default:
      return 'New notification';
  }
}

/**
 * Extract user ID from notification based on type
 */
export function getUserIdFromNotification(notification: FlatNotification): string {
  switch (notification.type) {
    case NotificationType.Follow:
    case NotificationType.NewFriend:
      return notification.followed_by;
    case NotificationType.LostFriend:
      return notification.unfollowed_by;
    case NotificationType.TagPost:
    case NotificationType.TagProfile:
      return notification.tagged_by;
    case NotificationType.Reply:
      return notification.replied_by;
    case NotificationType.Repost:
      return notification.reposted_by;
    case NotificationType.Mention:
      return notification.mentioned_by;
    case NotificationType.PostDeleted:
      return notification.deleted_by;
    case NotificationType.PostEdited:
      return notification.edited_by;
    default:
      return '';
  }
}

// ============================================================================
// NOTIFICATION LINK UTILITIES
// ============================================================================

/**
 * Get the appropriate post link for a notification based on its type
 * Uses TypeScript's discriminated union type narrowing for type safety
 */
function getPostLink(notification: FlatNotification): string | null {
  switch (notification.type) {
    case NotificationType.Reply:
      // TypeScript knows notification.reply_uri exists for Reply type
      return notification.reply_uri ? `${POST_ROUTES.POST}/${notification.reply_uri}` : null;

    case NotificationType.Mention:
      // TypeScript knows notification.post_uri exists for Mention type
      return notification.post_uri ? `${POST_ROUTES.POST}/${notification.post_uri}` : null;

    case NotificationType.TagPost:
      // TypeScript knows notification.post_uri exists for TagPost type
      return notification.post_uri ? `${POST_ROUTES.POST}/${notification.post_uri}` : null;

    case NotificationType.Repost:
      // TypeScript knows notification.repost_uri exists for Repost type
      return notification.repost_uri ? `${POST_ROUTES.POST}/${notification.repost_uri}` : null;

    case NotificationType.PostDeleted:
      // TypeScript knows notification.linked_uri exists for PostDeleted type
      return notification.linked_uri ? `${POST_ROUTES.POST}/${notification.linked_uri}` : null;

    case NotificationType.PostEdited:
      // TypeScript knows notification.edited_uri exists for PostEdited type
      return notification.edited_uri ? `${POST_ROUTES.POST}/${notification.edited_uri}` : null;

    case NotificationType.Follow:
    case NotificationType.NewFriend:
    case NotificationType.LostFriend:
      // User-centric notifications - no post link
      return null;

    case NotificationType.TagProfile:
      // When someone tags your profile, link to your tagged page
      return PROFILE_ROUTES.UNIQUE_TAGS;

    default:
      // Exhaustiveness check - TypeScript will error if we miss a case
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
 * Calculate notification links based on notification type and data.
 * Pure function that separates business logic from presentation layer.
 *
 * @param notification - The notification to process
 * @returns Object with notificationLink and userProfileLink
 */
export function getNotificationLink(notification: FlatNotification) {
  // Get user ID to create profile link
  const userId = getUserIdFromNotification(notification);
  const userProfileLink = userId ? getUserProfileLink(userId) : null;

  // Determine the main notification link
  // For user-centric notifications (follow/unfollow/friend), use profile link
  // For post-centric notifications, use post link
  const postLink = getPostLink(notification);
  const usePrimaryUserLink = shouldUsePrimaryUserLink(notification);
  const notificationLink = usePrimaryUserLink ? userProfileLink : postLink;

  return {
    notificationLink,
    userProfileLink,
  };
}

// ============================================================================
// NOTIFICATION PREVIEW UTILITIES
// ============================================================================

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
export function getNotificationPreviewText(notificationType: NotificationType): string | null {
  return NOTIFICATION_PREVIEW_CONFIG[notificationType as keyof typeof NOTIFICATION_PREVIEW_CONFIG]?.preview ?? null;
}

/**
 * Check if notification type has preview text configured
 */
export function hasPreviewText(notificationType: NotificationType): boolean {
  return notificationType in NOTIFICATION_PREVIEW_CONFIG;
}
