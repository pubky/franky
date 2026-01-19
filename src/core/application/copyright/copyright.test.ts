import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as Core from '@/core';
import * as Libs from '@/libs';
import { CHATWOOT_INBOX_IDS } from '@/core/services/chatwoot';
import type { TCopyrightSubmitInput } from './copyright.types';
import type { TChatwootContact } from '@/core/services/chatwoot/chatwoot.types';

const testData = {
  nameOwner: 'John Doe',
  originalContentUrls: 'https://example.com/original',
  briefDescription: 'Original artwork',
  infringingContentUrl: 'https://example.com/infringing',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  phoneNumber: '123-456-7890',
  streetAddress: '123 Main St',
  country: 'United States',
  city: 'New York',
  stateProvince: 'NY',
  zipCode: '10001',
  signature: 'John Doe',
  isRightsOwner: true,
  isReportingOnBehalf: false,
  contactId: 456,
  sourceId: 'source-123',
};

const createCopyrightInput = (overrides: Partial<TCopyrightSubmitInput> = {}): TCopyrightSubmitInput => ({
  ...testData,
  ...overrides,
});

const createMockContact = (overrides: Partial<TChatwootContact> = {}): TChatwootContact => ({
  id: testData.contactId,
  email: testData.email,
  name: `${testData.firstName} ${testData.lastName}`,
  contact_inboxes: [
    {
      source_id: testData.sourceId,
    },
  ],
  ...overrides,
});

describe('CopyrightApplication', () => {
  let CopyrightApplication: typeof import('./copyright').CopyrightApplication;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Mock ChatwootService methods
    vi.spyOn(Core.ChatwootService, 'createOrFindContact').mockResolvedValue(createMockContact());
    vi.spyOn(Core.ChatwootService, 'createConversation').mockResolvedValue(undefined);

    // Mock Logger
    vi.spyOn(Libs.Logger, 'error').mockImplementation(() => {});

    // Import CopyrightApplication
    const copyrightModule = await import('./copyright');
    CopyrightApplication = copyrightModule.CopyrightApplication;
  });

  describe('submit', () => {
    it('should use email from form data', async () => {
      const input = createCopyrightInput();
      const createOrFindContactSpy = vi.spyOn(Core.ChatwootService, 'createOrFindContact');

      await CopyrightApplication.submit(input);

      expect(createOrFindContactSpy).toHaveBeenCalledWith(testData.email, expect.any(String), expect.any(Number));
    });

    it('should build name from first and last name', async () => {
      const input = createCopyrightInput();
      const createOrFindContactSpy = vi.spyOn(Core.ChatwootService, 'createOrFindContact');

      await CopyrightApplication.submit(input);

      expect(createOrFindContactSpy).toHaveBeenCalledWith(
        expect.any(String),
        `${testData.firstName} ${testData.lastName}`,
        expect.any(Number),
      );
    });

    it('should use correct inbox ID for copyright submissions', async () => {
      const input = createCopyrightInput();
      const createOrFindContactSpy = vi.spyOn(Core.ChatwootService, 'createOrFindContact');
      const createConversationSpy = vi.spyOn(Core.ChatwootService, 'createConversation');

      await CopyrightApplication.submit(input);

      // Verify inbox ID is passed to createOrFindContact
      expect(createOrFindContactSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        CHATWOOT_INBOX_IDS.COPYRIGHT,
      );

      // Verify inbox ID is passed to createConversation
      expect(createConversationSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Number),
        CHATWOOT_INBOX_IDS.COPYRIGHT,
        expect.any(String),
      );
    });

    it('should format message with source label prefix', async () => {
      const input = createCopyrightInput();
      const createConversationSpy = vi.spyOn(Core.ChatwootService, 'createConversation');

      await CopyrightApplication.submit(input);

      expect(createConversationSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Number),
        expect.any(Number),
        expect.stringContaining('Copyright Removal Request'),
      );
    });

    it('should include form data as JSON in message content', async () => {
      const input = createCopyrightInput();
      const createConversationSpy = vi.spyOn(Core.ChatwootService, 'createConversation');

      await CopyrightApplication.submit(input);

      const callArgs = createConversationSpy.mock.calls[0];
      const content = callArgs[3] as string;

      // Should contain JSON with form data
      expect(content).toContain('"nameOwner"');
      expect(content).toContain('"firstName"');
      expect(content).toContain('"email"');
      expect(content).toContain(testData.nameOwner);
      expect(content).toContain(testData.email);
    });

    it('should call createOrFindContact with correct parameters', async () => {
      const input = createCopyrightInput();
      const createOrFindContactSpy = vi.spyOn(Core.ChatwootService, 'createOrFindContact');

      await CopyrightApplication.submit(input);

      expect(createOrFindContactSpy).toHaveBeenCalledWith(
        testData.email,
        `${testData.firstName} ${testData.lastName}`,
        CHATWOOT_INBOX_IDS.COPYRIGHT,
      );
    });

    it('should call createConversation with contact data and formatted message', async () => {
      const input = createCopyrightInput();
      const createConversationSpy = vi.spyOn(Core.ChatwootService, 'createConversation');

      await CopyrightApplication.submit(input);

      expect(createConversationSpy).toHaveBeenCalledWith(
        testData.sourceId,
        testData.contactId,
        CHATWOOT_INBOX_IDS.COPYRIGHT,
        expect.any(String),
      );
    });

    it('should throw AppError when contact has empty inbox associations', async () => {
      const input = createCopyrightInput();
      const contactWithoutInbox = createMockContact({ contact_inboxes: [] });
      vi.spyOn(Core.ChatwootService, 'createOrFindContact').mockResolvedValue(contactWithoutInbox);

      await expect(CopyrightApplication.submit(input)).rejects.toThrow('Contact has no inbox associations');

      expect(Libs.Logger.error).toHaveBeenCalledWith('Copyright submission failed', expect.any(Object));
    });

    it('should re-throw AppError from ChatwootService', async () => {
      const input = createCopyrightInput();
      const appError = Libs.createCommonError(Libs.CommonErrorType.NETWORK_ERROR, 'Chatwoot API error', 500);
      vi.spyOn(Core.ChatwootService, 'createOrFindContact').mockRejectedValue(appError);

      await expect(CopyrightApplication.submit(input)).rejects.toThrow(appError);

      expect(Libs.Logger.error).toHaveBeenCalledWith('Copyright submission failed', {
        type: appError.type,
        statusCode: appError.statusCode,
        details: appError.details,
      });
    });

    it('should wrap unexpected errors in AppError', async () => {
      const input = createCopyrightInput();
      const unexpectedError = new Error('Unexpected error');
      vi.spyOn(Core.ChatwootService, 'createOrFindContact').mockRejectedValue(unexpectedError);

      await expect(CopyrightApplication.submit(input)).rejects.toThrow('Failed to submit copyright request');

      expect(Libs.Logger.error).toHaveBeenCalledWith('Unexpected error during copyright submission', {
        error: unexpectedError,
      });
    });

    it('should throw AppError when createConversation fails', async () => {
      const input = createCopyrightInput();
      const appError = Libs.createCommonError(Libs.CommonErrorType.NETWORK_ERROR, 'Failed to create conversation', 500);
      vi.spyOn(Core.ChatwootService, 'createConversation').mockRejectedValue(appError);

      await expect(CopyrightApplication.submit(input)).rejects.toThrow(appError);

      expect(Libs.Logger.error).toHaveBeenCalledWith('Copyright submission failed', expect.any(Object));
    });
  });
});
