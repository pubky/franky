import * as Core from '@/core';

/**
 * Creates a unique key for a notification based on its type and relevant fields.
 * This is necessary because timestamp alone is not unique - multiple notifications
 * can have the same timestamp.
 *
 * @param notification - The notification to generate a key for
 * @returns A unique string key for the notification
 */
export function getNotificationKey(notification: Core.FlatNotification): string {
  const base = `${notification.type}:${notification.timestamp}`;

  switch (notification.type) {
    case Core.NotificationType.Follow:
    case Core.NotificationType.NewFriend:
      return `${base}:${notification.followed_by}`;
    case Core.NotificationType.LostFriend:
      return `${base}:${notification.unfollowed_by}`;
    case Core.NotificationType.TagPost:
      return `${base}:${notification.tagged_by}:${notification.post_uri}`;
    case Core.NotificationType.TagProfile:
      return `${base}:${notification.tagged_by}:${notification.tag_label}`;
    case Core.NotificationType.Reply:
      return `${base}:${notification.replied_by}:${notification.reply_uri}`;
    case Core.NotificationType.Repost:
      return `${base}:${notification.reposted_by}:${notification.repost_uri}`;
    case Core.NotificationType.Mention:
      return `${base}:${notification.mentioned_by}:${notification.post_uri}`;
    case Core.NotificationType.PostDeleted:
      return `${base}:${notification.deleted_by}:${notification.deleted_uri}`;
    case Core.NotificationType.PostEdited:
      return `${base}:${notification.edited_by}:${notification.edited_uri}`;
    default:
      return base;
  }
}
