import * as Core from '@/core';
import * as Libs from '@/libs';

export class PostController {
  private constructor() {} // Prevent instantiation

  static async getPostDetails({ postId }: { postId: string }) {
    return await Core.PostDetailsModel.findById(postId);
  }

  /**
   * Get post counts for a specific post
   * @param params - Parameters object
   * @param params.postId - ID of the post to get counts for
   * @returns Post counts (with default values if not found)
   */
  static async getPostCounts({ postId }: { postId: string }) {
    // Calling local service directly to avoid unnecessary network calls
    // since we are not using the application layer for this operation
    return await Core.LocalPostService.getPostCounts(postId);
  }

  /**
   * Get or fetch a post - reads from local DB first, fetches from Nexus if not found
   * @param params - Parameters object
   * @param params.postId - ID of the post to get (format: "authorId:postId")
   * @returns Post details or null if not found
   */
  static async getOrFetchPost({ postId }: { postId: string }): Promise<Core.PostDetailsModelSchema | null> {
    try {
      return await Core.PostApplication.getOrFetchPost(postId);
    } catch (error) {
      Libs.Logger.error('Failed to get or fetch post', { postId, error });
      return null;
    }
  }

  /**
   * Get post tags for a specific post
   * @param params - Parameters object
   * @param params.postId - ID of the post to get tags for
   * @returns Post tags
   */
  static async getPostTags({ postId }: { postId: string }): Promise<Core.TagCollectionModelSchema<string>[]> {
    return await Core.LocalPostService.getPostTags(postId);
  }

  /**
   * Create a post (including replies and reposts)
   * @param params - Parameters object
   * @param params.authorId - ID of the user creating the post
   * @param params.content - Post content (can be empty for simple reposts)
   * @param params.kind - Post kind (default: Short, automatically set to repost in storage if originalPostId is provided)
   * @param params.tags - Tags to add to the post (optional)
   * @param params.attachments - Attachments to add to the post (optional)
   * @param params.parentPostId - ID of the post being replied to (optional for root posts)
   * @param params.originalPostId - ID of the post being reposted (optional for reposts)
   */
  static async create({
    authorId,
    content,
    kind = Core.PubkyAppPostKind.Short,
    tags,
    attachments,
    parentPostId,
    originalPostId,
  }: Core.TCreatePostParams) {
    let parentUri: string | undefined = undefined;
    let repostedUri: string | undefined = undefined;
    let tagList: Core.TCreateTagInput[] = [];

    // Validate and set parent URI if this is a reply
    if (parentPostId) {
      parentUri = await Core.PostValidators.validatePostId({ postId: parentPostId, message: 'Parent post' });
    }
    if (originalPostId) {
      repostedUri = await Core.PostValidators.validatePostId({ postId: originalPostId, message: 'Original post' });
    }

    // TODO: In the future, we could decouple that action and do it asyncronously in the moment that we add a file to the post
    const fileAttachments = attachments ? await this.normalizeFileAttachments({ attachments, pubky: authorId }) : [];

    const { post, meta } = await Core.PostNormalizer.to(
      {
        content: content.trim(),
        kind,
        parentUri,
        embed: repostedUri,
        attachments: fileAttachments,
      },
      authorId,
    );

    const { id: postId } = meta;

    if (tags) {
      const tagsMetadata = tags.map((tag) => {
        return {
          taggerId: authorId,
          taggedId: `${authorId}:${postId}`,
          label: tag,
          taggedKind: Core.TagKind.POST,
        };
      });
      tagList = this.normalizeTags({ tags: tagsMetadata });
    }

    const compositePostId = Core.buildCompositeId({ pubky: authorId, id: postId });

    await Core.PostApplication.create({
      compositePostId,
      post,
      postUrl: meta.url,
      fileAttachments,
      tags: tagList,
    });
  }

  /**
   * Delete a post
   * @param params - Parameters object
   * @param params.postId - ID of the post to delete
   */
  static async delete({ compositePostId }: Core.TDeletePostParams) {
    const { pubky: authorId, id: postId } = Core.parseCompositeId(compositePostId);
    const userId = Core.useAuthStore.getState().selectCurrentUserPubky();

    if (authorId !== userId) {
      throw Libs.createSanitizationError(
        Libs.SanitizationErrorType.POST_NOT_FOUND,
        'User is not the author of this post',
        403,
        {
          postId,
          userId,
        },
      );
    }

    await Core.PostApplication.delete({ compositePostId });
  }

  /**
   * Normalize file attachments
   * @param params - Parameters object
   * @param params.attachments - Attachments to normalize
   * @param params.pubky - Public key of the author
   * @returns Normalized file attachments
   */
  private static async normalizeFileAttachments({
    attachments,
    pubky,
  }: Core.TFileAttachmentsParams): Promise<Core.TFileAttachmentResult[]> {
    return await Promise.all(
      attachments.map(async (attachment) => {
        return await Core.FileNormalizer.toFileAttachment({ file: attachment, pubky });
      }),
    );
  }

  /**
   * Normalize tags
   * @param params - Parameters object
   * @param params.tags - Tags to normalize
   * @returns Normalized tags
   */
  private static normalizeTags({ tags }: Core.TNormalizeTagsParams): Core.TCreateTagInput[] {
    return tags.map((param: Core.TTagEventParams) => {
      return Core.TagNormalizer.from(param);
    });
  }
}
