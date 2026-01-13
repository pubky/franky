import { FeedbackValidators } from '@/core/pipes/feedback';
import { FeedbackApplication } from '@/core/application/feedback';
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
    const pubky = FeedbackValidators.validatePubky(params.pubky);
    const comment = FeedbackValidators.validateComment(params.comment);
    const name = FeedbackValidators.validateName(params.name);

    // Delegate to application layer
    await FeedbackApplication.submit({ pubky, comment, name });
  }
}
