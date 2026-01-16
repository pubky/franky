import * as Core from '@/core';
import * as Libs from '@/libs';
import { CHATWOOT_INBOX_IDS, extractSourceId } from '@/core/services/chatwoot';
import * as Types from './copyright.types';

/**
 * Copyright application service.
 *
 * Orchestrates copyright/DMCA takedown request submission workflow:
 * 1. Uses email from form data (not built from pubky)
 * 2. Determines inbox ID for copyright submissions (28)
 * 3. Formats message with source label and form data as JSON
 * 4. Calls Chatwoot service to create contact and conversation
 * 5. Logs errors for observability
 *
 * This layer is called by the controller and handles cross-domain orchestration.
 */
export class CopyrightApplication {
  private constructor() {}

  /**
   * Source label for copyright submissions
   */
  private static readonly COPYRIGHT_SOURCE_LABEL = 'Copyright Removal Request';

  /**
   * Format form data as JSON string for message body
   *
   * @param formData - Copyright form data
   * @returns JSON string representation of form data
   */
  private static formatFormData(formData: Types.TCopyrightSubmitInput): string {
    return JSON.stringify(formData, null, 2);
  }

  /**
   * Format the full message content with source label prefix
   *
   * @param formDataJson - Form data as JSON string
   * @returns Full formatted message content
   */
  private static formatMessageContent(formDataJson: string): string {
    return `${this.COPYRIGHT_SOURCE_LABEL}\n\n${formDataJson}`;
  }

  /**
   * Submit a copyright/DMCA takedown request to Chatwoot
   *
   * Orchestrates the copyright submission by:
   * 1. Using email from form data
   * 2. Building source label and formatting form data as JSON
   * 3. Creating or finding contact in Chatwoot
   * 4. Creating conversation with formatted message
   *
   * @param params - Parameters object with all copyright form fields
   * @throws AppError if submission fails
   */
  static async submit(params: Types.TCopyrightSubmitInput): Promise<void> {
    try {
      // Use email from form data
      const email = params.email;

      // Get inbox ID for copyright submissions
      const inboxId = CHATWOOT_INBOX_IDS.COPYRIGHT;

      // Build name from first and last name
      const name = `${params.firstName} ${params.lastName}`.trim();

      // Format form data as JSON
      const formDataJson = this.formatFormData(params);
      const content = this.formatMessageContent(formDataJson);

      // Create or find contact in Chatwoot
      const contact = await Core.ChatwootService.createOrFindContact(email, name, inboxId);

      // Extract source ID (validates inbox associations)
      const sourceId = extractSourceId(contact, email);

      // Create conversation with formatted message
      await Core.ChatwootService.createConversation(sourceId, contact.id, inboxId, content);
    } catch (error) {
      // Log error for observability
      if (error instanceof Libs.AppError) {
        Libs.Logger.error('Copyright submission failed', {
          type: error.type,
          statusCode: error.statusCode,
          details: error.details,
        });
        // Re-throw AppError to preserve error context
        throw error;
      }

      // Wrap unexpected errors
      Libs.Logger.error('Unexpected error during copyright submission', { error });
      throw Libs.createCommonError(Libs.CommonErrorType.UNEXPECTED_ERROR, 'Failed to submit copyright request', 500, {
        error,
      });
    }
  }
}
