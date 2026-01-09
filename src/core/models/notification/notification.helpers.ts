import * as Core from '@/core';

// Generate business key inline
// Used for unread lookup to match against unreadNotifications
export const getBusinessKey = (n: Core.FlatNotification): string => {
  const base = `${n.type}:${n.timestamp}`;
  switch (n.type) {
    case Core.NotificationType.Follow:
    case Core.NotificationType.NewFriend:
      return `${base}:${n.followed_by}`;
    case Core.NotificationType.TagPost:
      return `${base}:${n.tagged_by}:${n.post_uri}`;
    case Core.NotificationType.TagProfile:
      return `${base}:${n.tagged_by}:${n.tag_label}`;
    case Core.NotificationType.Reply:
      return `${base}:${n.replied_by}:${n.reply_uri}`;
    case Core.NotificationType.Repost:
      return `${base}:${n.reposted_by}:${n.repost_uri}`;
    case Core.NotificationType.Mention:
      return `${base}:${n.mentioned_by}:${n.post_uri}`;
    case Core.NotificationType.PostDeleted:
      return `${base}:${n.deleted_by}:${n.deleted_uri}`;
    case Core.NotificationType.PostEdited:
      return `${base}:${n.edited_by}:${n.edited_uri}`;
    default:
      return base;
  }
};
