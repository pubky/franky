import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as Core from '@/core';
import * as Libs from '@/libs';
import { REPORT_ISSUE_TYPES, REPORT_ISSUE_LABELS } from '@/core/pipes/report';
import { CHATWOOT_SUBMISSION_TYPES, CHATWOOT_REPORT_MESSAGE_PREFIX } from '@/core/services/chatwoot';
import type { TReportSubmitInput } from './report.types';

const testData = {
  userPubky: 'o1gg96ewuojmopcjbz8895478wdtxtzzuxnfjjz8o8e77csa1ngo' as Core.Pubky,
  userName: 'Test User',
  postUrl: 'https://example.com/post/abc123',
};

const createReportInput = (overrides: Partial<TReportSubmitInput> = {}): TReportSubmitInput => ({
  pubky: testData.userPubky,
  postUrl: testData.postUrl,
  issueType: REPORT_ISSUE_TYPES.PERSONAL_INFO,
  reason: 'This post contains my personal information without consent',
  name: testData.userName,
  ...overrides,
});

describe('ReportApplication', () => {
  let ReportApplication: typeof import('./report').ReportApplication;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Mock ChatwootService
    vi.spyOn(Core.ChatwootService, 'submit').mockResolvedValue(undefined);

    // Mock Logger
    vi.spyOn(Libs.Logger, 'error').mockImplementation(() => {});

    // Import ReportApplication
    const reportModule = await import('./report');
    ReportApplication = reportModule.ReportApplication;
  });

  describe('submit', () => {
    it('should submit to Chatwoot with report type and formatted source', async () => {
      const input = createReportInput();
      const chatwootSpy = vi.spyOn(Core.ChatwootService, 'submit');

      await ReportApplication.submit(input);

      expect(chatwootSpy).toHaveBeenCalledWith({
        pubky: testData.userPubky,
        comment: `Post URL: ${testData.postUrl}\n\nReason: ${input.reason}`,
        name: testData.userName,
        type: CHATWOOT_SUBMISSION_TYPES.REPORT,
        source: `${CHATWOOT_REPORT_MESSAGE_PREFIX} - ${REPORT_ISSUE_LABELS[REPORT_ISSUE_TYPES.PERSONAL_INFO]}`,
      });
    });

    it('should format source label correctly for each issue type', async () => {
      const chatwootSpy = vi.spyOn(Core.ChatwootService, 'submit');

      for (const issueType of Object.values(REPORT_ISSUE_TYPES)) {
        chatwootSpy.mockClear();

        const input = createReportInput({ issueType });
        await ReportApplication.submit(input);

        expect(chatwootSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            source: `${CHATWOOT_REPORT_MESSAGE_PREFIX} - ${REPORT_ISSUE_LABELS[issueType]}`,
          }),
        );
      }
    });

    it('should include post URL in the comment body', async () => {
      const customPostUrl = 'https://custom.example.com/post/xyz789';
      const input = createReportInput({ postUrl: customPostUrl });
      const chatwootSpy = vi.spyOn(Core.ChatwootService, 'submit');

      await ReportApplication.submit(input);

      expect(chatwootSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          comment: expect.stringContaining(`Post URL: ${customPostUrl}`),
        }),
      );
    });

    it('should include reason in the comment body', async () => {
      const customReason = 'This is a detailed reason for reporting';
      const input = createReportInput({ reason: customReason });
      const chatwootSpy = vi.spyOn(Core.ChatwootService, 'submit');

      await ReportApplication.submit(input);

      expect(chatwootSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          comment: expect.stringContaining(`Reason: ${customReason}`),
        }),
      );
    });

    it('should re-throw AppError from ChatwootService', async () => {
      const input = createReportInput();
      const appError = Libs.createCommonError(Libs.CommonErrorType.NETWORK_ERROR, 'Chatwoot API error', 500);
      vi.spyOn(Core.ChatwootService, 'submit').mockRejectedValue(appError);

      await expect(ReportApplication.submit(input)).rejects.toThrow(appError);

      expect(Libs.Logger.error).toHaveBeenCalledWith('Report submission failed', {
        type: appError.type,
        statusCode: appError.statusCode,
        details: appError.details,
      });
    });

    it('should wrap unexpected errors in AppError', async () => {
      const input = createReportInput();
      const unexpectedError = new Error('Unexpected error');
      vi.spyOn(Core.ChatwootService, 'submit').mockRejectedValue(unexpectedError);

      await expect(ReportApplication.submit(input)).rejects.toThrow('Failed to submit report');

      expect(Libs.Logger.error).toHaveBeenCalledWith('Unexpected error during report submission', {
        error: unexpectedError,
      });
    });

    it('should always use report submission type', async () => {
      const input = createReportInput();
      const chatwootSpy = vi.spyOn(Core.ChatwootService, 'submit');

      await ReportApplication.submit(input);

      expect(chatwootSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: CHATWOOT_SUBMISSION_TYPES.REPORT,
        }),
      );
    });
  });
});
