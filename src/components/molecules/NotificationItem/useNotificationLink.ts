import { FlatNotification, NotificationType } from '@/core';
import { POST_ROUTES, PROFILE_ROUTES } from '@/app';
import { getUserIdFromNotification } from './NotificationItem.utils';

/**
 * Configuration for notification types that should use user profile as primary link
 */
const USER_CENTRIC_NOTIFICATION_TYPES = [
  NotificationType.Follow,
  NotificationType.LostFriend,
  NotificationType.NewFriend,
] as const;

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
 * Hook to calculate notification links and preview state
 *
 * Separates business logic from presentation layer
 *
 * @param notification - The notification to process
 * @returns Object with notificationLink and userProfileLink
 */
export function useNotificationLink(notification: FlatNotification) {
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
