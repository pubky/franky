import { LastReadResult } from 'pubky-app-specs';
import * as Core from '@/core';
import { Err, ValidationErrorCode, ErrorService } from '@/libs';

export class LastReadNormalizer {
  private constructor() {}

  static to(pubky: Core.Pubky): LastReadResult {
    try {
      const builder = Core.PubkySpecsSingleton.get(pubky);
      return builder.createLastRead();
    } catch (error) {
      throw Err.validation(ValidationErrorCode.INVALID_INPUT, error as string, {
        service: ErrorService.PubkyAppSpecs,
        operation: 'createLastRead',
        context: { pubky },
      });
    }
  }
}
