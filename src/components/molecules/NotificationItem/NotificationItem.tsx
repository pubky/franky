'use client';

import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Hooks from '@/hooks';
import { FlatNotification, NotificationType } from '@/core';

export interface NotificationItemProps {
  notification: FlatNotification;
  isUnread: boolean;
}

export function NotificationItem({ notification, isUnread }: NotificationItemProps) {
  const { userName, avatarUrl, notificationText, timestamp } = Hooks.getNotificationDisplayData(notification);

  return (
    <Atoms.Container overrideDefaults={true} className="flex w-full items-center justify-between gap-2">
      <Atoms.Container overrideDefaults={true} className="flex items-center gap-2">
        <Molecules.AvatarWithFallback avatarUrl={avatarUrl} name={userName} size="sm" className="lg:size-8" />

        <Atoms.Container overrideDefaults={true} className="flex items-center gap-2">
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

          {/* Post preview text for desktop */}
          {/* We can add more custom behavior like this for other notification types in the future */}
          {notification.type === NotificationType.Mention && (
            <Atoms.Typography as="p" className="hidden text-base font-medium text-muted-foreground lg:inline">
              {'The reason why...'}
            </Atoms.Typography>
          )}
        </Atoms.Container>
      </Atoms.Container>

      <Atoms.Container overrideDefaults={true} className="flex items-center gap-2">
        <Atoms.Typography as="p" className="text-xs font-medium tracking-[1.2px] text-muted-foreground uppercase">
          {timestamp}
        </Atoms.Typography>

        <Atoms.NotificationIcon type={notification.type} showBadge={isUnread} size={24} />
      </Atoms.Container>
    </Atoms.Container>
  );
}
