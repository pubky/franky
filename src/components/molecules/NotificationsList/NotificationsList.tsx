'use client';

import { useMemo } from 'react';
import * as Atoms from '@/atoms';
import * as Organisms from '@/organisms';
import * as Core from '@/core';
import type { NotificationsListProps } from './NotificationsList.types';

export function NotificationsList({ notifications, unreadNotifications }: NotificationsListProps) {
  // Create a Set of unread notification keys for O(1) lookup
  const unreadKeys = useMemo(() => new Set(unreadNotifications.map(Core.getNotificationKey)), [unreadNotifications]);

  return (
    <Atoms.Container className="gap-3 rounded-md bg-card p-6">
      {notifications.map((notification) => {
        const key = Core.getNotificationKey(notification);
        const isUnread = unreadKeys.has(key);
        return <Organisms.NotificationItem key={key} notification={notification} isUnread={isUnread} />;
      })}
    </Atoms.Container>
  );
}
