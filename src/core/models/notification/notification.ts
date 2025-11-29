import { Table } from 'dexie';
import * as Core from '@/core';
import * as Libs from '@/libs';
import * as Config from '@/config';
import { FlatNotification, NotificationType } from './notification.types';

// Primary key: auto-incrementing integer (++id) managed by Dexie
export class NotificationModel {
  static table: Table<FlatNotification> = Core.db.table('notifications');

  type!: NotificationType;
  timestamp!: number;

  // User-specific fields (optional based on notification type)
  followed_by?: string;
  unfollowed_by?: string;
  tagged_by?: string;
  tag_label?: string;
  post_uri?: string;
  parent_post_uri?: string;
  reply_uri?: string;
  reposted_by?: string;
  embed_uri?: string;
  repost_uri?: string;
  mentioned_by?: string;
  delete_source?: string;
  deleted_by?: string;
  deleted_uri?: string;
  linked_uri?: string;
  edit_source?: string;
  edited_by?: string;
  edited_uri?: string;

  constructor(notification: FlatNotification) {
    Object.assign(this, notification);
  }

  static async bulkSave(notifications: FlatNotification[]) {
    try {
      return await this.table.bulkPut(notifications);
    } catch (error) {
      throw Libs.createDatabaseError(
        Libs.DatabaseErrorType.BULK_OPERATION_FAILED,
        `Failed to bulk save records in ${this.table.name}`,
        500,
        {
          error,
          tuplesCount: notifications.length,
        },
      );
    }
  }

  // Query methods. TODO: Error handling when we will use it
  static async getRecent(limit: number = Config.NEXUS_NOTIFICATIONS_LIMIT): Promise<FlatNotification[]> {
    return await this.table.orderBy('timestamp').reverse().limit(limit).toArray();
  }

  static async getByType(type: NotificationType): Promise<FlatNotification[]> {
    return await this.table.where('type').equals(type).toArray();
  }

  static async getRecentByType(
    type: NotificationType,
    limit: number = Config.NEXUS_NOTIFICATIONS_LIMIT,
  ): Promise<FlatNotification[]> {
    return await this.table
      .where('type')
      .equals(type)
      .reverse()
      .sortBy('timestamp')
      .then((notifications) => notifications.slice(0, limit));
  }

  /**
   * Retrieves notifications older than a given timestamp, ordered by timestamp descending.
   * Used for timestamp-based pagination.
   *
   * @param olderThan - Unix timestamp to get notifications older than. Use Infinity for initial load.
   * @param limit - Maximum number of notifications to return
   * @returns Promise resolving to array of notifications ordered by timestamp descending
   */
  static async getOlderThan(
    olderThan: number,
    limit: number = Config.NEXUS_NOTIFICATIONS_LIMIT,
  ): Promise<FlatNotification[]> {
    try {
      return await this.table.where('timestamp').below(olderThan).reverse().limit(limit).toArray();
    } catch (error) {
      throw Libs.createDatabaseError(
        Libs.DatabaseErrorType.QUERY_FAILED,
        `Failed to read notifications older than ${olderThan} from ${this.table.name}`,
        500,
        {
          error,
          olderThan,
          limit,
        },
      );
    }
  }

  /**
   * Clear all notifications from the table.
   */
  static async clear(): Promise<void> {
    try {
      await this.table.clear();
    } catch (error) {
      throw Libs.createDatabaseError(
        Libs.DatabaseErrorType.DELETE_FAILED,
        `Failed to clear table ${this.table.name}`,
        500,
        {
          error,
        },
      );
    }
  }
}
