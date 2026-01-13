import { ChatwootService } from '@/core/services/chatwoot';
import * as Libs from '@/libs';
import * as Types from './feedback.types';

/**
 * Feedback application service.
 *
 * Orchestrates feedback submission workflow:
 * 1. Calls Chatwoot service to submit feedback
 * 2. Logs errors for observability
 *
 * This layer is called by the controller and handles cross-domain orchestration.
 */
export class FeedbackApplication {
  private constructor() {}

  /**
   * Submit feedback to Chatwoot
   *
   * Orchestrates the feedback submission by delegating to the Chatwoot service.
   *
   * @param params - Parameters object
   * @param params.pubky - User's public key
   * @param params.comment - Feedback comment
   * @param params.name - User's display name
   * @throws AppError if submission fails
   */
  static async submit({ pubky, comment, name }: Types.TFeedbackSubmitInput) {
    try {
      // Delegate to Chatwoot service
      await ChatwootService.submit({ pubky, comment, name });
    } catch (error) {
      // Log error for observability
      if (error instanceof Libs.AppError) {
        Libs.Logger.error('Feedback submission failed', {
          type: error.type,
          statusCode: error.statusCode,
          details: error.details,
        });
        // Re-throw AppError to preserve error context
        throw error;
      }

      // Wrap unexpected errors
      Libs.Logger.error('Unexpected error during feedback submission', { error });
      throw Libs.createCommonError(Libs.CommonErrorType.UNEXPECTED_ERROR, 'Failed to submit feedback', 500, { error });
    }
  }
}
