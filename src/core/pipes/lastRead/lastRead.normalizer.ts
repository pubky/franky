import { LastReadResult } from 'pubky-app-specs';
import * as Core from '@/core';
import { Err, ValidationErrorCode, ErrorService, getErrorMessage, isAppError } from '@/libs';

export class LastReadNormalizer {
  private constructor() {}

  static to(pubky: Core.Pubky): LastReadResult {
    try {
      const builder = Core.PubkySpecsSingleton.get(pubky);
      return builder.createLastRead();
    } catch (error) {
      if (isAppError(error)) {
        throw error;
      }
      throw Err.validation(ValidationErrorCode.INVALID_INPUT, getErrorMessage(error), {
        service: ErrorService.PubkyAppSpecs,
        operation: 'createLastRead',
        context: { pubky },
        cause: error,
      });
    }
  }
}
