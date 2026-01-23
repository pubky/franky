import * as Core from '@/core';
import * as Types from './feedback.types';

/**
 * Controller for feedback submission.
 * Entry point for the feedback feature, called from the API route.
 */
export class FeedbackController {
  private constructor() {}

  /**
   * Submit feedback to Chatwoot.
   *
   * Validates all inputs via pipes layer before delegating to application.
   *
   * @param params.pubky - User's public key
   * @param params.comment - Feedback comment text
   * @param params.name - User's display name
   * @throws AppError if validation fails or submission fails
   */
  static async submit(params: Types.TFeedbackSubmitParams): Promise<void> {
    // Validate and normalize inputs using pipes layer
    const pubky = Core.FeedbackValidators.validatePubky(params.pubky);
    const comment = Core.FeedbackValidators.validateComment(params.comment);
    const name = Core.FeedbackValidators.validateName(params.name);

    await Core.FeedbackApplication.submit({ pubky, comment, name });
  }
}
