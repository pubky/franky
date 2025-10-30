import { Table } from 'dexie';
import * as Core from '@/core';
import { FlatNotification, NotificationType } from './notification.types';
import * as Libs from '@/libs';

const DEFAULT_LIMIT = 20;

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
  static async getRecent(limit: number = DEFAULT_LIMIT): Promise<FlatNotification[]> {
    return await this.table.orderBy('timestamp').reverse().limit(limit).toArray();
  }

  static async getByType(type: NotificationType): Promise<FlatNotification[]> {
    return await this.table.where('type').equals(type).toArray();
  }

  static async getRecentByType(type: NotificationType, limit: number = DEFAULT_LIMIT): Promise<FlatNotification[]> {
    return await this.table
      .where('type')
      .equals(type)
      .reverse()
      .sortBy('timestamp')
      .then((notifications) => notifications.slice(0, limit));
  }
}
