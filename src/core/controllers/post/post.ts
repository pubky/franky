import * as Core from '@/core';
import type { AddReplyParams, FetchPostsParams } from './post.types';

export class PostController {
  private static isInitialized = false;

  private constructor() {}

  /**
   * Initialize the controller
   */
  private static async initialize() {
    if (!this.isInitialized) {
      await Core.db.initialize();
      this.isInitialized = true;
    }
  }

  /**
   * Fetch posts with optional pagination
   * @param params - Parameters object
   * @param params.limit - Number of posts to fetch (default: 30)
   * @param params.offset - Number of posts to skip (default: 0)
   * @returns Array of NexusPost objects
   */
  static async fetch({ limit = 30, offset = 0 }: FetchPostsParams = {}): Promise<Core.NexusPost[]> {
    await this.initialize();
    return Core.Local.Post.fetch({ limit, offset });
  }

  /**
   * Add a reply to a post
   * @param params - Parameters object
   * @param params.parentPostId - ID of the post being replied to
   * @param params.content - Reply content
   * @param params.authorId - ID of the user creating the reply
   */
  static async addReply({ parentPostId, content, authorId }: AddReplyParams) {
    await this.initialize();

    const parentPost = await Core.PostDetailsModel.table.get(parentPostId);
    if (!parentPost) {
      throw new Error(`Parent post not found: ${parentPostId}`);
    }

    const normalizedPost = await Core.PostNormalizer.to(
      {
        content: content.trim(),
        kind: Core.PubkyAppPostKind.Short,
        parentUri: parentPost.uri,
      },
      authorId,
    );

    const replyId = `${authorId}:${normalizedPost.meta.id}`;

    const replyDetails: Core.PostDetailsModelSchema = {
      id: replyId,
      content: normalizedPost.post.content,
      indexed_at: Date.now(),
      kind: normalizedPost.post.kind === 'Short' ? 'short' : 'long',
      uri: normalizedPost.meta.url,
      attachments: normalizedPost.post.attachments || null,
    };

    await Core.Local.Post.reply({ parentPostId, replyDetails });
  }
}
