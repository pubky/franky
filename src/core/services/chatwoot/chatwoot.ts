import * as Libs from '@/libs';
import * as Types from './chatwoot.types';
import { ChatwootApi, type TChatwootApiConfig } from './chatwoot.api';

const FEEDBACK_MESSAGE_PREFIX = 'Feedback';

/**
 * Chatwoot service for handling feedback submissions.
 *
 * This service interacts with the Chatwoot API to:
 * 1. Create or find existing contact by email
 * 2. Create a conversation with the feedback message
 *
 * This service runs on the server and requires server-side environment variables:
 * - BASE_URL_SUPPORT
 * - SUPPORT_API_ACCESS_TOKEN
 * - SUPPORT_ACCOUNT_ID
 * - SUPPORT_FEEDBACK_INBOX_ID
 */
export class ChatwootService {
  private constructor() {}

  /**
   * Get Chatwoot configuration from environment variables
   *
   * Validates that all required environment variables are present.
   * Uses the validated Env object from the env module for type safety.
   *
   * @returns Configuration object with baseUrl, accountId, and headers
   * @throws AppError if required environment variables are missing
   */
  private static getConfig(): TChatwootApiConfig & { inboxId: number } {
    const baseUrl = Libs.Env.BASE_URL_SUPPORT;
    const apiAccessToken = Libs.Env.SUPPORT_API_ACCESS_TOKEN;
    const accountId = Libs.Env.SUPPORT_ACCOUNT_ID;
    const inboxId = Libs.Env.SUPPORT_FEEDBACK_INBOX_ID;

    if (!baseUrl || !apiAccessToken || !accountId || !inboxId) {
      throw Libs.createCommonError(
        Libs.CommonErrorType.ENV_MISSING_REQUIRED,
        'Missing required Chatwoot environment variables',
        500,
        {
          missing: {
            baseUrl: !baseUrl,
            apiAccessToken: !apiAccessToken,
            accountId: !accountId,
            inboxId: !inboxId,
          },
        },
      );
    }

    return {
      baseUrl,
      accountId,
      inboxId,
      headers: {
        api_access_token: apiAccessToken,
        'Content-Type': 'application/json; charset=utf-8',
      },
    };
  }

  /**
   * Create or find existing contact in Chatwoot
   *
   * Searches for an existing contact by email. If found, returns it.
   * Otherwise, creates a new contact with the provided email and name.
   *
   * @param email - Contact email address
   * @param name - Contact display name
   * @returns Chatwoot contact object
   * @throws AppError if API calls fail
   */
  private static async createContactIfNotExists(email: string, name: string): Promise<Types.TChatwootContact> {
    const config = this.getConfig();

    // Search for existing contact
    const searchData = await ChatwootApi.searchContact(config, email);
    const existingContact = searchData.payload?.find(
      (c) => c.email?.toLowerCase().trim() === email.toLowerCase().trim(),
    );

    if (existingContact) {
      return existingContact;
    }

    // Create new contact if not found
    return ChatwootApi.createContact(config, {
      inboxId: config.inboxId,
      name,
      email,
    });
  }

  /**
   * Create a conversation in Chatwoot
   *
   * Creates a new conversation with the feedback message.
   * The message is prefixed with FEEDBACK_MESSAGE_PREFIX.
   *
   * @param sourceId - Source ID from contact's inbox association
   * @param contactId - Contact ID
   * @param message - Feedback message content
   * @throws AppError if API call fails
   */
  private static async createConversation(sourceId: string, contactId: number, message: string): Promise<void> {
    const config = this.getConfig();
    const content = `${FEEDBACK_MESSAGE_PREFIX}\n\n${message}`;

    await ChatwootApi.createConversation(config, {
      sourceId,
      inboxId: config.inboxId,
      contactId,
      content,
    });
  }

  /**
   * Submit feedback to Chatwoot
   *
   * Orchestrates the feedback submission by:
   * 1. Building email from pubky
   * 2. Creating or finding contact
   * 3. Creating conversation with feedback message
   *
   * @param params - Parameters object
   * @param params.pubky - User's public key
   * @param params.comment - Feedback comment
   * @param params.name - User's display name
   * @throws AppError if any step fails
   */
  static async submit(params: Types.TChatwootSubmitInput): Promise<void> {
    const { pubky, comment, name } = params;

    // Build email from pubky
    const email = `${pubky}@pubky.app`;

    // Create or find contact
    const contact = await this.createContactIfNotExists(email, name);

    if (!contact.contact_inboxes || contact.contact_inboxes.length === 0) {
      throw Libs.createCommonError(Libs.CommonErrorType.UNEXPECTED_ERROR, 'Contact has no inbox associations', 500, {
        contactId: contact.id,
      });
    }

    const sourceId = contact.contact_inboxes[0].source_id;

    // Create conversation
    await this.createConversation(sourceId, contact.id, comment);
  }
}
