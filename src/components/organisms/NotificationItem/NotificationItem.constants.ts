import { NotificationType } from '@/core/models/notification/notification.types';

/**
 * Configuration for notification types that should use user profile as primary link
 */
export const USER_CENTRIC_NOTIFICATION_TYPES = [NotificationType.Follow, NotificationType.NewFriend] as const;

/**
 * Human-readable action text for each notification type
 * TODO: Replace with translation keys when i18n is implemented
 */
export const NOTIFICATION_ACTION_TEXT: Record<NotificationType, string> = {
  [NotificationType.Follow]: 'followed you',
  [NotificationType.NewFriend]: 'is now your friend',
  [NotificationType.TagPost]: 'tagged your post',
  [NotificationType.TagProfile]: 'tagged your profile',
  [NotificationType.Reply]: 'replied to your post',
  [NotificationType.Repost]: 'reposted your post',
  [NotificationType.Mention]: 'mentioned you in post',
  [NotificationType.PostDeleted]: 'deleted a post',
  [NotificationType.PostEdited]: 'edited a post',
};
