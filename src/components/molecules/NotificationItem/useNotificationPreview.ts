import { NotificationType } from '@/core/models/notification/notification.types';

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

/**
 * Get preview text for notification
 *
 * MOCK IMPLEMENTATION - Returns placeholder text
 * TODO: Replace with actual post content from database
 *
 * Real implementation should:
 * - Accept the full notification object
 * - Extract post_uri/reply_uri/repost_uri
 * - Fetch post content from PostModel or PostController
 * - Truncate and format the content
 */
export function getNotificationPreviewText(notificationType: NotificationType): string | null {
  return NOTIFICATION_PREVIEW_CONFIG[notificationType as keyof typeof NOTIFICATION_PREVIEW_CONFIG]?.preview ?? null;
}

/**
 * Check if notification type has preview text configured
 */
export function hasPreviewText(notificationType: NotificationType): boolean {
  return notificationType in NOTIFICATION_PREVIEW_CONFIG;
}
