'use client';

import { useMemo } from 'react';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import type { FlatNotification } from '@/core';

interface NotificationsListProps {
  notifications: FlatNotification[];
  unreadNotifications: FlatNotification[];
}

export function NotificationsList({ notifications, unreadNotifications }: NotificationsListProps) {
  // Create a Set of unread timestamps for O(1) lookup instead of O(n) search
  const unreadTimestamps = useMemo(() => new Set(unreadNotifications.map((n) => n.timestamp)), [unreadNotifications]);

  return (
    <Atoms.Container className="gap-3 rounded-md bg-card p-6">
      {notifications.map((notification, index) => {
        const isUnread = unreadTimestamps.has(notification.timestamp);
        return <Molecules.NotificationItem key={index} notification={notification} isUnread={isUnread} />;
      })}
    </Atoms.Container>
  );
}
