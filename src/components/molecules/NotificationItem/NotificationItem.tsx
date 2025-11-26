'use client';

import Link from 'next/link';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Hooks from '@/hooks';
import * as Libs from '@/libs';
import { FlatNotification, NotificationType } from '@/core';
import { useNotificationLink } from './useNotificationLink';
import { hasPreviewText, getNotificationPreviewText } from './useNotificationPreview';

interface NotificationItemProps {
  notification: FlatNotification;
  isUnread: boolean;
}

export function NotificationItem({ notification, isUnread }: NotificationItemProps) {
  // Get notification display data
  const { userName, avatarUrl, notificationText } = Hooks.getNotificationDisplayData(notification);

  // Format timestamps (short for mobile, long for desktop)
  const timestampShort = Libs.formatNotificationTime(notification.timestamp, false);
  const timestampLong = Libs.formatNotificationTime(notification.timestamp, true);

  // Calculate notification links (business logic separated in hook)
  const { notificationLink } = useNotificationLink(notification);

  const contentElement = (
    <>
      <Atoms.Container overrideDefaults={true} className="flex items-center gap-2">
        {/* Avatar - navigation handled by parent notificationLink wrapper */}
        <Molecules.AvatarWithFallback avatarUrl={avatarUrl} name={userName} size="sm" className="lg:size-8" />

        <Atoms.Container overrideDefaults={true} className="flex items-center gap-2">
          <Atoms.Typography
            as="p"
            className="text-sm leading-none font-medium text-foreground lg:text-base lg:leading-normal"
          >
            {notificationText}
          </Atoms.Typography>

          {/* Post preview text for desktop - MOCK DATA - should fetch from database */}
          {hasPreviewText(notification.type) && (
            <Atoms.Typography as="p" className="hidden text-base font-medium text-muted-foreground xl:inline">
              {getNotificationPreviewText(notification.type)}
            </Atoms.Typography>
          )}

          {/* Tag badge for tagged post notifications */}
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
        <Atoms.Typography
          as="p"
          className="text-xs font-medium tracking-[1.2px] text-muted-foreground uppercase xl:hidden"
        >
          {timestampShort}
        </Atoms.Typography>
        {/* Long timestamp for large desktop */}
        <Atoms.Typography
          as="p"
          className="hidden text-xs font-medium tracking-[1.2px] text-muted-foreground uppercase xl:block"
        >
          {timestampLong}
        </Atoms.Typography>

        <Molecules.NotificationIcon type={notification.type} showBadge={isUnread} />
      </Atoms.Container>
    </>
  );

  return (
    <Atoms.Container overrideDefaults={true} className="flex w-full items-center justify-between gap-2">
      {notificationLink ? (
        <Link
          href={notificationLink}
          className="flex w-full items-center justify-between gap-2 transition-opacity hover:opacity-80"
        >
          {contentElement}
        </Link>
      ) : (
        contentElement
      )}
    </Atoms.Container>
  );
}
