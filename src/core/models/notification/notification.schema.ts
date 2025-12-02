import { FlatNotification } from './notification.types';

export type NotificationModelSchema = FlatNotification;

// Schema design rationale:
// - id: Unique key generated from notification type, timestamp, and actor (primary key)
// - timestamp: Most common query pattern (recent notifications, sorting)
// - type: Secondary filter (show only follows, replies, etc.)
//
// The id is generated using getNotificationKey() which creates a deterministic
// key from the notification's type, timestamp, and relevant actor field.
// This ensures that duplicate notifications are replaced instead of duplicated.
//
// Note: User-specific fields (followed_by, replied_by, etc.) are intentionally
// not indexed because:
// 1. Most queries are by timestamp/type
// 2. Keeps schema simple and storage efficient
// 3. Can be added later if user queries become common
export const notificationTableSchema = `id, timestamp, type`;
