import { NotificationType } from '@/core/models/notification/notification.types';

/**
 * Configuration for notification types that should use user profile as primary link
 */
export const USER_CENTRIC_NOTIFICATION_TYPES = [
  NotificationType.Follow,
  NotificationType.LostFriend,
  NotificationType.NewFriend,
] as const;
