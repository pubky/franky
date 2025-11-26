'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Hooks from '@/hooks';
import { PROFILE_ROUTES } from '@/app';

export function ProfilePageNotifications() {
  const { notifications, unreadNotifications, unreadCount, markAllAsRead } = Hooks.useNotifications();

  const pathname = usePathname();
  const prevPathnameRef = useRef<string | null>(null);

  // Mark all notifications as read when leaving the notifications page
  useEffect(() => {
    const isLeavingPage = prevPathnameRef.current === PROFILE_ROUTES.PROFILE && pathname !== PROFILE_ROUTES.PROFILE;

    if (isLeavingPage && unreadCount > 0) {
      markAllAsRead();
    }

    prevPathnameRef.current = pathname;
  }, [pathname, unreadCount, markAllAsRead]);

  if (notifications.length === 0) {
    return (
      <Atoms.Container className="mt-6 lg:mt-0">
        <Molecules.NotificationsEmpty />
      </Atoms.Container>
    );
  }

  return (
    <Atoms.Container className="mt-6 gap-4 lg:mt-0">
      <Atoms.Heading level={5} size="lg" className="leading-normal font-light text-muted-foreground lg:hidden">
        Notifications {unreadCount > 0 && `(${unreadCount})`}
      </Atoms.Heading>
      <Molecules.NotificationsList notifications={notifications} unreadNotifications={unreadNotifications} />
    </Atoms.Container>
  );
}
