import { POST_INPUT_BUTTON_LABEL, POST_INPUT_VARIANT } from '../PostInput/PostInput.constants';
import type { PostInputVariant } from '../PostInput/PostInput.types';

/**
 * Returns the appropriate button label based on the variant.
 * @param variant - The current variant (post, reply, or repost)
 * @returns The capitalized label for the submit button
 */
export function getButtonLabel(variant?: PostInputVariant): string {
  if (!variant || !(variant in POST_INPUT_BUTTON_LABEL)) {
    return POST_INPUT_BUTTON_LABEL[POST_INPUT_VARIANT.POST];
  }
  return POST_INPUT_BUTTON_LABEL[variant];
}
