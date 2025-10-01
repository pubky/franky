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
   * @param limit - Number of posts to fetch (default: 30)
   * @param offset - Number of posts to skip (default: 0)
   * @returns Array of NexusPost objects
   */
  static async fetch(limit: number = 30, offset: number = 0): Promise<Core.NexusPost[]> {
    await this.initialize();
    return Core.LocalDb.Post.fetch({ limit, offset });
  }

  /**
   * Get a specific post by ID
   * @param id - Post ID to find
   * @returns NexusPost if found, null otherwise
   */
  static async findById(id: string): Promise<Core.NexusPost | null> {
    await this.initialize();
    return Core.LocalDb.Post.findById({ id });
  }

  /**
   * Get total count of posts
   * @returns Total number of posts
   */
  static async count(): Promise<number> {
    await this.initialize();
    return Core.LocalDb.Post.count();
  }

  /**
   * Get reply IDs for a specific post
   * @param postId - ID of the post to get reply IDs for
   * @returns Array of reply post IDs
   */
  static async getReplyIds(postId: string): Promise<string[]> {
    await this.initialize();
    return Core.LocalDb.Post.replyIds({ postId });
  }

  /**
   * Get replies to a specific post
   * @param postId - ID of the post to get replies for
   * @returns Array of NexusPost objects that are replies to the given post
   */
  static async getReplies(postId: string): Promise<Core.NexusPost[]> {
    await this.initialize();
    return Core.LocalDb.Post.replies({ postId });
  }

  /**
   * Add a reply to a post
   * @param parentPostId - ID of the post being replied to
   * @param content - Reply content
   * @param authorId - ID of the user creating the reply
   * @returns The created reply post or null if failed
   */
  static async addReply(parentPostId: string, content: string, authorId: Core.Pubky): Promise<Core.NexusPost | null> {
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

    return Core.LocalDb.Post.reply({ parentPostId, replyDetails });
  }
}
