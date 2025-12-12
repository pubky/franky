import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as Core from '@/core';
import type {
  TChatwootSubmitInput,
  TChatwootContact,
  TChatwootContactSearchResponse,
  TChatwootCreateContactResponse,
} from './chatwoot.types';

const testData = {
  userPubky: 'o1gg96ewuojmopcjbz8895478wdtxtzzuxnfjjz8o8e77csa1ngo' as Core.Pubky,
  userName: 'Test User',
  baseUrl: 'https://chatwoot.example.com',
  apiAccessToken: 'test-token',
  accountId: '123',
  contactId: 456,
  sourceId: 'source-123',
};

const createChatwootInput = (overrides: Partial<TChatwootSubmitInput> = {}): TChatwootSubmitInput => ({
  pubky: testData.userPubky,
  comment: 'This is a test feedback comment',
  name: testData.userName,
  ...overrides,
});

const createMockContact = (overrides: Partial<TChatwootContact> = {}): TChatwootContact => ({
  id: testData.contactId,
  email: `${testData.userPubky}@pubky.app`,
  name: testData.userName,
  contact_inboxes: [
    {
      source_id: testData.sourceId,
    },
  ],
  ...overrides,
});

describe('ChatwootService', () => {
  let ChatwootService: typeof import('./chatwoot').ChatwootService;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Mock global fetch
    global.fetch = vi.fn();

    // Import ChatwootService
    const chatwootModule = await import('./chatwoot');
    ChatwootService = chatwootModule.ChatwootService;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('submit', () => {
    it('should create new contact and conversation when contact does not exist', async () => {
      const input = createChatwootInput();

      // Mock contact search - no existing contact
      const searchResponse: TChatwootContactSearchResponse = {
        payload: [],
      };
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => searchResponse,
      });

      // Mock contact creation
      const newContact = createMockContact();
      const createResponse: TChatwootCreateContactResponse = {
        payload: {
          contact: newContact,
        },
      };
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => createResponse,
      });

      // Mock conversation creation
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
      });

      await ChatwootService.submit(input);

      // Verify contact search
      expect(global.fetch).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining('/contacts/search'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            api_access_token: testData.apiAccessToken,
          }),
        }),
      );

      // Verify contact creation
      expect(global.fetch).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining('/contacts'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            inbox_id: 26,
            name: testData.userName,
            email: `${testData.userPubky}@pubky.app`,
          }),
        }),
      );

      // Verify conversation creation
      expect(global.fetch).toHaveBeenNthCalledWith(
        3,
        expect.stringContaining('/conversations'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining(input.comment),
        }),
      );
    });

    it('should use existing contact when found', async () => {
      const input = createChatwootInput();
      const existingContact = createMockContact();

      // Mock contact search - existing contact found
      const searchResponse: TChatwootContactSearchResponse = {
        payload: [existingContact],
      };
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => searchResponse,
      });

      // Mock conversation creation
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
      });

      await ChatwootService.submit(input);

      // Should only call search and conversation creation, not contact creation
      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(global.fetch).not.toHaveBeenCalledWith(
        expect.stringContaining('/contacts'),
        expect.objectContaining({ method: 'POST' }),
      );
    });

    it('should throw AppError when contact has no inbox associations', async () => {
      const input = createChatwootInput();
      const contactWithoutInbox = createMockContact({ contact_inboxes: [] });

      const searchResponse: TChatwootContactSearchResponse = {
        payload: [contactWithoutInbox],
      };
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => searchResponse,
      });

      await expect(ChatwootService.submit(input)).rejects.toThrow('Contact has no inbox associations');
    });

    it('should throw AppError when contact search fails', async () => {
      const input = createChatwootInput();

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(ChatwootService.submit(input)).rejects.toThrow('Failed to search for contact in Chatwoot');
    });

    it('should throw AppError when contact creation fails', async () => {
      const input = createChatwootInput();

      // Mock contact search - no existing contact
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ payload: [] }),
      });

      // Mock contact creation failure
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
      });

      await expect(ChatwootService.submit(input)).rejects.toThrow('Failed to create contact in Chatwoot');
    });

    it('should throw AppError when conversation creation fails', async () => {
      const input = createChatwootInput();
      const existingContact = createMockContact();

      // Mock contact search
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ payload: [existingContact] }),
      });

      // Mock conversation creation failure
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(ChatwootService.submit(input)).rejects.toThrow('Failed to create conversation in Chatwoot');
    });

    it('should include feedback prefix in conversation message', async () => {
      const input = createChatwootInput({ comment: 'My feedback' });
      const existingContact = createMockContact();

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ payload: [existingContact] }),
      });

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
      });

      await ChatwootService.submit(input);

      const conversationCall = (global.fetch as ReturnType<typeof vi.fn>).mock.calls.find((call) =>
        call[0].toString().includes('/conversations'),
      );
      expect(conversationCall).toBeDefined();

      const body = JSON.parse(conversationCall![1].body as string);
      expect(body.message.content).toContain('Feedback');
      expect(body.message.content).toContain('My feedback');
    });

    it('should throw AppError when environment variables are missing', async () => {
      // Since env vars are now required at module load time (validated in env.ts),
      // we test the service's validation by mocking Env to have undefined values
      const mockEnv = await import('@/libs/env');
      const originalValues = {
        BASE_URL_SUPPORT: mockEnv.Env.BASE_URL_SUPPORT,
        SUPPORT_API_ACCESS_TOKEN: mockEnv.Env.SUPPORT_API_ACCESS_TOKEN,
        SUPPORT_ACCOUNT_ID: mockEnv.Env.SUPPORT_ACCOUNT_ID,
        SUPPORT_FEEDBACK_INBOX_ID: mockEnv.Env.SUPPORT_FEEDBACK_INBOX_ID,
      };

      // Override the Env values to undefined to test service validation
      (mockEnv.Env as unknown as { BASE_URL_SUPPORT?: string }).BASE_URL_SUPPORT = undefined;
      (mockEnv.Env as unknown as { SUPPORT_API_ACCESS_TOKEN?: string }).SUPPORT_API_ACCESS_TOKEN = undefined;
      (mockEnv.Env as unknown as { SUPPORT_ACCOUNT_ID?: string }).SUPPORT_ACCOUNT_ID = undefined;
      (mockEnv.Env as unknown as { SUPPORT_FEEDBACK_INBOX_ID?: number }).SUPPORT_FEEDBACK_INBOX_ID = undefined;

      const input = createChatwootInput();

      await expect(ChatwootService.submit(input)).rejects.toThrow('Missing required Chatwoot environment variables');

      // Restore original values
      (mockEnv.Env as unknown as { BASE_URL_SUPPORT: string }).BASE_URL_SUPPORT = originalValues.BASE_URL_SUPPORT!;
      (mockEnv.Env as unknown as { SUPPORT_API_ACCESS_TOKEN: string }).SUPPORT_API_ACCESS_TOKEN =
        originalValues.SUPPORT_API_ACCESS_TOKEN!;
      (mockEnv.Env as unknown as { SUPPORT_ACCOUNT_ID: string }).SUPPORT_ACCOUNT_ID =
        originalValues.SUPPORT_ACCOUNT_ID!;
      (mockEnv.Env as unknown as { SUPPORT_FEEDBACK_INBOX_ID: number }).SUPPORT_FEEDBACK_INBOX_ID =
        originalValues.SUPPORT_FEEDBACK_INBOX_ID!;
    });

    it('should handle case-insensitive email matching in contact search', async () => {
      const input = createChatwootInput();
      const existingContact = createMockContact({
        email: `${testData.userPubky.toUpperCase()}@pubky.app`,
      });

      const searchResponse: TChatwootContactSearchResponse = {
        payload: [existingContact],
      };
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => searchResponse,
      });

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
      });

      await ChatwootService.submit(input);

      // Should use existing contact despite case difference
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });
});
