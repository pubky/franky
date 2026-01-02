import * as Libs from '@/libs';
import { REPORT_ISSUE_TYPE_VALUES, REPORT_REASON_MAX_LENGTH } from './report.constants';
import type { ReportIssueType } from './report.types';

/**
 * Report input validators
 *
 * Validates and normalizes report submission inputs.
 * Follows the same pattern as FeedbackValidators.
 */
export class ReportValidators {
  private constructor() {}

  /**
   * Validates and normalizes post URL input.
   *
   * @param postUrl - URL of the post being reported
   * @returns Normalized post URL (trimmed)
   * @throws AppError if postUrl is invalid
   */
  static validatePostUrl(postUrl: string | undefined | null): string {
    if (!postUrl || postUrl.trim() === '') {
      throw Libs.createCommonError(
        Libs.CommonErrorType.INVALID_INPUT,
        'Post URL is required and must be a non-empty string',
        400,
      );
    }
    return postUrl.trim();
  }

  /**
   * Validates issue type input.
   *
   * @param issueType - Type of issue being reported
   * @returns Validated issue type
   * @throws AppError if issueType is invalid
   */
  static validateIssueType(issueType: string | undefined | null): ReportIssueType {
    if (!issueType || issueType.trim() === '') {
      throw Libs.createCommonError(
        Libs.CommonErrorType.INVALID_INPUT,
        'Issue type is required and must be a non-empty string',
        400,
      );
    }

    const trimmedIssueType = issueType.trim();

    if (!REPORT_ISSUE_TYPE_VALUES.includes(trimmedIssueType as ReportIssueType)) {
      throw Libs.createCommonError(
        Libs.CommonErrorType.INVALID_INPUT,
        `Invalid issue type. Must be one of: ${REPORT_ISSUE_TYPE_VALUES.join(', ')}`,
        400,
      );
    }

    return trimmedIssueType as ReportIssueType;
  }

  /**
   * Validates and normalizes reason text input.
   *
   * @param reason - User's description of the issue
   * @returns Normalized reason (trimmed)
   * @throws AppError if reason is invalid
   */
  static validateReason(reason: string | undefined | null): string {
    if (!reason || reason.trim() === '') {
      throw Libs.createCommonError(
        Libs.CommonErrorType.INVALID_INPUT,
        'Reason is required and must be a non-empty string',
        400,
      );
    }

    if (reason.length > REPORT_REASON_MAX_LENGTH) {
      throw Libs.createCommonError(
        Libs.CommonErrorType.INVALID_INPUT,
        `Reason must be no more than ${REPORT_REASON_MAX_LENGTH} characters`,
        400,
      );
    }

    return reason.trim();
  }

  /**
   * Validates and normalizes pubky input.
   *
   * @param pubky - Reporter's public key
   * @returns Normalized pubky (trimmed)
   * @throws AppError if pubky is invalid
   */
  static validatePubky(pubky: string | undefined | null): string {
    if (!pubky || pubky.trim() === '') {
      throw Libs.createCommonError(
        Libs.CommonErrorType.INVALID_INPUT,
        'Pubky is required and must be a non-empty string',
        400,
      );
    }
    return pubky.trim();
  }

  /**
   * Validates and normalizes name input.
   *
   * @param name - Reporter's display name
   * @returns Normalized name (trimmed)
   * @throws AppError if name is invalid
   */
  static validateName(name: string | undefined | null): string {
    if (!name || name.trim() === '') {
      throw Libs.createCommonError(
        Libs.CommonErrorType.INVALID_INPUT,
        'Name is required and must be a non-empty string',
        400,
      );
    }
    return name.trim();
  }
}
