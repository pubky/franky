'use client';

import { useMemo } from 'react';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Core from '@/core';
import type { NotificationsListProps } from './NotificationsList.types';

/**
 * Creates a unique key for a notification based on its type and relevant fields.
 */
function getNotificationKey(notification: Core.FlatNotification): string {
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

export function NotificationsList({ notifications, unreadNotifications }: NotificationsListProps) {
  // Create a Set of unread notification keys for O(1) lookup
  const unreadKeys = useMemo(() => new Set(unreadNotifications.map(getNotificationKey)), [unreadNotifications]);

  return (
    <Atoms.Container className="gap-3 rounded-md bg-card p-6">
      {notifications.map((notification) => {
        const key = getNotificationKey(notification);
        const isUnread = unreadKeys.has(key);
        return <Molecules.NotificationItem key={key} notification={notification} isUnread={isUnread} />;
      })}
    </Atoms.Container>
  );
}
