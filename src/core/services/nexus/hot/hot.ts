import * as Core from '@/core';

/**
 * Nexus Hot Service
 *
 * Handles fetching hot/trending tags from Nexus API
 */
export class NexusHotService {
  private constructor() {}

  /**
   * Fetches hot tags from Nexus API
   *
   * @param params - Parameters for fetching hot tags (TTagHotParams with all pagination and reach options)
   * @returns Array of hot tags with metadata
   */
  static async fetch(params: Core.TTagHotParams): Promise<Core.NexusHotTag[]> {
    const url = Core.tagApi.hot(params);
    return await Core.queryNexus<Core.NexusHotTag[]>({ url });
  }
}
