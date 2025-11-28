import * as Core from '@/core';
import * as Libs from '@/libs';

export class NexusPostService {
  private constructor() {}

  /**
   * Fetches a single post with all related data from Nexus
   *
   * @param compositeId - Composite post ID in format "authorId:postId"
   * @returns Complete post view (details, tags, counts, relationships) or null if not found
   */
  static async getPost({ compositeId }: Core.TCompositeId): Promise<Core.NexusPost | null> {
    try {
      const { pubky: author_id, id: post_id } = Core.parseCompositeId(compositeId);

      const url = Core.postApi.view({ author_id, post_id });
      return (await Core.queryNexus<Core.NexusPost>(url)) ?? null;
    } catch (error: unknown) {
      // If it's a 404, return null (post doesn't exist)
      if (Libs.isAppError(error) && error.statusCode === 404) {
        Libs.Logger.debug(`Post not found: ${compositeId}`);
        return null;
      }
      // Re-throw other errors (including invalid composite ID)
      throw error;
    }
  }

  /**
   * Fetches tags for a post from Nexus API
   * @param compositeId - Composite post ID in format "authorId:postId"
   * @returns An array of tags (empty array if post has no tags or is not found)
   */
  static async getPostTags({ compositeId }: Core.TCompositeId): Promise<Core.NexusTag[]> {
    try {
      const { pubky: author_id, id: post_id } = Core.parseCompositeId(compositeId);

      const url = Core.postApi.tags({ author_id, post_id });
      return (await Core.queryNexus<Core.NexusTag[]>(url)) ?? [];
    } catch (error) {
      // 404 means the post has no tags, which is a valid state
      if (Libs.isAppError(error) && error.statusCode === 404) {
        Libs.Logger.debug(`No tags found for post ${compositeId} (404 - this is expected for posts without tags)`);
        return [];
      }
      // Re-throw other errors (network issues, 500s, etc.)
      throw error;
    }
  }
}
