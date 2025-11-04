import * as Core from '@/core';

/**
 * Nexus Post Stream Service
 *
 * Handles fetching post stream data from Nexus API.
 */
export class NexusPostStreamService {
  /**
   * Fetches post stream data from Nexus API
   *
   * @param params - Parameters for fetching post stream data
   * @returns Post stream data
   */
  static async fetch({ params, observer_id, streamId }: Core.TPostStreamFetchParams): Promise<Core.NexusPost[]> {
    const streamType = streamId.split(':')[1];
    let nexusEndpoint: string;
    switch (streamType) {
      case 'all':
        nexusEndpoint = Core.postStreamApi.all(params);
        break;
      case 'following':
      case 'friends':
        //TODO: NOT SURE yet
        if (!observer_id) {
          throw new Error('Observer ID is required for friends stream');
        }
        nexusEndpoint = Core.postStreamApi[streamType]({ ...params, observer_id });
        break;
      default:
        throw new Error(`Invalid stream type: ${streamType}`);
    }
    return await Core.queryNexus<Core.NexusPost[]>(nexusEndpoint);
  }
}
