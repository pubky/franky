import { ChatwootService } from '@/core/services/chatwoot';
import * as Libs from '@/libs';
import { REPORT_ISSUE_LABELS, type ReportIssueType } from '@/core/pipes/report';
import { CHATWOOT_SUBMISSION_TYPES, CHATWOOT_REPORT_MESSAGE_PREFIX } from '@/core/services/chatwoot';
import * as Types from './report.types';

/**
 * Report application service.
 *
 * Orchestrates report submission workflow:
 * 1. Formats report message with post URL and issue details
 * 2. Calls Chatwoot service to submit report
 * 3. Logs errors for observability
 *
 * This layer is called by the controller and handles cross-domain orchestration.
 */
export class ReportApplication {
  private constructor() {}

  /**
   * Build the source label for Chatwoot
   *
   * Creates a formatted source string like "Report Post - Personal Info Leak"
   *
   * @param issueType - Type of issue being reported
   * @returns Formatted source label
   */
  private static buildSourceLabel(issueType: ReportIssueType): string {
    const issueLabel = REPORT_ISSUE_LABELS[issueType];
    return `${CHATWOOT_REPORT_MESSAGE_PREFIX} - ${issueLabel}`;
  }

  /**
   * Build the report comment body
   *
   * Creates a formatted message with post URL and user's reason
   *
   * @param postUrl - URL of the reported post
   * @param reason - User's description of the issue
   * @returns Formatted comment body
   */
  private static buildCommentBody(postUrl: string, reason: string): string {
    return `Post URL: ${postUrl}\n\nReason: ${reason}`;
  }

  /**
   * Submit a post report to Chatwoot
   *
   * Orchestrates the report submission by:
   * 1. Building the source label and comment body
   * 2. Delegating to the Chatwoot service with report type
   *
   * @param params - Parameters object
   * @param params.pubky - Reporter's public key
   * @param params.postUrl - URL of the reported post
   * @param params.issueType - Type of issue being reported
   * @param params.reason - User's description of the issue
   * @param params.name - Reporter's display name
   * @throws AppError if submission fails
   */
  static async submit({ pubky, postUrl, issueType, reason, name }: Types.TReportSubmitInput) {
    try {
      const source = this.buildSourceLabel(issueType);
      const comment = this.buildCommentBody(postUrl, reason);

      // Delegate to Chatwoot service with report type
      await ChatwootService.submit({
        pubky,
        comment,
        name,
        type: CHATWOOT_SUBMISSION_TYPES.REPORT,
        source,
      });
    } catch (error) {
      // Log error for observability
      if (error instanceof Libs.AppError) {
        Libs.Logger.error('Report submission failed', {
          type: error.type,
          statusCode: error.statusCode,
          details: error.details,
        });
        // Re-throw AppError to preserve error context
        throw error;
      }

      // Wrap unexpected errors
      Libs.Logger.error('Unexpected error during report submission', { error });
      throw Libs.createCommonError(Libs.CommonErrorType.UNEXPECTED_ERROR, 'Failed to submit report', 500, { error });
    }
  }
}
