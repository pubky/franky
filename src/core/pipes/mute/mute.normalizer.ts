import { MuteResult } from 'pubky-app-specs';
import * as Core from '@/core';
import { Err, ValidationErrorCode, ErrorService, getErrorMessage, isAppError } from '@/libs';

export class MuteNormalizer {
  private constructor() {}

  static to({ muter, mutee }: Core.TMuteParams): MuteResult {
    try {
      const builder = Core.PubkySpecsSingleton.get(muter);
      return builder.createMute(mutee);
    } catch (error) {
      if (isAppError(error)) {
        throw error;
      }
      throw Err.validation(ValidationErrorCode.INVALID_INPUT, getErrorMessage(error), {
        service: ErrorService.PubkyAppSpecs,
        operation: 'createMute',
        context: { muter, mutee },
        cause: error,
      });
    }
  }
}
