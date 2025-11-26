'use client';

import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Hooks from '@/hooks';
import * as Libs from '@/libs';
import { FlatNotification, NotificationType } from '@/core';

interface NotificationItemProps {
  notification: FlatNotification;
  isUnread: boolean;
}

export function NotificationItem({ notification, isUnread }: NotificationItemProps) {
  const { userName, avatarUrl, notificationText } = Hooks.getNotificationDisplayData(notification);
  const timestampShort = Libs.formatNotificationTime(notification.timestamp, false);
  const timestampLong = Libs.formatNotificationTime(notification.timestamp, true);

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

          {/* Post preview text for desktop - with single quotes around text */}
          {(notification.type === NotificationType.Mention ||
            notification.type === NotificationType.Reply ||
            notification.type === NotificationType.Repost ||
            notification.type === NotificationType.PostDeleted) && (
            <Atoms.Typography as="p" className="hidden text-base font-medium text-muted-foreground xl:inline">
              {notification.type === NotificationType.Mention && "'The reason why...'"}
              {notification.type === NotificationType.Reply && "'I have said it...'"}
              {notification.type === NotificationType.Repost && "'I have said it...'"}
              {notification.type === NotificationType.PostDeleted && "'One of the...'"}
            </Atoms.Typography>
          )}

          {/* Tag badge for tagged post notifications */}
          {notification.type === NotificationType.TagPost && 'tag_label' in notification && (
            <Atoms.Typography as="p" className="hidden text-base font-medium text-muted-foreground xl:inline">
              'I have said it...'
            </Atoms.Typography>
          )}
          {notification.type === NotificationType.TagPost && 'tag_label' in notification && (
            <Molecules.PostTag label={notification.tag_label} showClose={false} />
          )}

          {/* Tag badge for tagged profile notifications */}
          {notification.type === NotificationType.TagProfile && 'tag_label' in notification && (
            <Molecules.PostTag label={notification.tag_label} showClose={false} />
          )}

          {/* Friend notification extra text */}
          {notification.type === NotificationType.NewFriend && (
            <Atoms.Typography as="p" className="hidden text-base font-medium text-muted-foreground xl:inline">
              (you follow each other)
            </Atoms.Typography>
          )}
        </Atoms.Container>
      </Atoms.Container>

      <Atoms.Container overrideDefaults={true} className="flex items-center gap-2">
        {/* Short timestamp for mobile and medium screens */}
        <Atoms.Typography as="p" className="text-xs font-medium tracking-[1.2px] text-muted-foreground uppercase xl:hidden">
          {timestampShort}
        </Atoms.Typography>
        {/* Long timestamp for large desktop */}
        <Atoms.Typography as="p" className="hidden text-xs font-medium tracking-[1.2px] text-muted-foreground uppercase xl:block">
          {timestampLong}
        </Atoms.Typography>

        <Molecules.NotificationIcon type={notification.type} showBadge={isUnread} />
      </Atoms.Container>
    </Atoms.Container>
  );
}
