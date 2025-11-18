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
  static async fetch({ params, invokeEndpoint, extraParams }: Core.TPostStreamFetchParams): Promise<Core.NexusPost[]> {
    let nexusEndpoint: string;
    switch (invokeEndpoint) {
      case Core.StreamSource.ALL:
        nexusEndpoint = Core.postStreamApi.all(params);
        break;
      case Core.StreamSource.FOLLOWING:
      case Core.StreamSource.FRIENDS:
        // TODO: from now, always is going to be
        if (!params.viewer_id) {
          throw new Error('Viewer ID is required for friends stream');
        }
        nexusEndpoint = Core.postStreamApi[invokeEndpoint]({ ...params, observer_id: params.viewer_id });
        break;
      case Core.StreamSource.REPLIES:
        nexusEndpoint = Core.postStreamApi[invokeEndpoint]({
          ...params,
          ...extraParams,
        } as Core.TStreamPostRepliesParams);
        break;
      case Core.StreamSource.AUTHOR:
      case Core.StreamSource.AUTHOR_REPLIES:
        nexusEndpoint = Core.postStreamApi[invokeEndpoint]({ ...params, ...extraParams } as Core.TStreamAuthorParams);
        break;
      default:
        throw new Error(`Invalid stream type: ${invokeEndpoint}`);
    }
    return (await Core.queryNexus<Core.NexusPost[]>(nexusEndpoint)) || [];
  }
}
