import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as Core from '@/core';
import * as Libs from '@/libs';
import type { TFeedbackSubmitInput } from './feedback.types';

const testData = {
  userPubky: 'o1gg96ewuojmopcjbz8895478wdtxtzzuxnfjjz8o8e77csa1ngo' as Core.Pubky,
  userName: 'Test User',
};

const createFeedbackInput = (overrides: Partial<TFeedbackSubmitInput> = {}): TFeedbackSubmitInput => ({
  pubky: testData.userPubky,
  comment: 'This is a test feedback comment',
  name: testData.userName,
  ...overrides,
});

describe('FeedbackApplication', () => {
  let FeedbackApplication: typeof import('./feedback').FeedbackApplication;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Mock ChatwootService
    vi.spyOn(Core.ChatwootService, 'submit').mockResolvedValue(undefined);

    // Mock Logger
    vi.spyOn(Libs.Logger, 'error').mockImplementation(() => {});

    // Import FeedbackApplication
    const feedbackModule = await import('./feedback');
    FeedbackApplication = feedbackModule.FeedbackApplication;
  });

  describe('submit', () => {
    it('should submit to Chatwoot with all parameters', async () => {
      const input = createFeedbackInput();
      const chatwootSpy = vi.spyOn(Core.ChatwootService, 'submit');

      await FeedbackApplication.submit(input);

      expect(chatwootSpy).toHaveBeenCalledWith({
        pubky: testData.userPubky,
        comment: input.comment,
        name: testData.userName,
      });
    });

    it('should re-throw AppError from ChatwootService', async () => {
      const input = createFeedbackInput();
      const appError = Libs.createCommonError(Libs.CommonErrorType.NETWORK_ERROR, 'Chatwoot API error', 500);
      vi.spyOn(Core.ChatwootService, 'submit').mockRejectedValue(appError);

      await expect(FeedbackApplication.submit(input)).rejects.toThrow(appError);

      expect(Libs.Logger.error).toHaveBeenCalledWith('Feedback submission failed', {
        type: appError.type,
        statusCode: appError.statusCode,
        details: appError.details,
      });
    });

    it('should wrap unexpected errors in AppError', async () => {
      const input = createFeedbackInput();
      const unexpectedError = new Error('Unexpected error');
      vi.spyOn(Core.ChatwootService, 'submit').mockRejectedValue(unexpectedError);

      await expect(FeedbackApplication.submit(input)).rejects.toThrow();

      expect(Libs.Logger.error).toHaveBeenCalledWith('Unexpected error during feedback submission', {
        error: unexpectedError,
      });
    });

    it('should pass through all parameters correctly', async () => {
      const input = createFeedbackInput({
        comment: 'Custom feedback message',
      });
      const chatwootSpy = vi.spyOn(Core.ChatwootService, 'submit');

      await FeedbackApplication.submit(input);

      expect(chatwootSpy).toHaveBeenCalledWith({
        pubky: testData.userPubky,
        comment: 'Custom feedback message',
        name: testData.userName,
      });
    });
  });
});
