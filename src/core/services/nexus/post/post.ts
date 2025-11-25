import * as Core from '@/core';
import * as Libs from '@/libs';

export class NexusPostService {
  private constructor() {}

  /**
   * Fetches tags for a post from Nexus API
   * @param authorId - The author ID of the post
   * @param postId - The ID of the post
   * @returns An array of tags (empty array if post has no tags or is not found)
   */
  static async getPostTags({ authorId, postId }: { authorId: Core.Pubky; postId: string }): Promise<Core.NexusTag[]> {
    try {
      const url = Core.postApi.tags({ author_id: authorId, post_id: postId });
      const tagList = await Core.queryNexus<Core.NexusTag[]>(url);
      Libs.Logger.debug(`Post tags fetched successfully! Returned ${tagList?.length} tags`);
      return tagList ?? [];
    } catch (error) {
      // 404 means the post has no tags, which is a valid state
      if (Libs.isAppError(error) && error.statusCode === 404) {
        Libs.Logger.debug(`No tags found for post ${postId} (404 - this is expected for posts without tags)`);
        return [];
      }
      // Re-throw other errors (network issues, 500s, etc.)
      throw error;
    }
  }
}
