import * as Core from '@/core';
import * as Libs from '@/libs';
import { LastReadResult } from 'pubky-app-specs';

export class NotificationApplication {
  private constructor() {} // Prevent instantiation

  /**
   * Retrieves notifications from the nexus service and persists them locally,
   * then returns the count of unread notifications.
   * @param params - Parameters containing user ID and last read timestamp
   * @returns Promise resolving to the number of unread notifications
   */
  static async notifications({ userId, lastRead }: Core.TNotificationApplicationNotificationsParams): Promise<number> {
    const notificationList = await Core.NexusUserService.notifications({ user_id: userId, end: lastRead });
    return await Core.LocalNotificationService.persistAndGetUnreadCount(notificationList, lastRead);
  }

  /**
   * Updates the lastRead timestamp on the homeserver to mark all notifications as read.
   * This is a fire-and-forget operation - homeserver errors are logged but don't block.
   *
   * @param pubky - The user's public key
   * @returns The new lastRead timestamp
   */
  static markAllAsRead({ meta, last_read }: LastReadResult) {
    Core.HomeserverService.request(Core.HomeserverAction.PUT, meta.url, last_read.toJson()).catch(
      (error) => Libs.Logger.warn('Failed to update lastRead on homeserver', { error }),
    );
  }

  /**
   * Retrieves all notifications from the local cache.
   * @returns Promise resolving to all notifications ordered by timestamp descending
   */
  static async getAllFromCache(): Promise<Core.FlatNotification[]> {
    return await Core.LocalNotificationService.getAll();
  }

  /**
   * Retrieves notifications from cache if available, otherwise fetches from Nexus.
   * Follows a cache-first pattern similar to stream posts.
   *
   * Flow:
   * 1. Query cache for notifications older than the given timestamp
   * 2. If cache has enough items, return immediately (full cache hit)
   * 3. If cache has partial items, fetch remaining from Nexus (partial cache hit)
   * 4. If cache is empty, fetch all from Nexus (cache miss)
   * 5. Persist fetched notifications and return combined result
   *
   * @param params - Parameters containing userId, olderThan timestamp, and limit
   * @returns Promise resolving to notifications and next olderThan for pagination
   */
  static async getOrFetchNotifications({
    userId,
    olderThan,
    limit,
  }: Core.TGetOrFetchNotificationsParams): Promise<Core.TGetOrFetchNotificationsResponse> {
    // Try to get notifications from cache
    const cachedNotifications = await Core.LocalNotificationService.getOlderThan(olderThan, limit);

    // Full cache hit - return cached results
    if (cachedNotifications.length === limit) {
      const nextOlderThan = cachedNotifications[cachedNotifications.length - 1]?.timestamp;
      return { notifications: cachedNotifications, olderThan: nextOlderThan };
    }

    // Partial cache hit - fetch remaining from Nexus
    if (cachedNotifications.length > 0 && cachedNotifications.length < limit) {
      return await this.partialCacheHit({ userId, limit, cachedNotifications });
    }

    // Cache miss - fetch all from Nexus
    return await this.fetchFromNexus({ userId, olderThan, limit });
  }

  // ============================================================================
  // Internal Helpers
  // ============================================================================

  /**
   * Handles partial cache hits by fetching remaining notifications from Nexus.
   */
  private static async partialCacheHit({
    userId,
    limit,
    cachedNotifications,
  }: {
    userId: Core.Pubky;
    limit: number;
    cachedNotifications: Core.FlatNotification[];
  }): Promise<Core.TGetOrFetchNotificationsResponse> {
    const lastCachedTimestamp = cachedNotifications[cachedNotifications.length - 1]?.timestamp;
    const remainingLimit = limit - cachedNotifications.length;

    // Fetch remaining from Nexus
    const { notifications: nexusNotifications, olderThan: nextOlderThan } = await this.fetchFromNexus({
      userId,
      olderThan: lastCachedTimestamp,
      limit: remainingLimit,
    });

    // Combine cached and fetched, ensuring no duplicates by timestamp
    const seenTimestamps = new Set(cachedNotifications.map((n) => n.timestamp));
    const uniqueNexusNotifications = nexusNotifications.filter((n) => !seenTimestamps.has(n.timestamp));
    const combinedNotifications = [...cachedNotifications, ...uniqueNexusNotifications];

    return { notifications: combinedNotifications, olderThan: nextOlderThan };
  }

  /**
   * Fetches notifications from Nexus and persists them to cache.
   */
  private static async fetchFromNexus({
    userId,
    olderThan,
    limit,
  }: {
    userId: Core.Pubky;
    olderThan: number;
    limit: number;
  }): Promise<Core.TGetOrFetchNotificationsResponse> {
    try {
      // Fetch from Nexus using skip/limit pagination
      const nexusNotifications = await Core.NexusUserService.notifications({
        user_id: userId,
        limit,
        start: olderThan === Infinity ? undefined : olderThan,
      });

      if (!nexusNotifications || nexusNotifications.length === 0) {
        return { notifications: [], olderThan: undefined };
      }

      // Transforms Nexus notifications to flat notification format for persistence
      const flatNotifications = nexusNotifications.map((notification) =>
        Core.NotificationNormalizer.toFlatNotification(notification),
      );

      // IMPORTANT: Await the save so useLiveQuery can detect the database change
      // before this function returns. Without await, pagination won't work correctly.
      try {
        await Core.LocalNotificationService.bulkSave(flatNotifications);
      } catch (error) {
        Libs.Logger.warn('Failed to persist notifications to cache', { error });
      }

      // Calculate next olderThan from the oldest notification in this batch
      const nextOlderThan = flatNotifications[flatNotifications.length - 1]?.timestamp;

      // Decrement the timestamp. If not we will get duplicated notification. Infinity is used for initial load.
      return { notifications: flatNotifications, olderThan: nextOlderThan - 1 };
    } catch (error) {
      Libs.Logger.warn('Failed to fetch notifications from Nexus', { userId, olderThan, limit, error });
      return { notifications: [], olderThan: undefined };
    }
  }
}
