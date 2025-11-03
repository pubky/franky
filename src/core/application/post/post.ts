import * as Core from '@/core';
import * as Libs from '@/libs';

export class PostApplication {
  private constructor() {} // Prevent instantiation

  static async create({ postUrl, postId, authorId, post }: Core.TCreatePostInput) {
    await Core.LocalPostService.create({ postId, authorId, post });
    await Core.HomeserverService.request(Core.HomeserverAction.PUT, postUrl, post.toJson());
  }

  static async delete({ postId, deleterId }: Core.TDeletePostParams) {
    // Confirm the user is the author of the post
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

    const post = await Core.PostDetailsModel.findById(postId);

    if (!post) {
      throw Libs.createSanitizationError(Libs.SanitizationErrorType.POST_NOT_FOUND, 'Post not found', 404, { postId });
    }
    await Core.LocalPostService.delete({ postId, deleterId });

    const postUrl = post.uri;
    await Core.HomeserverService.request(Core.HomeserverAction.DELETE, postUrl);
  }
}
