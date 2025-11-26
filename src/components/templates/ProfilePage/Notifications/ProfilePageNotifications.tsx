'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Hooks from '@/hooks';
import { PROFILE_ROUTES } from '@/app';
import { FlatNotification, NotificationType } from '@/core';

export function ProfilePageNotifications() {
  const { unreadNotifications, unreadCount, markAllAsRead } = Hooks.useNotifications();

  const pathname = usePathname();
  const prevPathnameRef = useRef<string | null>(null);

  // mock notifications with 10-minute intervals
  const now = new Date().getTime();
  const TEN_MINUTES = 10 * 60 * 1000; // 10 minutes in milliseconds

  const notifications = [
    {
      type: NotificationType.Follow,
      timestamp: now,
      followed_by: 'user1',
    },
    {
      type: NotificationType.Reply,
      timestamp: now - TEN_MINUTES,
      replied_by: 'user2',
      parent_post_uri: 'user1:post123',
      reply_uri: 'user2:reply456',
    },
    {
      type: NotificationType.TagPost,
      timestamp: now - TEN_MINUTES * 2,
      tagged_by: 'user3',
      tag_label: 'bitcoin',
      post_uri: 'user3:post789',
    },
    {
      type: NotificationType.TagProfile,
      timestamp: now - TEN_MINUTES * 3,
      tagged_by: 'user4',
      tag_label: 'bitcoin',
      post_uri: 'user4:post789',
    },
    {
      type: NotificationType.Repost,
      timestamp: now - TEN_MINUTES * 4,
      reposted_by: 'user5',
      post_uri: 'user5:post789',
    },
    {
      type: NotificationType.Mention,
      timestamp: now - TEN_MINUTES * 5,
      mentioned_by: 'user6',
      post_uri: 'user6:post789',
    },
    {
      type: NotificationType.PostDeleted,
      timestamp: now - TEN_MINUTES * 6,
      deleted_by: 'user7',
      deleted_uri: 'user7:post789',
    },
    {
      type: NotificationType.PostEdited,
      timestamp: now - TEN_MINUTES * 7,
      edited_by: 'user8',
      edited_uri: 'user8:post789',
    },
    {
      type: NotificationType.NewFriend,
      timestamp: now - TEN_MINUTES * 8,
      new_friend: 'user9',
    },
    {
      type: NotificationType.LostFriend,
      timestamp: now - TEN_MINUTES * 9,
      lost_friend: 'user10',
    },
    {
      type: NotificationType.TagPost,
      timestamp: now - TEN_MINUTES * 10,
      tagged_by: 'user11',
      tag_label: 'bitcoin',
      post_uri: 'user11:post789',
    },
    {
      type: NotificationType.TagProfile,
      timestamp: now - TEN_MINUTES * 11,
      tagged_by: 'user12',
      tag_label: 'bitcoin',
      post_uri: 'user12:post789',
    },
    {
      type: NotificationType.Reply,
      timestamp: now - TEN_MINUTES * 12,
      replied_by: 'user13',
      parent_post_uri: 'user13:post789',
      reply_uri: 'user13:reply789',
    },
    {
      type: NotificationType.Repost,
      timestamp: now - TEN_MINUTES * 13,
      reposted_by: 'user14',
      post_uri: 'user14:post789',
    },
    {
      type: NotificationType.Mention,
      timestamp: now - TEN_MINUTES * 14,
      mentioned_by: 'user15',
      post_uri: 'user15:post789',
    },
    {
      type: NotificationType.PostDeleted,
      timestamp: now - TEN_MINUTES * 15,
      deleted_by: 'user16',
      deleted_uri: 'user16:post789',
    },
    {
      type: NotificationType.PostEdited,
      timestamp: now - TEN_MINUTES * 16,
      edited_by: 'user17',
      edited_uri: 'user17:post789',
    },
    {
      type: NotificationType.NewFriend,
      timestamp: now - TEN_MINUTES * 17,
      new_friend: 'user18',
    },
    {
      type: NotificationType.LostFriend,
      timestamp: now - TEN_MINUTES * 18,
      lost_friend: 'user19',
    },
  ] as unknown as FlatNotification[];

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
