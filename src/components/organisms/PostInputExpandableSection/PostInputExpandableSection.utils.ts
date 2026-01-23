import { POST_INPUT_BUTTON_LABEL, POST_INPUT_VARIANT } from '../PostInput/PostInput.constants';
import type { PostInputVariant } from '../PostInput/PostInput.types';

/**
 * Returns the appropriate button label based on the variant.
 * @param variant - The current variant (post, reply, repost, or edit)
 * @param isArticle - Optional flag indicating article sub-mode of post or edit variant
 * @returns The capitalized label for the submit button
 */
export function getButtonLabel(variant?: PostInputVariant, isArticle?: boolean): string {
  if (isArticle && variant !== POST_INPUT_VARIANT.EDIT) {
    return 'Publish';
  }

  if (!variant || !(variant in POST_INPUT_BUTTON_LABEL)) {
    return POST_INPUT_BUTTON_LABEL[POST_INPUT_VARIANT.POST];
  }

  return POST_INPUT_BUTTON_LABEL[variant];
}
