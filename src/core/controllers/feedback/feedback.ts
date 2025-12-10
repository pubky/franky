import * as Core from '@/core';
import * as Config from '@/config';
import * as Types from './feedback.types';

export class FeedbackController {
  private constructor() {}

  /**
   * Submit feedback to Chatwoot
   *
   * Validates input parameters and delegates to the application layer.
   * This method is called from the API route handler which runs on the server.
   *
   * @param params - Parameters object
   * @param params.pubky - User's public key
   * @param params.comment - Feedback comment (max length defined in FEEDBACK_MAX_CHARACTER_LENGTH config)
   * @throws Error if validation fails
   */
  static async submit(params: Types.TFeedbackSubmitParams): Promise<void> {
    const { pubky, comment } = params;

    // Validate pubky
    if (!pubky || pubky.trim() === '') {
      throw new Error('Pubky is required and must be a non-empty string');
    }

    // Validate comment
    if (!comment || comment.trim() === '') {
      throw new Error('Comment is required and must be a non-empty string');
    }

    if (comment.length > Config.FEEDBACK_MAX_CHARACTER_LENGTH) {
      throw new Error(`Comment must be at most ${Config.FEEDBACK_MAX_CHARACTER_LENGTH} characters`);
    }

    // Delegate to application layer
    await Core.FeedbackApplication.submit({ pubky, comment });
  }
}
