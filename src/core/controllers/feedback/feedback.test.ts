import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as Core from '@/core';
import * as Config from '@/config';
import type { TFeedbackSubmitParams } from './feedback.types';

const testData = {
  userPubky: 'o1gg96ewuojmopcjbz8895478wdtxtzzuxnfjjz8o8e77csa1ngo' as Core.Pubky,
};

const createFeedbackParams = (overrides: Partial<TFeedbackSubmitParams> = {}): TFeedbackSubmitParams => ({
  pubky: testData.userPubky,
  comment: 'This is a test feedback comment',
  ...overrides,
});

describe('FeedbackController', () => {
  let FeedbackController: typeof import('./feedback').FeedbackController;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Mock FeedbackApplication
    vi.spyOn(Core.FeedbackApplication, 'submit').mockResolvedValue(undefined);

    // Import FeedbackController
    const feedbackModule = await import('./feedback');
    FeedbackController = feedbackModule.FeedbackController;
  });

  describe('submit', () => {
    it('should pass params to application layer', async () => {
      const params = createFeedbackParams();
      const submitSpy = vi.spyOn(Core.FeedbackApplication, 'submit');

      await FeedbackController.submit(params);

      expect(submitSpy).toHaveBeenCalledWith({
        pubky: testData.userPubky,
        comment: params.comment,
      });
    });

    it('should throw when pubky is missing', async () => {
      const params = createFeedbackParams({ pubky: '' });

      await expect(FeedbackController.submit(params)).rejects.toThrow(
        'Pubky is required and must be a non-empty string',
      );
    });

    it('should throw when pubky is not a string', async () => {
      const params = createFeedbackParams({ pubky: null as unknown as Core.Pubky });

      await expect(FeedbackController.submit(params)).rejects.toThrow(
        'Pubky is required and must be a non-empty string',
      );
    });

    it('should throw when comment is missing', async () => {
      const params = createFeedbackParams({ comment: '' });

      await expect(FeedbackController.submit(params)).rejects.toThrow(
        'Comment is required and must be a non-empty string',
      );
    });

    it('should throw when comment is not a string', async () => {
      const params = createFeedbackParams({ comment: null as unknown as string });

      await expect(FeedbackController.submit(params)).rejects.toThrow(
        'Comment is required and must be a non-empty string',
      );
    });

    it('should throw when comment exceeds max length', async () => {
      const longComment = 'a'.repeat(Config.FEEDBACK_MAX_CHARACTER_LENGTH + 1);
      const params = createFeedbackParams({ comment: longComment });

      await expect(FeedbackController.submit(params)).rejects.toThrow(
        `Comment must be at most ${Config.FEEDBACK_MAX_CHARACTER_LENGTH} characters`,
      );
    });

    it('should throw when application layer fails', async () => {
      vi.spyOn(Core.FeedbackApplication, 'submit').mockRejectedValue(new Error('Application error'));

      const params = createFeedbackParams();

      await expect(FeedbackController.submit(params)).rejects.toThrow('Application error');
    });

    it('should accept comment at max length', async () => {
      const maxLengthComment = 'a'.repeat(Config.FEEDBACK_MAX_CHARACTER_LENGTH);
      const params = createFeedbackParams({ comment: maxLengthComment });
      const submitSpy = vi.spyOn(Core.FeedbackApplication, 'submit');

      await FeedbackController.submit(params);

      expect(submitSpy).toHaveBeenCalledWith({
        pubky: testData.userPubky,
        comment: maxLengthComment,
      });
    });
  });
});
