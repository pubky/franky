import * as Core from '@/core';
import * as Application from '@/core/application';
import type { TCreatePostParams, TReadPostsParams } from './post.types';

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
   * Read posts with optional pagination
   * @param params - Parameters object
   * @param params.limit - Number of posts to fetch (default: 30)
   * @param params.offset - Number of posts to skip (default: 0)
   * @returns Array of NexusPost objects
   */
  static async read({ limit = 30, offset = 0 }: TReadPostsParams = {}): Promise<Core.NexusPost[]> {
    await this.initialize();
    return Core.Local.Post.fetch({ limit, offset });
  }

  /**
   * Create a post (including replies)
   * @param params - Parameters object
   * @param params.parentPostId - ID of the post being replied to (optional for root posts)
   * @param params.content - Post content
   * @param params.authorId - ID of the user creating the post
   */
  static async create({ parentPostId, content, authorId }: TCreatePostParams) {
    await this.initialize();

    let parentUri: string | undefined = undefined;
    if (parentPostId) {
      const parentPost = await Core.PostDetailsModel.findById(parentPostId);
      if (!parentPost) {
        throw new Error(`Parent post not found: ${parentPostId}`);
      }
      parentUri = parentPost.uri;
    }

    const normalizedPost = await Core.PostNormalizer.to(
      {
        content: content.trim(),
        kind: Core.PubkyAppPostKind.Short,
        parentUri,
      },
      authorId,
    );

    const postId = `${authorId}:${normalizedPost.meta.id}`;

    await Application.Post.create({
      postId,
      content: normalizedPost.post.content,
      kind: normalizedPost.post.kind === 'Short' ? 'short' : 'long',
      authorId,
      postUrl: normalizedPost.meta.url,
      postJson: normalizedPost.post.toJson(),
      parentUri,
      attachments: normalizedPost.post.attachments,
    });
  }
}
