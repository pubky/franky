import * as Core from '@/core';

export class NexusPostService {
  private constructor() {}

  /**
   * Fetches a single post with all related data from Nexus
   *
   * @param compositeId - Composite post ID in format "authorId:postId"
   * @returns Complete post view (details, tags, counts, relationships) or null if not found
   */
  static async getPost({ compositeId }: Core.TCompositeId): Promise<Core.NexusPost> {
    // TODO: Handle the error in application layer
    const { pubky: author_id, id: post_id } = Core.parseCompositeId(compositeId);

    const url = Core.postApi.view({ author_id, post_id });
    return await Core.queryNexus<Core.NexusPost>(url);
  }

  /**
   * Fetches tags for a post from Nexus API
   * @param compositeId - Composite post ID in format "authorId:postId"
   * @param skip - Number of tags to skip (for pagination)
   * @param limit - Maximum number of tags to return
   * @returns An array of tags (empty array if post has no tags or is not found)
   */
  static async getPostTags({ compositeId }: Core.TCompositeId): Promise<Core.NexusTag[]> {
    // TODO: Handle the error in application layer
    const { pubky: author_id, id: post_id } = Core.parseCompositeId(compositeId);

    const url = Core.postApi.tags({ author_id, post_id });
    return await Core.queryNexus<Core.NexusTag[]>(url);
  }
}
