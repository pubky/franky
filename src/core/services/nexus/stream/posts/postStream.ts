import * as Core from '@/core';
import * as Libs from '@/libs';

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
  static async fetch({
    params,
    invokeEndpoint,
    extraParams,
  }: Core.TPostStreamFetchParams): Promise<Core.NexusPostsKeyStream | undefined> {
    let nexusEndpoint: string;
    switch (invokeEndpoint) {
      case Core.StreamSource.ALL:
        nexusEndpoint = Core.postStreamApi.all(params);
        break;
      case Core.StreamSource.FOLLOWING:
      case Core.StreamSource.FRIENDS:
      case Core.StreamSource.BOOKMARKS:
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
    return await Core.queryNexus<Core.NexusPostsKeyStream>(nexusEndpoint);
  }

  /**
   * Fetches a single post with all related data from Nexus
   *
   * @param params - Author and post IDs
   * @returns Complete post data or null if not found
   */
  static async getPost({ authorId, postId }: { authorId: Core.Pubky; postId: string }): Promise<Core.NexusPost | null> {
    try {
      const url = Core.postApi.view({ author_id: authorId, post_id: postId });
      const postData = await Core.queryNexus<Core.NexusPost>(url);
      return postData ?? null;
    } catch (error: unknown) {
      // If it's a 404, return null (post doesn't exist)
      if (Libs.isAppError(error) && error.statusCode === 404) {
        return null;
      }
      // Re-throw other errors
      throw error;
    }
  }
}
