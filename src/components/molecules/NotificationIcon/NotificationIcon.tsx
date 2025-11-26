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
import * as Atoms from '@/atoms';

export interface NotificationIconProps {
  type: NotificationType;
  showBadge?: boolean;
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

const ICON_SIZE = 20;
const BADGE_SIZE = 11;

export function NotificationIcon({ type, showBadge = false }: NotificationIconProps) {
  const IconComponent = iconMap[type] || StickyNote;

  return (
    <Atoms.Container
      overrideDefaults={true}
      className="relative shrink-0"
      style={{ width: ICON_SIZE, height: ICON_SIZE }}
    >
      <IconComponent className="text-foreground" size={ICON_SIZE} />
      {showBadge && (
        <Atoms.Container
          overrideDefaults={true}
          className="absolute -right-0.5 -bottom-0.5 rounded-full"
          style={{
            width: BADGE_SIZE,
            height: BADGE_SIZE,
            backgroundColor: 'var(--brand)',
          }}
        />
      )}
    </Atoms.Container>
  );
}
