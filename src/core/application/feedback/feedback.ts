import * as Core from '@/core';
import * as Libs from '@/libs';
import * as Types from './feedback.types';

/**
 * Feedback application service.
 *
 * Orchestrates feedback submission workflow:
 * 1. Fetches user profile to get display name (falls back to pubky if unavailable)
 * 2. Calls Chatwoot service to submit feedback
 * 3. Logs errors for observability
 *
 * This layer is called by the controller and handles cross-domain orchestration.
 */
export class FeedbackApplication {
  private constructor() {}

  /**
   * Submit feedback to Chatwoot
   *
   * Orchestrates the feedback submission by fetching user details
   * and delegating to the Chatwoot service.
   *
   * @param params - Parameters object
   * @param params.pubky - User's public key
   * @param params.comment - Feedback comment
   * @throws AppError if submission fails
   */
  static async submit(params: Types.TFeedbackSubmitInput): Promise<void> {
    try {
      const { pubky, comment } = params;

      // Get user profile to retrieve display name
      let name: string | undefined;
      try {
        const userDetails = await Core.ProfileController.read({ userId: pubky });
        name = userDetails?.name;
      } catch (error) {
        // If profile read fails, log but continue with pubky as fallback
        Libs.Logger.warn('Failed to fetch user profile for feedback', { pubky, error });
      }

      // Use pubky as fallback if name is not available
      const displayName = name || pubky;

      // Delegate to Chatwoot service
      await Core.ChatwootService.submit({
        pubky,
        comment,
        name: displayName,
      });
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
