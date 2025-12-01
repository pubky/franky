import * as Core from '@/core';

export class UserApplication {
  /**
   * Handles following or unfollowing a user.
   * Performs local database operations and syncs with the homeserver.
   * @param params - Parameters containing event type, URLs, JSON data, and user IDs
   */
  static async follow({ eventType, followUrl, followJson, follower, followee }: Core.TUserApplicationFollowParams) {
    if (eventType === Core.HomeserverAction.PUT) {
      await Core.LocalFollowService.create({ follower, followee });
    } else if (eventType === Core.HomeserverAction.DELETE) {
      await Core.LocalFollowService.delete({ follower, followee });
    }
    await Core.HomeserverService.request(eventType, followUrl, followJson);
  }

  /**
   * Handles muting or unmuting a user.
   * Performs local database operations and syncs with the homeserver.
   * @param params - Parameters containing event type, URLs, JSON data, and user IDs
   */
  static async mute({ eventType, muteUrl, muteJson, muter, mutee }: Core.TUserApplicationMuteParams) {
    if (eventType === Core.HomeserverAction.PUT) {
      await Core.LocalMuteService.create({ muter, mutee });
      await Core.HomeserverService.request(eventType, muteUrl, muteJson);
      return;
    }

    if (eventType === Core.HomeserverAction.DELETE) {
      await Core.LocalMuteService.delete({ muter, mutee });
      await Core.HomeserverService.request(eventType, muteUrl, muteJson);
      return;
    }
  }

  /**
   * Retrieves tags for a user from the nexus service.
   * @param params - Parameters containing user ID and pagination options
   * @returns Promise resolving to an array of tags
   */
  static async tags(params: Core.TUserTagsParams): Promise<Core.NexusTag[]> {
    return await Core.NexusUserService.tags(params);
  }

  /**
   * Retrieves taggers for a specific tag label on a user from the nexus service.
   * @param params - Parameters containing user ID, label, and pagination options
   * @returns Promise resolving to an array of users who tagged the user with the specified label
   */
  static async taggers(params: Core.TUserTaggersParams): Promise<Core.NexusUser[]> {
    return await Core.NexusUserService.taggers(params);
  }

  /**
   * Retrieves user details from local database. If not found, fetches from Nexus API and persists to local database.
   * @param params - Parameters containing user ID
   * @returns Promise resolving to user details or null if not found
   */
  static async details({ userId }: Core.TReadProfileParams): Promise<Core.NexusUserDetails | null> {
    const userDetails = await Core.LocalProfileService.details({ userId });
    if (userDetails) {
      return userDetails;
    }
    const nexusUserDetails = await Core.NexusUserService.details({ user_id: userId });
    if (nexusUserDetails) {
      await Core.LocalProfileService.upsert(nexusUserDetails);
    }
    return await Core.LocalProfileService.details({ userId });
  }

  /**
   * Retrieves user counts from local database. If not found, fetches from Nexus API and persists to local database.
   * @param params - Parameters containing user ID
   * @returns Promise resolving to user counts or null if not found
   */
  static async counts({ userId }: Core.TReadProfileParams): Promise<Core.NexusUserCounts | null> {
    const userCounts = await Core.LocalProfileService.counts({ userId });
    if (userCounts) {
      return userCounts;
    }
    const nexusUserCounts = await Core.NexusUserService.counts({ user_id: userId });
    if (nexusUserCounts) {
      await Core.LocalProfileService.upsertCounts({ userId }, nexusUserCounts);
      return await Core.LocalProfileService.counts({ userId });
    }
    return null;
  }
}
