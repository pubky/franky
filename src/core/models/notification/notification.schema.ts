import { FlatNotification } from './notification.types';

export type NotificationModelSchema = FlatNotification & { id: number };

// Schema design rationale:
// - ++id: Auto-incrementing primary key (always needed)
// - timestamp: Most common query pattern (recent notifications, sorting)
// - type: Secondary filter (show only follows, replies, etc.)
//
// Note: User-specific fields (followed_by, replied_by, etc.) are intentionally
// not indexed because:
// 1. Most queries are by timestamp/type
// 2. Keeps schema simple and storage efficient
// 3. Can be added later if user queries become common
export const notificationTableSchema = `++id, timestamp, type`;