import * as Core from '@/core';
import * as Libs from '@/libs';

export class HotApplication {
  private constructor() {}

  /**
   * Fetches hot tags from Nexus API
   *
   * @param params - Parameters for fetching hot tags (includes reach, timeframe, skip, limit)
   * @returns Array of hot tags
   */
  static async getOrFetch(params: Core.TTagHotParams): Promise<Core.NexusHotTag[]> {
    try {
      return await Core.NexusHotService.fetch(params);
    } catch (error) {
      Libs.Logger.error('Error in HotApplication.getOrFetch:', error);
      return [];
    }
  }
}
