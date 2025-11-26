import * as Icons from '@/libs/icons';
import { NotificationType } from '@/core/models/notification/notification.types';

/**
 * Icon size in pixels
 */
export const ICON_SIZE = 24;

/**
 * Unread badge size in pixels
 */
export const BADGE_SIZE = 11;

/**
 * Mapping of notification types to their corresponding Lucide icon components
 */
export const NOTIFICATION_ICON_MAP = {
  [NotificationType.Follow]: Icons.UserRoundPlus,
  [NotificationType.NewFriend]: Icons.HeartHandshake,
  [NotificationType.LostFriend]: Icons.UserRoundMinus,
  [NotificationType.TagPost]: Icons.Tag,
  [NotificationType.TagProfile]: Icons.Tag,
  [NotificationType.Reply]: Icons.MessageCircle,
  [NotificationType.Repost]: Icons.Repeat,
  [NotificationType.Mention]: Icons.AtSign,
  [NotificationType.PostDeleted]: Icons.Trash2,
  [NotificationType.PostEdited]: Icons.StickyNote,
} as const;
