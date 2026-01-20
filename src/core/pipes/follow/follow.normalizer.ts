import { FollowResult } from 'pubky-app-specs';
import * as Core from '@/core';
import { Err, ValidationErrorCode, ErrorService, getErrorMessage, isAppError } from '@/libs';

export class FollowNormalizer {
  private constructor() {}

  static to({ follower, followee }: Core.TFollowParams): FollowResult {
    try {
      const builder = Core.PubkySpecsSingleton.get(follower);
      const result = builder.createFollow(followee);
      return result;
    } catch (error) {
      if (isAppError(error)) {
        throw error;
      }
      throw Err.validation(ValidationErrorCode.INVALID_INPUT, getErrorMessage(error), {
        service: ErrorService.PubkyAppSpecs,
        operation: 'createFollow',
        context: { follower, followee },
        cause: error,
      });
    }
  }
}
