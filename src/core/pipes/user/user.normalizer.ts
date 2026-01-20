import { UserResult } from 'pubky-app-specs';
import * as Core from '@/core';
import { Err, ValidationErrorCode, ErrorService, getErrorMessage, isAppError } from '@/libs';

export type UiLink = { label: string; url: string };

export class UserNormalizer {
  private constructor() {}

  /**
   * Converts UI link format ({ label, url }) to API format ({ title, url })
   * Used when transforming user input before sending to homeserver
   */
  static linksFromUi(uiLinks: UiLink[] | undefined | null): Core.NexusUserLink[] {
    return (uiLinks ?? []).map((link) => ({ title: link.label, url: link.url }));
  }

  static to(user: Core.UserValidatorData, pubky: Core.Pubky): UserResult {
    try {
      const builder = Core.PubkySpecsSingleton.get(pubky);
      return builder.createUser(user.name, user.bio, user.image, user.links, user.status || undefined);
    } catch (error) {
      if (isAppError(error)) {
        throw error;
      }
      throw Err.validation(ValidationErrorCode.INVALID_INPUT, getErrorMessage(error), {
        service: ErrorService.PubkyAppSpecs,
        operation: 'createUser',
        context: { user, pubky },
        cause: error,
      });
    }
  }
}
