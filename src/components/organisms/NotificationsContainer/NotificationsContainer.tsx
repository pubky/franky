'use client';

import { useEffect, useRef } from 'react';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Hooks from '@/hooks';

/**
 * Organism that handles all notification business logic:
 * - Fetching notifications via Core
 * - Marking as read
 * - Infinite scroll pagination
 * - Loading/error/empty states
 */
export function NotificationsContainer() {
  const { notifications, unreadNotifications, isLoading, isLoadingMore, hasMore, error, loadMore, markAllAsRead } =
    Hooks.useNotifications();

  const hasMarkedAsReadRef = useRef(false);

  // Infinite scroll sentinel
  const { sentinelRef } = Hooks.useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore,
    isLoading: isLoadingMore,
  });

  // Mark all notifications as read when entering the notifications page
  useEffect(() => {
    if (!hasMarkedAsReadRef.current) {
      hasMarkedAsReadRef.current = true;
      markAllAsRead();
    }
  }, [markAllAsRead]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Atoms.Spinner size="lg" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  // Empty state
  if (notifications.length === 0) {
    return <Molecules.NotificationsEmpty />;
  }

  return (
    <>
      <Atoms.Heading level={5} size="lg" className="leading-normal font-light text-muted-foreground lg:hidden">
        Notifications {unreadNotifications.length > 0 && `(${unreadNotifications.length})`}
      </Atoms.Heading>
      <Molecules.NotificationsList notifications={notifications} unreadNotifications={unreadNotifications} />

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="h-1" />

      {/* Loading more indicator */}
      {isLoadingMore && (
        <div className="flex items-center justify-center py-4">
          <Atoms.Spinner size="md" />
        </div>
      )}
    </>
  );
}
