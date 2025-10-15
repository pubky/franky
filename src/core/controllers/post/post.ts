import * as Core from '@/core';
import * as Application from '@/core/application';
import * as Libs from '@/libs';

export class PostController {
  private constructor() {} // Prevent instantiation

  static async read({ postId }: { postId: string }) {
    return await Core.PostDetailsModel.findById(postId);
  }

  /**
   * Create a post (including replies)
   * @param params - Parameters object
   * @param params.parentPostId - ID of the post being replied to (optional for root posts)
   * @param params.content - Post content
   * @param params.authorId - ID of the user creating the post
   */
  static async create({ parentPostId, content, authorId }: Core.TCreatePostParams) {
    let parentUri: string | undefined = undefined;
    if (parentPostId) {
      const parentPost = await Core.PostDetailsModel.findById(parentPostId);
      if (!parentPost) {
        throw Libs.createSanitizationError(
          Libs.SanitizationErrorType.POST_NOT_FOUND,
          'Failed to validate parent post',
          404,
          {
            parentPostId,
          },
        );
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

    const postId = Core.buildPostCompositeId({ pubky: authorId, postId: normalizedPost.meta.id });

    await Application.PostApplication.create({
      postUrl: normalizedPost.meta.url,
      postJson: normalizedPost.post.toJson(),
      postId,
      content: normalizedPost.post.content,
      kind: Core.normalizePostKind(normalizedPost.post.kind) as Core.NexusPostKind,
      authorId,
      parentUri,
      attachments: normalizedPost.post.attachments ?? undefined,
    });
  }
}
