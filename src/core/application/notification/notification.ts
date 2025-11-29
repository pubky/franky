import * as Core from '@/core';
import * as Libs from '@/libs';

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
    return await Core.LocalNotificationService.persitAndGetUnreadCount(notificationList, lastRead);
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
      // Fetch from Nexus using end parameter for timestamp-based pagination
      const nexusNotifications = await Core.NexusUserService.notifications({
        user_id: userId,
        end: olderThan === Infinity ? undefined : olderThan,
        limit,
      });

      if (!nexusNotifications || nexusNotifications.length === 0) {
        return { notifications: [], olderThan: undefined };
      }

      // Transforms Nexus notifications to flat notification format for persistence
      const flatNotifications = nexusNotifications.map((notification) =>
        Core.NotificationNormalizer.toFlatNotification(notification),
      );
      void Core.NotificationModel.bulkSave(flatNotifications);

      // Calculate next olderThan from the oldest notification in this batch
      const nextOlderThan = flatNotifications[flatNotifications.length - 1]?.timestamp;

      return { notifications: flatNotifications, olderThan: nextOlderThan };
    } catch (error) {
      Libs.Logger.warn('Failed to fetch notifications from Nexus', { userId, olderThan, limit, error });
      return { notifications: [], olderThan: undefined };
    }
  }
}
