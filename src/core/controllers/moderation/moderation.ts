import * as Core from '@/core';

export class ModerationController {
  private constructor() {}

  static async setPostBlur({ postId, blur }: { postId: string; blur: boolean }): Promise<void> {
    return Core.ModerationApplication.setBlur(postId, blur);
  }

  static async enrichPost({ post }: { post: Core.PostDetailsModelSchema }): Promise<Core.EnrichedPostDetails> {
    return Core.ModerationApplication.enrichPostWithModeration(post);
  }

  static async enrichPosts({ posts }: { posts: Core.PostDetailsModelSchema[] }): Promise<Core.EnrichedPostDetails[]> {
    return Core.ModerationApplication.enrichPostsWithModeration(posts);
  }

  static async getModerationState({ postId }: { postId: string }): Promise<Core.ModerationState> {
    return Core.ModerationApplication.getModerationState(postId);
  }
}
