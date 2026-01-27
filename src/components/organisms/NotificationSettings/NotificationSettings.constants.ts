import type { NotificationPreferences } from '@/core';

type NotificationType = keyof NotificationPreferences;

export const NOTIFICATION_LABELS: Record<NotificationType, string> = {
  follow: 'New follower',
  newFriend: 'New friend',
  tagPost: 'Someone tagged your post',
  tagProfile: 'Someone tagged your profile',
  mention: 'Someone mentioned your profile',
  reply: 'New reply to your post',
  repost: 'New repost of your post',
  postDeleted: 'Someone deleted the post you interacted with',
  postEdited: 'Someone edited the post you interacted with',
};
