import { TagResult, postUriBuilder, userUriBuilder } from 'pubky-app-specs';
import * as Core from '@/core';
import { Err, ValidationErrorCode, ErrorService, getErrorMessage, isAppError } from '@/libs';

export class TagNormalizer {
  private constructor() {}

  static from({ taggedKind, taggedId, label, taggerId }: Core.TTagEventParams): Core.TTagFromResponse {
    try {
      let uri: string;
      if (taggedKind === Core.TagKind.POST) {
        const { pubky, id: postId } = Core.parseCompositeId(taggedId);
        uri = postUriBuilder(pubky, postId);
      } else {
        uri = userUriBuilder(taggedId);
      }
      const { tag, meta } = Core.TagNormalizer.to(uri, label.trim(), taggerId);

      return {
        taggerId,
        taggedId,
        label: tag.label.toLowerCase(),
        taggedKind,
        tagUrl: meta.url,
        tagJson: tag.toJson(),
      };
    } catch (error) {
      if (isAppError(error)) {
        throw error;
      }
      throw Err.validation(ValidationErrorCode.INVALID_INPUT, getErrorMessage(error), {
        service: ErrorService.PubkyAppSpecs,
        operation: 'createTagFromParams',
        context: { taggedKind, taggedId, label, taggerId },
        cause: error,
      });
    }
  }

  static to(uri: string, label: string, pubky: Core.Pubky): TagResult {
    try {
      const builder = Core.PubkySpecsSingleton.get(pubky);
      return builder.createTag(uri, label);
    } catch (error) {
      if (isAppError(error)) {
        throw error;
      }
      throw Err.validation(ValidationErrorCode.INVALID_INPUT, getErrorMessage(error), {
        service: ErrorService.PubkyAppSpecs,
        operation: 'createTag',
        context: { uri, label, pubky },
        cause: error,
      });
    }
  }
}
