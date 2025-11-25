'use client';

import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import { FlatNotification } from '@/core/models/notification/notification.types';

export interface NotificationsListProps {
  notifications: FlatNotification[];
}

export function NotificationsList({ notifications }: NotificationsListProps) {
  return (
    <Atoms.Container overrideDefaults={true} className="flex w-full flex-col gap-4 rounded-md bg-card p-6">
      {notifications.map((notification, index) => (
        <Molecules.NotificationItem
          key={`notification-${index}-${notification.timestamp}`}
          notification={notification}
        />
      ))}
    </Atoms.Container>
  );
}
