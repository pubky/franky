import * as Libs from '@/libs';
import * as Types from './chatwoot.types';
import { ChatwootApi, type TChatwootApiConfig } from './chatwoot.api';

/**
 * Chatwoot service - pure adapter for Chatwoot API operations.
 *
 * This service is a low-level adapter that handles only Chatwoot API calls:
 * - Creating or finding contacts
 * - Creating conversations
 *
 * Business logic (email building, inbox selection, message formatting) belongs
 * in the Application layer (ReportApplication, FeedbackApplication).
 *
 * This service runs on the server and requires server-side environment variables:
 * - BASE_URL_SUPPORT
 * - SUPPORT_API_ACCESS_TOKEN
 * - SUPPORT_ACCOUNT_ID
 */
export class ChatwootService {
  private constructor() {}

  /**
   * Get base Chatwoot configuration from environment variables
   *
   * Validates that all required environment variables are present.
   *
   * @returns Base configuration object with baseUrl, accountId, and headers
   * @throws AppError if required environment variables are missing
   */
  private static getBaseConfig(): TChatwootApiConfig {
    const baseUrl = Libs.Env.BASE_URL_SUPPORT;
    const apiAccessToken = Libs.Env.SUPPORT_API_ACCESS_TOKEN;
    const accountId = Libs.Env.SUPPORT_ACCOUNT_ID;

    if (!baseUrl || !apiAccessToken || !accountId) {
      throw Libs.createCommonError(
        Libs.CommonErrorType.ENV_MISSING_REQUIRED,
        'Missing required Chatwoot environment variables',
        500,
        {
          missing: {
            baseUrl: !baseUrl,
            apiAccessToken: !apiAccessToken,
            accountId: !accountId,
          },
        },
      );
    }

    return {
      baseUrl,
      accountId,
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
   * @param inboxId - Inbox ID to associate contact with
   * @returns Chatwoot contact object
   * @throws AppError if API calls fail
   */
  static async createOrFindContact(email: string, name: string, inboxId: number): Promise<Types.TChatwootContact> {
    const config = this.getBaseConfig();

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
      inboxId,
      name,
      email,
    });
  }

  /**
   * Create a conversation in Chatwoot
   *
   * Creates a new conversation with the provided content.
   *
   * @param sourceId - Source ID from contact's inbox association
   * @param contactId - Contact ID
   * @param inboxId - Inbox ID for the conversation
   * @param content - Full message content (already formatted by caller)
   * @throws AppError if API call fails
   */
  static async createConversation(
    sourceId: string,
    contactId: number,
    inboxId: number,
    content: string,
  ): Promise<void> {
    const config = this.getBaseConfig();

    await ChatwootApi.createConversation(config, {
      sourceId,
      inboxId,
      contactId,
      content,
    });
  }
}
