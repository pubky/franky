import { createSanitizationError, SanitizationErrorType } from '@/libs/error';
import * as Core from '@/core';

export type TValidatePostIdParams = {
  postId: string;
  message: string;
};

export class PostValidators {
  constructor() {}

  static async validatePostId({ postId, message }: TValidatePostIdParams): Promise<string> {
    const parentPost = await Core.PostController.getPostDetails({ compositeId: postId });
    if (!parentPost) {
      throw createSanitizationError(SanitizationErrorType.POST_NOT_FOUND, `${message} not found`, 404, {
        postId,
      });
    }
    return parentPost.uri;
  }
}
