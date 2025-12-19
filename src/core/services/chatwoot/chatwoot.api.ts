import * as Libs from '@/libs';
import * as Types from './chatwoot.types';

/**
 * Chatwoot API configuration
 */
export interface TChatwootApiConfig {
  baseUrl: string;
  accountId: string;
  headers: {
    api_access_token: string;
    'Content-Type': string;
  };
}

/**
 * Chatwoot API client for making HTTP requests to Chatwoot endpoints.
 *
 * This module encapsulates all API endpoint calls, providing a clean
 * separation between the service layer and the HTTP communication layer.
 */
export class ChatwootApi {
  private constructor() {}

  /**
   * Search for a contact by email
   *
   * @param config - Chatwoot API configuration
   * @param email - Email address to search for
   * @returns Search response with matching contacts
   * @throws AppError if API call fails
   */
  static async searchContact(config: TChatwootApiConfig, email: string): Promise<Types.TChatwootContactSearchResponse> {
    const searchUrl = `${config.baseUrl}/api/v1/accounts/${config.accountId}/contacts/search`;
    const searchParams = new URLSearchParams({ q: email });

    try {
      const response = await fetch(`${searchUrl}?${searchParams.toString()}`, {
        method: 'GET',
        headers: config.headers,
      });

      if (!response.ok) {
        throw Libs.createCommonError(
          Libs.CommonErrorType.NETWORK_ERROR,
          'Failed to search for contact in Chatwoot',
          response.status,
          {
            endpoint: searchUrl,
            status: response.status,
            statusText: response.statusText,
          },
        );
      }

      return (await response.json()) as Types.TChatwootContactSearchResponse;
    } catch (error) {
      // Re-throw AppError as-is
      if (error instanceof Libs.AppError) {
        throw error;
      }

      // Wrap unexpected errors
      throw Libs.createCommonError(Libs.CommonErrorType.UNEXPECTED_ERROR, 'Error searching for contact', 500, {
        error,
      });
    }
  }

  /**
   * Create a new contact
   *
   * @param config - Chatwoot API configuration
   * @param params - Contact creation parameters
   * @param params.inboxId - Inbox ID to associate contact with
   * @param params.name - Contact display name
   * @param params.email - Contact email address
   * @returns Created contact
   * @throws AppError if API call fails
   */
  static async createContact(
    config: TChatwootApiConfig,
    params: { inboxId: number; name: string; email: string },
  ): Promise<Types.TChatwootContact> {
    const createUrl = `${config.baseUrl}/api/v1/accounts/${config.accountId}/contacts`;

    try {
      const response = await fetch(createUrl, {
        method: 'POST',
        headers: config.headers,
        body: JSON.stringify({
          inbox_id: params.inboxId,
          name: params.name,
          email: params.email,
        }),
      });

      if (!response.ok) {
        throw Libs.createCommonError(
          Libs.CommonErrorType.NETWORK_ERROR,
          'Failed to create contact in Chatwoot',
          response.status,
          {
            endpoint: createUrl,
            status: response.status,
            statusText: response.statusText,
          },
        );
      }

      const data = (await response.json()) as Types.TChatwootCreateContactResponse;
      return data.payload.contact;
    } catch (error) {
      // Re-throw AppError as-is
      if (error instanceof Libs.AppError) {
        throw error;
      }

      // Wrap unexpected errors
      throw Libs.createCommonError(Libs.CommonErrorType.UNEXPECTED_ERROR, 'Error creating contact', 500, {
        error,
      });
    }
  }

  /**
   * Create a new conversation
   *
   * @param config - Chatwoot API configuration
   * @param params - Conversation creation parameters
   * @param params.sourceId - Source ID from contact's inbox association
   * @param params.inboxId - Inbox ID
   * @param params.contactId - Contact ID
   * @param params.content - Message content
   * @throws AppError if API call fails
   */
  static async createConversation(
    config: TChatwootApiConfig,
    params: { sourceId: string; inboxId: number; contactId: number; content: string },
  ): Promise<void> {
    const conversationUrl = `${config.baseUrl}/api/v1/accounts/${config.accountId}/conversations`;

    try {
      const response = await fetch(conversationUrl, {
        method: 'POST',
        headers: config.headers,
        body: JSON.stringify({
          source_id: params.sourceId,
          inbox_id: params.inboxId,
          contact_id: params.contactId,
          message: { content: params.content, message_type: 'incoming' },
        }),
      });

      if (!response.ok) {
        throw Libs.createCommonError(
          Libs.CommonErrorType.NETWORK_ERROR,
          'Failed to create conversation in Chatwoot',
          response.status,
          {
            endpoint: conversationUrl,
            status: response.status,
            statusText: response.statusText,
          },
        );
      }
    } catch (error) {
      // Re-throw AppError as-is
      if (error instanceof Libs.AppError) {
        throw error;
      }

      // Wrap unexpected errors
      throw Libs.createCommonError(Libs.CommonErrorType.UNEXPECTED_ERROR, 'Error creating conversation', 500, {
        error,
      });
    }
  }
}
