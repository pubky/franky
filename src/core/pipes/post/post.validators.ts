import { Err, ErrorService, ClientErrorCode } from '@/libs/error';
import * as Core from '@/core';

export type TValidatePostIdParams = {
  postId: string;
  message: string;
};

export class PostValidators {
  constructor() {}

  static async validatePostId({ postId, message }: TValidatePostIdParams): Promise<string> {
    const parentPost = await Core.PostController.getDetails({ compositeId: postId });
    if (!parentPost) {
      throw Err.client(ClientErrorCode.NOT_FOUND, `${message} not found`, {
        service: ErrorService.Local,
        operation: 'validatePostId',
        context: { postId },
      });
    }
    return parentPost.uri;
  }
}
