import * as Core from '@/core';

export class PostController {
  private static isInitialized = false;

  private constructor() {}

  /**
   * Initialize the controller
   */
  private static async initialize(): Promise<void> {
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
  static async fetch({ limit = 30, offset = 0 }: { limit?: number; offset?: number } = {}): Promise<Core.NexusPost[]> {
    await this.initialize();
    return Core.Local.Post.fetch({ limit, offset });
  }

  /**
   * Get a specific post by ID
   * @param params - Parameters object
   * @param params.id - Post ID to find
   * @returns NexusPost if found, null otherwise
   */
  static async findById({ id }: { id: string }): Promise<Core.NexusPost | null> {
    await this.initialize();
    return Core.Local.Post.findById({ id });
  }

  /**
   * Get total count of posts
   * @returns Total number of posts
   */
  static async count(): Promise<number> {
    await this.initialize();
    return Core.Local.Post.count();
  }

  /**
   * Get reply IDs for a specific post
   * @param params - Parameters object
   * @param params.postId - ID of the post to get reply IDs for
   * @returns Array of reply post IDs
   */
  static async getReplyIds({ postId }: { postId: string }): Promise<string[]> {
    await this.initialize();
    return Core.Local.Post.replyIds({ postId });
  }

  /**
   * Get replies to a specific post
   * @param params - Parameters object
   * @param params.postId - ID of the post to get replies for
   * @returns Array of NexusPost objects that are replies to the given post
   */
  static async getReplies({ postId }: { postId: string }): Promise<Core.NexusPost[]> {
    await this.initialize();
    return Core.Local.Post.replies({ postId });
  }

  /**
   * Add a reply to a post
   * @param params - Parameters object
   * @param params.parentPostId - ID of the post being replied to
   * @param params.content - Reply content
   * @param params.authorId - ID of the user creating the reply
   * @returns The created reply post or null if failed
   */
  static async addReply({
    parentPostId,
    content,
    authorId,
  }: {
    parentPostId: string;
    content: string;
    authorId: Core.Pubky;
  }): Promise<Core.NexusPost | null> {
    await this.initialize();

    const normalizedPost = await Core.PostNormalizer.to(
      {
        content: content.trim(),
        indexed_at: Date.now(),
        author: authorId,
        kind: 'short',
        attachments: null,
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

    return Core.Local.Post.reply({ parentPostId, replyDetails });
  }
}
