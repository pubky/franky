import * as Core from '@/core';

export class HotController {
  private constructor() {} // Prevent instantiation

  /**
   * Get or fetch hot/trending tags based on reach and timeframe
   * @param params - Parameters object
   * @param params.reach - Reach filter (followers, following, friends, wot)
   * @param params.timeframe - Time period (today, this_month, all_time)
   * @param params.limit - Maximum number of tags to return
   * @param params.skip - Number of tags to skip
   * @param params.user_id - Optional user ID for personalized results
   * @param params.taggers_limit - Limit for taggers array in response
   * @returns Array of hot tags with metadata
   */
  static async getOrFetch(params: Core.TTagHotParams): Promise<Core.NexusHotTag[]> {
    return await Core.HotApplication.getOrFetch(params);
  }
}
