import { POST_INPUT_BUTTON_LABEL, POST_INPUT_VARIANT } from '../PostInput/PostInput.constants';
import type { PostInputVariant } from '../PostInput/PostInput.types';

/**
 * Returns the appropriate button label based on the variant.
 * @param variant - The current variant (post, reply, or repost)
 * @param isArticle - Optional flag indicating article sub-mode of post variant
 * @returns The capitalized label for the submit button
 */
export function getButtonLabel(variant?: PostInputVariant, isArticle?: boolean): string {
  if (isArticle) {
    return 'Publish';
  }

  if (!variant || !(variant in POST_INPUT_BUTTON_LABEL)) {
    return POST_INPUT_BUTTON_LABEL[POST_INPUT_VARIANT.POST];
  }

  return POST_INPUT_BUTTON_LABEL[variant];
}
