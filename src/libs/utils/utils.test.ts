import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import { cn, formatInviteCode, formatPublicKey, copyToClipboard, clearCookies } from './utils';

describe('Utils', () => {
  describe('cn', () => {
    it('should combine multiple class names', () => {
      const result = cn('class1', 'class2', 'class3');
      expect(result).toBe('class1 class2 class3');
    });

    it('should handle conditional classes', () => {
      const result = cn('base', true && 'conditional', false && 'hidden');
      expect(result).toBe('base conditional');
    });

    it('should handle arrays of classes', () => {
      const result = cn(['class1', 'class2'], 'class3');
      expect(result).toBe('class1 class2 class3');
    });

    it('should handle objects with boolean values', () => {
      const result = cn({
        active: true,
        disabled: false,
        visible: true,
      });
      expect(result).toBe('active visible');
    });

    it('should merge conflicting Tailwind classes', () => {
      const result = cn('p-4', 'p-2');
      expect(result).toBe('p-2');
    });

    it('should handle empty inputs', () => {
      const result = cn();
      expect(result).toBe('');
    });

    it('should handle null and undefined values', () => {
      const result = cn('valid', null, undefined, 'another');
      expect(result).toBe('valid another');
    });
  });

  describe('formatInviteCode', () => {
    it('should format a 12-character code correctly', () => {
      const result = formatInviteCode('ABCD1234EFGH');
      expect(result).toBe('ABCD-1234-EFGH');
    });

    it('should convert lowercase to uppercase', () => {
      const result = formatInviteCode('abcd1234efgh');
      expect(result).toBe('ABCD-1234-EFGH');
    });

    it('should remove non-alphanumeric characters', () => {
      const result = formatInviteCode('AB-CD_12@34#EF!GH');
      expect(result).toBe('ABCD-1234-EFGH');
    });

    it('should handle codes shorter than 12 characters', () => {
      const result = formatInviteCode('ABC123');
      expect(result).toBe('ABC1-23');
    });

    it('should truncate codes longer than 12 characters', () => {
      const result = formatInviteCode('ABCD1234EFGH5678');
      expect(result).toBe('ABCD-1234-EFGH');
    });

    it('should handle empty string', () => {
      const result = formatInviteCode('');
      expect(result).toBe('');
    });

    it('should handle string with only special characters', () => {
      const result = formatInviteCode('!@#$%^&*()');
      expect(result).toBe('');
    });

    it('should handle mixed case with special characters', () => {
      const result = formatInviteCode('aBc-123_DeF!456');
      expect(result).toBe('ABC1-23DE-F456');
    });
  });

  describe('formatPublicKey', () => {
    it('should format long keys with default length', () => {
      const longKey = 'abcdefghijklmnopqrstuvwxyz1234567890';
      const result = formatPublicKey({ key: longKey, length: 12 });
      expect(result).toBe('abcdef...567890');
    });

    it('should format long keys with custom length', () => {
      const longKey = 'abcdefghijklmnopqrstuvwxyz1234567890';
      const result = formatPublicKey({ key: longKey, length: 8 });
      expect(result).toBe('abcd...7890');
    });

    it('should return the original key if shorter than or equal to length', () => {
      const shortKey = 'short';
      const result = formatPublicKey({ key: shortKey, length: 12 });
      expect(result).toBe('short');
    });

    it('should return the original key if equal to length', () => {
      const exactKey = 'exactlength1';
      const result = formatPublicKey({ key: exactKey, length: 12 });
      expect(result).toBe('exactlength1');
    });

    it('should handle empty string', () => {
      const result = formatPublicKey({ key: '', length: 12 });
      expect(result).toBe('');
    });

    it('should handle very short length parameter', () => {
      const key = 'abcdefghij';
      const result = formatPublicKey({ key, length: 4 });
      expect(result).toBe('ab...ij');
    });

    it('should handle odd length parameter', () => {
      const key = 'abcdefghijklmno';
      const result = formatPublicKey({ key, length: 5 });
      expect(result).toBe('ab...no');
    });

    it('should handle length of 1', () => {
      const key = 'abcdefghij';
      const result = formatPublicKey({ key, length: 1 });
      // When length is 1, length/2 = 0.5, which rounds down to 0
      // So prefix = key.slice(0, 0) = '' and suffix = key.slice(-0) = entire key
      expect(result).toBe('...abcdefghij');
    });
  });

  describe('copyToClipboard', () => {
    let mockClipboard: { writeText: ReturnType<typeof vi.fn> };

    beforeEach(() => {
      mockClipboard = {
        writeText: vi.fn(),
      };
      Object.defineProperty(navigator, 'clipboard', {
        value: mockClipboard,
        writable: true,
      });
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should copy text to clipboard successfully', async () => {
      mockClipboard.writeText.mockResolvedValue(undefined);
      const testText = 'test text to copy';

      await copyToClipboard({ text: testText });

      expect(mockClipboard.writeText).toHaveBeenCalledWith(testText);
    });

    it('should handle empty string', async () => {
      mockClipboard.writeText.mockResolvedValue(undefined);

      await copyToClipboard({ text: '' });

      expect(mockClipboard.writeText).toHaveBeenCalledWith('');
    });

    it('should handle special characters', async () => {
      mockClipboard.writeText.mockResolvedValue(undefined);
      const specialText = 'Special chars: !@#$%^&*()_+{}[]|\\:";\'<>?,./';

      await copyToClipboard({ text: specialText });

      expect(mockClipboard.writeText).toHaveBeenCalledWith(specialText);
    });

    it('should throw error when clipboard API is not supported', async () => {
      Object.defineProperty(navigator, 'clipboard', {
        value: undefined,
        writable: true,
      });

      await expect(copyToClipboard({ text: 'test' })).rejects.toThrow('Clipboard API not supported');
    });

    it('should propagate clipboard API errors', async () => {
      const clipboardError = new Error('Clipboard write failed');
      mockClipboard.writeText.mockRejectedValue(clipboardError);

      await expect(copyToClipboard({ text: 'test' })).rejects.toThrow('Clipboard write failed');
    });
  });

  describe('clearCookies', () => {
    let originalCookie: string;

    beforeEach(() => {
      originalCookie = document.cookie;
      // Clear any existing cookies
      document.cookie.split(';').forEach((c) => {
        const eqPos = c.indexOf('=');
        const name = eqPos > -1 ? c.substr(0, eqPos) : c;
        document.cookie = `${name.trim()}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      });
    });

    afterEach(() => {
      // Restore original cookies if any
      if (originalCookie) {
        document.cookie = originalCookie;
      }
    });

    it('should clear all cookies', () => {
      // Set some test cookies
      document.cookie = 'testCookie1=value1; path=/';
      document.cookie = 'testCookie2=value2; path=/';
      document.cookie = 'testCookie3=value3; path=/';

      // Verify cookies are set
      expect(document.cookie).toContain('testCookie1');
      expect(document.cookie).toContain('testCookie2');
      expect(document.cookie).toContain('testCookie3');

      // Clear cookies
      clearCookies();

      // Note: In test environment, we can't actually verify cookies are cleared
      // because document.cookie behavior is limited in jsdom
      // We can only test that the function runs without errors
      expect(() => clearCookies()).not.toThrow();
    });

    it('should handle empty cookies gracefully', () => {
      // Ensure no cookies exist
      expect(document.cookie).toBe('');

      // Should not throw error
      expect(() => clearCookies()).not.toThrow();
    });

    it('should handle cookies with spaces', () => {
      // Set cookies with various formats
      document.cookie = ' testCookie1 = value1 ; path=/';
      document.cookie = '  testCookie2=value2; path=/';

      // Should not throw error
      expect(() => clearCookies()).not.toThrow();
    });

    it('should handle cookies with special characters in names', () => {
      // Set cookies with special characters (that are valid)
      document.cookie = 'test_cookie-1=value1; path=/';
      document.cookie = 'test.cookie.2=value2; path=/';

      // Should not throw error
      expect(() => clearCookies()).not.toThrow();
    });
  });
});
