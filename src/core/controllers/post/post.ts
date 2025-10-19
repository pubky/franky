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
   * @param params.parentPostId - ID of the post being replied to (optional for root posts)
   * @param params.originalPostId - ID of the post being reposted (optional for reposts)
   * @param params.content - Post content (can be empty for simple reposts)
   * @param params.kind - Post kind (default: Short, automatically set to repost in storage if originalPostId is provided)
   * @param params.authorId - ID of the user creating the post
   */
  static async create({
    parentPostId,
    originalPostId,
    content,
    kind = Core.PubkyAppPostKind.Short,
    authorId,
  }: Core.TCreatePostParams) {
    let parentUri: string | undefined = undefined;
    let repostedUri: string | undefined = undefined;

    // Validate and set parent URI if this is a reply
    if (parentPostId) {
      parentUri = await Core.PostValidators.validatePostId({ postId: parentPostId, message: 'Parent post' });
    }

    // Validate and set reposted URI if this is a repost
    if (originalPostId) {
      repostedUri = await Core.PostValidators.validatePostId({ postId: originalPostId, message: 'Original post' });
    }

    const { post, meta } = await Core.PostNormalizer.to(
      {
        content: content.trim(),
        kind,
        parentUri,
        embed: repostedUri,
      },
      authorId,
    );

    await Core.PostApplication.create({
      postId: meta.id,
      authorId,
      post,
      postUrl: meta.url,
    });
  }

  /**
   * Delete a post
   * @param params - Parameters object
   * @param params.postId - ID of the post to delete
   * @param params.deleterId - ID of the user deleting the post
   */
  static async delete({ postId, deleterId }: Core.TDeletePostParams) {
    const { pubky: authorId } = Core.parsePostCompositeId(postId);

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
}
