'use client';

import { useState, useEffect } from 'react';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Libs from '@/libs';
import * as Hooks from '@/hooks';
import { FlatNotification, NotificationType } from '@/core/models/notification/notification.types';
import { getNotificationText, getUserId } from './NotificationItem.utils';

export interface NotificationItemProps {
  notification: FlatNotification;
  className?: string;
}

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

export function NotificationItem({ notification, className }: NotificationItemProps) {
  const userId = getUserId(notification);
  const userData = userId ? Hooks.getNotificationUserData(userId) : null;
  const userName = userData?.name || 'User';
  const avatarUrl = userData?.avatar;
  const notificationText = getNotificationText(notification, userName);
  const timestamp = Libs.formatNotificationTime(notification.timestamp);

  // Calculate badge visibility in effect to avoid calling Date.now() during render
  const [showBadge, setShowBadge] = useState(false);

  useEffect(() => {
    const now = Date.now();
    setShowBadge(notification.timestamp > now - TWENTY_FOUR_HOURS_MS);
  }, [notification.timestamp]);

  return (
    <Atoms.Container
      overrideDefaults={true}
      className={Libs.cn('flex w-full items-center justify-between gap-2', className)}
    >
      {/* Left side: Avatar and text */}
      <Atoms.Container overrideDefaults={true} className="flex min-w-0 flex-1 items-center gap-2">
        {/* Avatar */}
        <Molecules.AvatarWithFallback
          avatarUrl={avatarUrl}
          name={userName}
          size="sm"
          className="shrink-0 lg:h-8 lg:w-8"
        />

        {/* Notification text */}
        <Atoms.Container overrideDefaults={true} className="flex min-w-0 flex-1 items-center gap-2">
          <Atoms.Typography
            as="p"
            className="text-sm leading-none font-medium text-foreground lg:text-base lg:leading-normal"
          >
            {notificationText}
          </Atoms.Typography>

          {/* Tag badge for tagged notifications */}
          {notification.type === NotificationType.TagPost && 'tag_label' in notification && (
            <Molecules.PostTag label={notification.tag_label} showClose={false} />
          )}

          {/* Post preview text for desktop (optional) */}
          {notification.type === NotificationType.Mention && (
            <Atoms.Typography as="p" className="hidden text-base font-medium text-muted-foreground lg:inline">
              {'The reason why...'}
            </Atoms.Typography>
          )}
        </Atoms.Container>
      </Atoms.Container>

      {/* Right side: Timestamp and icon */}
      <Atoms.Container overrideDefaults={true} className="flex shrink-0 items-center gap-2">
        {/* Timestamp */}
        <Atoms.Typography as="p" className="text-xs font-medium tracking-[1.2px] text-muted-foreground uppercase">
          {timestamp}
        </Atoms.Typography>

        {/* Icon */}
        <Atoms.NotificationIcon type={notification.type} showBadge={showBadge} size={24} />
      </Atoms.Container>
    </Atoms.Container>
  );
}
