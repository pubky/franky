import { describe, it, expect } from 'vitest';
import { FeedbackValidators } from './feedback.validators';
import { FEEDBACK_MAX_CHARACTER_LENGTH } from '@/config';
import * as Libs from '@/libs';

describe('FeedbackValidators', () => {
  describe('validatePubky', () => {
    it('should return trimmed pubky for valid input', () => {
      const result = FeedbackValidators.validatePubky('  test-pubky  ');
      expect(result).toBe('test-pubky');
    });

    it('should throw AppError for empty string', () => {
      expect(() => FeedbackValidators.validatePubky('')).toThrow(Libs.AppError);
      expect(() => FeedbackValidators.validatePubky('')).toThrow('Pubky is required and must be a non-empty string');
    });

    it('should throw AppError for whitespace-only string', () => {
      expect(() => FeedbackValidators.validatePubky('   ')).toThrow(Libs.AppError);
    });

    it('should throw AppError for null', () => {
      expect(() => FeedbackValidators.validatePubky(null)).toThrow(Libs.AppError);
    });

    it('should throw AppError for undefined', () => {
      expect(() => FeedbackValidators.validatePubky(undefined)).toThrow(Libs.AppError);
    });
  });

  describe('validateComment', () => {
    it('should return trimmed comment for valid input', () => {
      const result = FeedbackValidators.validateComment('  test comment  ');
      expect(result).toBe('test comment');
    });

    it('should throw AppError for empty string', () => {
      expect(() => FeedbackValidators.validateComment('')).toThrow(Libs.AppError);
      expect(() => FeedbackValidators.validateComment('')).toThrow(
        'Comment is required and must be a non-empty string',
      );
    });

    it('should throw AppError for whitespace-only string', () => {
      expect(() => FeedbackValidators.validateComment('   ')).toThrow(Libs.AppError);
    });

    it('should throw AppError for null', () => {
      expect(() => FeedbackValidators.validateComment(null)).toThrow(Libs.AppError);
    });

    it('should throw AppError for undefined', () => {
      expect(() => FeedbackValidators.validateComment(undefined)).toThrow(Libs.AppError);
    });

    it('should accept comment at max length', () => {
      const maxComment = 'a'.repeat(FEEDBACK_MAX_CHARACTER_LENGTH);
      const result = FeedbackValidators.validateComment(maxComment);
      expect(result).toBe(maxComment);
    });

    it('should throw AppError for comment exceeding max length', () => {
      const longComment = 'a'.repeat(FEEDBACK_MAX_CHARACTER_LENGTH + 1);
      expect(() => FeedbackValidators.validateComment(longComment)).toThrow(Libs.AppError);
      expect(() => FeedbackValidators.validateComment(longComment)).toThrow(
        `Comment must be at most ${FEEDBACK_MAX_CHARACTER_LENGTH} characters`,
      );
    });
  });

  describe('validateName', () => {
    it('should return trimmed name for valid input', () => {
      const result = FeedbackValidators.validateName('  Test User  ');
      expect(result).toBe('Test User');
    });

    it('should throw AppError for empty string', () => {
      expect(() => FeedbackValidators.validateName('')).toThrow(Libs.AppError);
      expect(() => FeedbackValidators.validateName('')).toThrow('Name is required and must be a non-empty string');
    });

    it('should throw AppError for whitespace-only string', () => {
      expect(() => FeedbackValidators.validateName('   ')).toThrow(Libs.AppError);
    });

    it('should throw AppError for null', () => {
      expect(() => FeedbackValidators.validateName(null)).toThrow(Libs.AppError);
    });

    it('should throw AppError for undefined', () => {
      expect(() => FeedbackValidators.validateName(undefined)).toThrow(Libs.AppError);
    });
  });
});
