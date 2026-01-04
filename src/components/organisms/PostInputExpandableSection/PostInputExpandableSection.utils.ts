import { POST_INPUT_ACTION_SUBMIT_MODE } from '../PostInputActionBar/PostInputActionBar.constants';
import type { PostInputActionSubmitMode } from '../PostInputActionBar/PostInputActionBar.types';

/**
 * Returns the appropriate button label based on the submit mode.
 * @param submitMode - The current submit mode (post, reply, or repost)
 * @returns The capitalized label for the submit button
 */
export function getButtonLabel(submitMode?: PostInputActionSubmitMode): string {
  switch (submitMode) {
    case POST_INPUT_ACTION_SUBMIT_MODE.REPLY:
      return 'Reply';
    case POST_INPUT_ACTION_SUBMIT_MODE.REPOST:
      return 'Repost';
    default:
      return 'Post';
  }
}
