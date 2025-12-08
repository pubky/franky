import { FlatNotification } from './notification.types';

export type NotificationModelSchema = FlatNotification;

// Schema design rationale:
// - id: Business key as primary key (type:timestamp:actor) - provides natural deduplication
// - timestamp: Most common query pattern (recent notifications, sorting)
// - type: Secondary filter (show only follows, replies, etc.)
//
// Note: Using business key as primary key eliminates need for duplicate checking
// and auto-increment issues. Same notification = same id = automatic upsert.
export const notificationTableSchema = `id, timestamp, type`;
