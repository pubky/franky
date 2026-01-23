import * as Core from '@/core';
import * as Types from './report.types';

/**
 * Controller for post report submission.
 * Entry point for the report feature, called from the API route.
 */
export class ReportController {
  private constructor() {}

  /**
   * Submit a post report to Chatwoot.
   *
   * Validates all inputs via pipes layer before delegating to application.
   *
   * @param params.pubky - Reporter's public key
   * @param params.postUrl - URL of the post being reported
   * @param params.issueType - Type of issue being reported
   * @param params.reason - User's description of the issue
   * @param params.name - Reporter's display name
   * @throws AppError if validation fails or submission fails
   */
  static async submit(params: Types.TReportSubmitParams): Promise<void> {
    // Validate and normalize inputs using pipes layer
    const pubky = Core.ReportValidators.validatePubky(params.pubky);
    const postUrl = Core.ReportValidators.validatePostUrl(params.postUrl);
    const issueType = Core.ReportValidators.validateIssueType(params.issueType);
    const reason = Core.ReportValidators.validateReason(params.reason);
    const name = Core.ReportValidators.validateName(params.name);

    await Core.ReportApplication.submit({ pubky, postUrl, issueType, reason, name });
  }
}
