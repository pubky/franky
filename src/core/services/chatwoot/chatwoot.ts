import * as Libs from '@/libs';
import * as Types from './chatwoot.types';
import {
  CHATWOOT_INBOX_IDS,
  CHATWOOT_SUBMISSION_TYPES,
  CHATWOOT_FEEDBACK_MESSAGE_PREFIX,
  CHATWOOT_REPORT_MESSAGE_PREFIX,
} from './chatwoot.constants';
import type { ChatwootSubmissionType } from './chatwoot.types';
import { ChatwootApi, type TChatwootApiConfig } from './chatwoot.api';

/**
 * Chatwoot service for handling feedback and report submissions.
 *
 * This service interacts with the Chatwoot API to:
 * 1. Create or find existing contact by email
 * 2. Create a conversation with the message
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
   * Get inbox ID based on submission type
   *
   * @param type - Submission type (feedback or report)
   * @returns Inbox ID for the submission type
   */
  private static getInboxId(type: ChatwootSubmissionType): number {
    return type === CHATWOOT_SUBMISSION_TYPES.REPORT ? CHATWOOT_INBOX_IDS.REPORTS : CHATWOOT_INBOX_IDS.FEEDBACK;
  }

  /**
   * Get message prefix based on submission type and source
   *
   * @param type - Submission type (feedback or report)
   * @param source - Optional source label for reports
   * @returns Message prefix string
   */
  private static getMessagePrefix(type: ChatwootSubmissionType, source?: string): string {
    if (type === CHATWOOT_SUBMISSION_TYPES.REPORT) {
      return source || CHATWOOT_REPORT_MESSAGE_PREFIX;
    }
    return CHATWOOT_FEEDBACK_MESSAGE_PREFIX;
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
  private static async createContactIfNotExists(
    email: string,
    name: string,
    inboxId: number,
  ): Promise<Types.TChatwootContact> {
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
   * Creates a new conversation with the message.
   *
   * @param sourceId - Source ID from contact's inbox association
   * @param contactId - Contact ID
   * @param inboxId - Inbox ID for the conversation
   * @param message - Message content
   * @param messagePrefix - Prefix to add to the message
   * @throws AppError if API call fails
   */
  private static async createConversation(
    sourceId: string,
    contactId: number,
    inboxId: number,
    message: string,
    messagePrefix: string,
  ): Promise<void> {
    const config = this.getBaseConfig();
    const content = `${messagePrefix}\n\n${message}`;

    await ChatwootApi.createConversation(config, {
      sourceId,
      inboxId,
      contactId,
      content,
    });
  }

  /**
   * Submit feedback or report to Chatwoot
   *
   * Orchestrates the submission by:
   * 1. Building email from pubky
   * 2. Determining inbox based on type
   * 3. Creating or finding contact
   * 4. Creating conversation with message
   *
   * @param params - Parameters object
   * @param params.pubky - User's public key
   * @param params.comment - Message content
   * @param params.name - User's display name
   * @param params.type - Submission type (defaults to 'feedback')
   * @param params.source - Source label for reports (e.g., "Report Post - Personal Info Leak")
   * @throws AppError if any step fails
   */
  static async submit(params: Types.TChatwootSubmitInput): Promise<void> {
    const { pubky, comment, name, type = CHATWOOT_SUBMISSION_TYPES.FEEDBACK, source } = params;

    // Build email from pubky
    const email = `${pubky}@pubky.app`;

    // Get inbox ID based on type
    const inboxId = this.getInboxId(type);

    // Get message prefix
    const messagePrefix = this.getMessagePrefix(type, source);

    // Create or find contact
    const contact = await this.createContactIfNotExists(email, name, inboxId);

    if (!contact.contact_inboxes || contact.contact_inboxes.length === 0) {
      throw Libs.createCommonError(Libs.CommonErrorType.UNEXPECTED_ERROR, 'Contact has no inbox associations', 500, {
        contactId: contact.id,
        email,
      });
    }

    const sourceId = contact.contact_inboxes[0].source_id;

    // Create conversation
    await this.createConversation(sourceId, contact.id, inboxId, comment, messagePrefix);
  }
}
