import * as Core from '@/core';
import * as Libs from '@/libs';

export class PostController {
  private constructor() {} // Prevent instantiation

  static async read({ postId }: { postId: string }) {
    return await Core.PostDetailsModel.findById(postId);
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
    const fileAttachments = attachments ? await this.normalizeFileAttachments({ attachments, authorId }) : [];

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

    if (tags) {
      const tagsMetadata = tags.map((tag) => {
        return {
          taggerId: authorId,
          taggedId: `${authorId}:${meta.id}`,
          label: tag,
          taggedKind: Core.TagKind.POST,
        };
      });
      tagList = this.normalizeTags({ tags: tagsMetadata });
    }

    await Core.PostApplication.create({
      postId: meta.id,
      authorId,
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
   * @param params.deleterId - ID of the user deleting the post
   */
  static async delete({ postId, deleterId }: Core.TDeletePostParams) {
    const { pubky: authorId } = Core.parseCompositeId(postId);

    if (authorId !== deleterId) {
      throw Libs.createSanitizationError(
        Libs.SanitizationErrorType.POST_NOT_FOUND,
        'User is not the author of this post',
        403,
        {
          postId,
          deleterId,
        },
      );
    }

    await Core.PostApplication.delete({ postId, deleterId });
  }

  /**
   * Get post counts for a specific post
   * @param params - Parameters object
   * @param params.postId - ID of the post to get counts for
   * @returns Post counts (with default values if not found)
   */
  static async getPostCounts({ postId }: { postId: string }): Promise<Core.PostCountsModelSchema> {
    return await Core.LocalPostService.getPostCounts(postId);
  }

  private static async normalizeFileAttachments({
    attachments,
    authorId,
  }: {
    attachments: File[];
    authorId: Core.Pubky;
  }): Promise<Core.TFileAttachmentResult[]> {
    return await Promise.all(
      attachments.map(async (attachment) => {
        return await Core.FileNormalizer.toFileAttachment({ file: attachment, pubky: authorId });
      }),
    );
  }

  private static normalizeTags({ tags }: { tags: Core.TTagEventParams[] }): Core.TCreateTagInput[] {
    return tags.map((param: Core.TTagEventParams) => {
      return Core.TagNormalizer.from(param);
    });
  }
}
