'use client';

import {
  StickyNote,
  AtSign,
  Tag,
  UserRoundPlus,
  UserRoundMinus,
  MessageCircle,
  Repeat,
  Trash2,
  HeartHandshake,
} from 'lucide-react';
import { NotificationType } from '@/core/models/notification/notification.types';
import { cn } from '@/libs';

export interface NotificationIconProps {
  type: NotificationType;
  className?: string;
  showBadge?: boolean;
  size?: number;
}

const iconMap = {
  [NotificationType.Follow]: UserRoundPlus,
  [NotificationType.NewFriend]: HeartHandshake,
  [NotificationType.LostFriend]: UserRoundMinus,
  [NotificationType.TagPost]: Tag,
  [NotificationType.TagProfile]: Tag,
  [NotificationType.Reply]: MessageCircle,
  [NotificationType.Repost]: Repeat,
  [NotificationType.Mention]: AtSign,
  [NotificationType.PostDeleted]: Trash2,
  [NotificationType.PostEdited]: StickyNote,
};

export function NotificationIcon({ type, className, showBadge = false, size = 24 }: NotificationIconProps) {
  const IconComponent = iconMap[type] || StickyNote;

  return (
    <div className={cn('relative shrink-0', className)} style={{ width: size, height: size }}>
      <IconComponent className="text-foreground" size={size} />
      {showBadge && (
        <div
          className="absolute top-[54.17%] right-0 bottom-0 left-[54.17%]"
          style={{
            width: '46%',
            height: '46%',
          }}
        >
          <div
            className="absolute inset-0 rounded-full"
            style={{
              backgroundColor: 'var(--brand)',
            }}
          />
        </div>
      )}
    </div>
  );
}
