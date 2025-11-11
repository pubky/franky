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
  static async fetch({ params, invokeEndpoint }: Core.TPostStreamFetchParams): Promise<Core.NexusPost[]> {
    console.log('post streaminvokeEndpoint', invokeEndpoint);
    console.log('params', params);
    let nexusEndpoint: string;
    switch (invokeEndpoint) {
      case 'all':
        nexusEndpoint = Core.postStreamApi.all(params);
        break;
      case 'following':
      case 'friends':
        // TODO: from now, always is going to be 
        if (!params.viewer_id) {
          throw new Error('Viewer ID is required for friends stream');
        }
        nexusEndpoint = Core.postStreamApi[invokeEndpoint]({ ...params, observer_id: params.viewer_id });
        break;
      default:
        throw new Error(`Invalid stream type: ${invokeEndpoint}`);
    }
    return (await Core.queryNexus<Core.NexusPost[]>(nexusEndpoint)) || [];
  }
}
