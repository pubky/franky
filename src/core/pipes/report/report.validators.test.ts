import { describe, it, expect } from 'vitest';
import { ReportValidators } from './report.validators';
import { REPORT_ISSUE_TYPES, REPORT_REASON_MAX_LENGTH, REPORT_ISSUE_TYPE_VALUES } from './report.constants';
import * as Libs from '@/libs';

describe('ReportValidators', () => {
  describe('validatePostUrl', () => {
    it('should return trimmed postUrl for valid input', () => {
      const result = ReportValidators.validatePostUrl('  https://example.com/post/123  ');
      expect(result).toBe('https://example.com/post/123');
    });

    it('should throw AppError for empty string', () => {
      expect(() => ReportValidators.validatePostUrl('')).toThrow(Libs.AppError);
      expect(() => ReportValidators.validatePostUrl('')).toThrow('Post URL is required and must be a non-empty string');
    });

    it('should throw AppError for whitespace-only string', () => {
      expect(() => ReportValidators.validatePostUrl('   ')).toThrow(Libs.AppError);
    });

    it('should throw AppError for null', () => {
      expect(() => ReportValidators.validatePostUrl(null)).toThrow(Libs.AppError);
    });

    it('should throw AppError for undefined', () => {
      expect(() => ReportValidators.validatePostUrl(undefined)).toThrow(Libs.AppError);
    });
  });

  describe('validateIssueType', () => {
    it('should return valid issue type for valid input', () => {
      const result = ReportValidators.validateIssueType(REPORT_ISSUE_TYPES.PERSONAL_INFO);
      expect(result).toBe(REPORT_ISSUE_TYPES.PERSONAL_INFO);
    });

    it('should accept all valid issue types', () => {
      REPORT_ISSUE_TYPE_VALUES.forEach((issueType) => {
        const result = ReportValidators.validateIssueType(issueType);
        expect(result).toBe(issueType);
      });
    });

    it('should trim whitespace from issue type', () => {
      const result = ReportValidators.validateIssueType(`  ${REPORT_ISSUE_TYPES.HATE_SPEECH}  `);
      expect(result).toBe(REPORT_ISSUE_TYPES.HATE_SPEECH);
    });

    it('should throw AppError for empty string', () => {
      expect(() => ReportValidators.validateIssueType('')).toThrow(Libs.AppError);
      expect(() => ReportValidators.validateIssueType('')).toThrow(
        'Issue type is required and must be a non-empty string',
      );
    });

    it('should throw AppError for whitespace-only string', () => {
      expect(() => ReportValidators.validateIssueType('   ')).toThrow(Libs.AppError);
    });

    it('should throw AppError for null', () => {
      expect(() => ReportValidators.validateIssueType(null)).toThrow(Libs.AppError);
    });

    it('should throw AppError for undefined', () => {
      expect(() => ReportValidators.validateIssueType(undefined)).toThrow(Libs.AppError);
    });

    it('should throw AppError for invalid issue type', () => {
      expect(() => ReportValidators.validateIssueType('invalid-type')).toThrow(Libs.AppError);
      expect(() => ReportValidators.validateIssueType('invalid-type')).toThrow(
        `Invalid issue type. Must be one of: ${REPORT_ISSUE_TYPE_VALUES.join(', ')}`,
      );
    });
  });

  describe('validateReason', () => {
    it('should return trimmed reason for valid input', () => {
      const result = ReportValidators.validateReason('  This post contains harmful content  ');
      expect(result).toBe('This post contains harmful content');
    });

    it('should throw AppError for empty string', () => {
      expect(() => ReportValidators.validateReason('')).toThrow(Libs.AppError);
      expect(() => ReportValidators.validateReason('')).toThrow('Reason is required and must be a non-empty string');
    });

    it('should throw AppError for whitespace-only string', () => {
      expect(() => ReportValidators.validateReason('   ')).toThrow(Libs.AppError);
    });

    it('should throw AppError for null', () => {
      expect(() => ReportValidators.validateReason(null)).toThrow(Libs.AppError);
    });

    it('should throw AppError for undefined', () => {
      expect(() => ReportValidators.validateReason(undefined)).toThrow(Libs.AppError);
    });

    it('should accept reason at max length', () => {
      const maxReason = 'a'.repeat(REPORT_REASON_MAX_LENGTH);
      const result = ReportValidators.validateReason(maxReason);
      expect(result).toBe(maxReason);
    });

    it('should throw AppError for reason exceeding max length', () => {
      const longReason = 'a'.repeat(REPORT_REASON_MAX_LENGTH + 1);
      expect(() => ReportValidators.validateReason(longReason)).toThrow(Libs.AppError);
      expect(() => ReportValidators.validateReason(longReason)).toThrow(
        `Reason must be no more than ${REPORT_REASON_MAX_LENGTH} characters`,
      );
    });
  });

  describe('validatePubky', () => {
    it('should return trimmed pubky for valid input', () => {
      const result = ReportValidators.validatePubky('  test-pubky  ');
      expect(result).toBe('test-pubky');
    });

    it('should throw AppError for empty string', () => {
      expect(() => ReportValidators.validatePubky('')).toThrow(Libs.AppError);
      expect(() => ReportValidators.validatePubky('')).toThrow('Pubky is required and must be a non-empty string');
    });

    it('should throw AppError for whitespace-only string', () => {
      expect(() => ReportValidators.validatePubky('   ')).toThrow(Libs.AppError);
    });

    it('should throw AppError for null', () => {
      expect(() => ReportValidators.validatePubky(null)).toThrow(Libs.AppError);
    });

    it('should throw AppError for undefined', () => {
      expect(() => ReportValidators.validatePubky(undefined)).toThrow(Libs.AppError);
    });
  });

  describe('validateName', () => {
    it('should return trimmed name for valid input', () => {
      const result = ReportValidators.validateName('  Test User  ');
      expect(result).toBe('Test User');
    });

    it('should throw AppError for empty string', () => {
      expect(() => ReportValidators.validateName('')).toThrow(Libs.AppError);
      expect(() => ReportValidators.validateName('')).toThrow('Name is required and must be a non-empty string');
    });

    it('should throw AppError for whitespace-only string', () => {
      expect(() => ReportValidators.validateName('   ')).toThrow(Libs.AppError);
    });

    it('should throw AppError for null', () => {
      expect(() => ReportValidators.validateName(null)).toThrow(Libs.AppError);
    });

    it('should throw AppError for undefined', () => {
      expect(() => ReportValidators.validateName(undefined)).toThrow(Libs.AppError);
    });
  });
});
