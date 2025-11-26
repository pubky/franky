import { FlatNotification, NotificationType } from '@/core/models/notification/notification.types';

/**
 * Helper function to get notification text based on type
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
 * Helper function to extract user ID from notification
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
