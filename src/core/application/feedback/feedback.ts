import * as Core from '@/core';
import * as Libs from '@/libs';
import { CHATWOOT_INBOX_IDS, CHATWOOT_FEEDBACK_MESSAGE_PREFIX } from '@/core/services/chatwoot';
import * as Types from './feedback.types';

/**
 * Feedback application service.
 *
 * Orchestrates feedback submission workflow:
 * 1. Builds email from pubky
 * 2. Determines inbox ID for feedback
 * 3. Formats message with feedback prefix
 * 4. Calls Chatwoot service to create contact and conversation
 * 5. Logs errors for observability
 *
 * This layer is called by the controller and handles cross-domain orchestration.
 */
export class FeedbackApplication {
  private constructor() {}

  /**
   * Build email address from pubky
   *
   * @param pubky - User's public key
   * @returns Email address in format pubky@pubky.app
   */
  private static buildEmail(pubky: Core.Pubky): string {
    return `${pubky}@pubky.app`;
  }

  /**
   * Format the full message content with feedback prefix
   *
   * @param comment - User's feedback comment
   * @returns Full formatted message content
   */
  private static formatMessageContent(comment: string): string {
    return `${CHATWOOT_FEEDBACK_MESSAGE_PREFIX}\n\n${comment}`;
  }

  /**
   * Submit feedback to Chatwoot
   *
   * Orchestrates the feedback submission by:
   * 1. Building email from pubky
   * 2. Creating or finding contact in Chatwoot
   * 3. Creating conversation with formatted message
   *
   * @param params - Parameters object
   * @param params.pubky - User's public key
   * @param params.comment - Feedback comment
   * @param params.name - User's display name
   * @throws AppError if submission fails
   */
  static async submit({ pubky, comment, name }: Types.TFeedbackSubmitInput) {
    try {
      // Build email from pubky
      const email = this.buildEmail(pubky);

      // Get inbox ID for feedback
      const inboxId = CHATWOOT_INBOX_IDS.FEEDBACK;

      // Format message with prefix
      const content = this.formatMessageContent(comment);

      // Create or find contact in Chatwoot
      const contact = await Core.ChatwootService.createOrFindContact(email, name, inboxId);

      // Validate contact has inbox associations
      if (!contact.contact_inboxes || contact.contact_inboxes.length === 0) {
        throw Libs.createCommonError(Libs.CommonErrorType.UNEXPECTED_ERROR, 'Contact has no inbox associations', 500, {
          contactId: contact.id,
          email,
        });
      }

      const sourceId = contact.contact_inboxes[0].source_id;

      // Create conversation with formatted message
      await Core.ChatwootService.createConversation(sourceId, contact.id, inboxId, content);
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
