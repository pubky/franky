import { NotificationType } from '@/core/models/notification/notification.types';

/**
 * Configuration for notification types that should use user profile as primary link
 */
export const USER_CENTRIC_NOTIFICATION_TYPES = [
  NotificationType.Follow,
  NotificationType.LostFriend,
  NotificationType.NewFriend,
] as const;

/**
 * MOCK: Preview text configuration for notification types
 *
 * Single source of truth for which notifications show preview text and what that text is.
 *
 * TODO: Replace with actual post content from database
 *
 * How to implement:
 * 1. Fetch the post using post_uri/reply_uri from notification
 * 2. Get the post.content from database
 * 3. Truncate to ~20-30 characters
 * 4. Wrap with single quotes: `'${truncatedContent}...'`
 *
 * Example:
 * const postContent = await getPostContent(notification.post_uri);
 * const preview = `'${truncateText(postContent, 30)}...'`;
 */
export const NOTIFICATION_PREVIEW_CONFIG = {
  [NotificationType.Mention]: { preview: `'The reason why...'` }, // Mock - should be from post content
  [NotificationType.Reply]: { preview: `'I have said it...'` }, // Mock - should be from reply content
  [NotificationType.Repost]: { preview: `'I have said it...'` }, // Mock - should be from reposted post content
  [NotificationType.PostDeleted]: { preview: `'One of the...'` }, // Mock - should be from deleted post content
  [NotificationType.TagPost]: { preview: `'I have said it...'` }, // Mock - should be from tagged post content
} as const;
