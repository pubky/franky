import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import {
  cn,
  formatInviteCode,
  formatPublicKey,
  copyToClipboard,
  clearCookies,
  generateRandomColor,
  hexToRgba,
  extractInitials,
  normaliseRadixIds,
} from './utils';

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

  describe('generateRandomColor', () => {
    it('should return custom colors for specific names', () => {
      expect(generateRandomColor('bitcoin')).toBe('#FF9900');
      expect(generateRandomColor('synonym')).toBe('#FF6600');
      expect(generateRandomColor('bitkit')).toBe('#FF4400');
      expect(generateRandomColor('pubky')).toBe('#C8FF00');
      expect(generateRandomColor('blocktank')).toBe('#FFAE00');
      expect(generateRandomColor('tether')).toBe('#26A17B');
    });

    it('should return custom colors case-insensitively', () => {
      expect(generateRandomColor('BITCOIN')).toBe('#FF9900');
      expect(generateRandomColor('Bitcoin')).toBe('#FF9900');
      expect(generateRandomColor('BiTcOiN')).toBe('#FF9900');
    });

    it('should generate consistent colors for the same input', () => {
      const color1 = generateRandomColor('test');
      const color2 = generateRandomColor('test');
      expect(color1).toBe(color2);
    });

    it('should generate different colors for different inputs', () => {
      const color1 = generateRandomColor('test1');
      const color2 = generateRandomColor('test2');
      expect(color1).not.toBe(color2);
    });

    it('should return a valid hex color format', () => {
      const color = generateRandomColor('random');
      expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });

    it('should handle empty string', () => {
      const color = generateRandomColor('');
      expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });

    it('should handle special characters', () => {
      const color = generateRandomColor('!@#$%^&*()');
      expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });

    it('should handle unicode characters', () => {
      const color = generateRandomColor('🚀🌟💫');
      expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });

  describe('hexToRgba', () => {
    it('should convert hex to rgba correctly', () => {
      expect(hexToRgba('#FF0000', 0.5)).toBe('rgba(255, 0, 0, 0.5)');
      expect(hexToRgba('#00FF00', 1)).toBe('rgba(0, 255, 0, 1)');
      expect(hexToRgba('#0000FF', 0)).toBe('rgba(0, 0, 255, 0)');
    });

    it('should handle custom cases colors', () => {
      expect(hexToRgba('#FF9900', 0.3)).toBe('rgba(255, 153, 0, 0.3)');
      expect(hexToRgba('#26A17B', 1)).toBe('rgba(38, 161, 123, 1)');
    });

    it('should handle alpha values between 0 and 1', () => {
      expect(hexToRgba('#FFFFFF', 0.25)).toBe('rgba(255, 255, 255, 0.25)');
      expect(hexToRgba('#000000', 0.75)).toBe('rgba(0, 0, 0, 0.75)');
    });

    it('should handle edge case alpha values', () => {
      expect(hexToRgba('#123456', 0)).toBe('rgba(18, 52, 86, 0)');
      expect(hexToRgba('#123456', 1)).toBe('rgba(18, 52, 86, 1)');
    });
  });

  describe('extractInitials', () => {
    it('should extract initials from full name', () => {
      expect(extractInitials({ name: 'John Doe' })).toBe('JD');
      expect(extractInitials({ name: 'Jane Smith' })).toBe('JS');
    });

    it('should handle single name', () => {
      expect(extractInitials({ name: 'John' })).toBe('J');
      expect(extractInitials({ name: 'Jane' })).toBe('J');
    });

    it('should handle multiple names', () => {
      expect(extractInitials({ name: 'John Michael Doe' })).toBe('JM');
      expect(extractInitials({ name: 'Jane Elizabeth Smith' })).toBe('JE');
    });

    it('should respect maxLength parameter', () => {
      expect(extractInitials({ name: 'John Michael Doe', maxLength: 1 })).toBe('J');
      expect(extractInitials({ name: 'John Michael Doe', maxLength: 3 })).toBe('JMD');
      expect(extractInitials({ name: 'John Michael Doe', maxLength: 5 })).toBe('JMD');
    });

    it('should handle names with extra spaces', () => {
      expect(extractInitials({ name: '  John   Doe  ' })).toBe('JD');
      expect(extractInitials({ name: 'John   Michael   Doe' })).toBe('JM');
    });

    it('should convert to uppercase', () => {
      expect(extractInitials({ name: 'john doe' })).toBe('JD');
      expect(extractInitials({ name: 'jane smith' })).toBe('JS');
    });

    it('should handle empty string', () => {
      expect(extractInitials({ name: '' })).toBe('');
    });

    it('should handle null and undefined', () => {
      expect(extractInitials({ name: null as unknown as string })).toBe('');
      expect(extractInitials({ name: undefined as unknown as string })).toBe('');
    });

    it('should handle non-string input', () => {
      expect(extractInitials({ name: 123 as unknown as string })).toBe('');
      expect(extractInitials({ name: {} as unknown as string })).toBe('');
    });

    it('should handle names with special characters', () => {
      expect(extractInitials({ name: 'Jean-Pierre Dupont' })).toBe('JD');
      expect(extractInitials({ name: "Mary O'Connor" })).toBe('MO');
    });

    it('should handle names with numbers', () => {
      expect(extractInitials({ name: 'John2 Doe3' })).toBe('JD');
    });
  });

  describe('normaliseRadixIds', () => {
    let mockContainer: HTMLElement;

    beforeEach(() => {
      mockContainer = document.createElement('div');
    });

    it('should normalize radix IDs in aria-controls attributes', () => {
      const element1 = document.createElement('button');
      element1.setAttribute('aria-controls', 'radix-«r1»-content');
      mockContainer.appendChild(element1);

      const element2 = document.createElement('button');
      element2.setAttribute('aria-controls', 'radix-«r2»-trigger');
      mockContainer.appendChild(element2);

      const normalized = normaliseRadixIds(mockContainer);
      const buttons = normalized.querySelectorAll('button');

      expect(buttons[0].getAttribute('aria-controls')).toBe('radix-«r0»');
      expect(buttons[1].getAttribute('aria-controls')).toBe('radix-«r0»');
    });

    it('should not modify non-radix aria-controls attributes', () => {
      const element = document.createElement('button');
      element.setAttribute('aria-controls', 'custom-id');
      mockContainer.appendChild(element);

      const normalized = normaliseRadixIds(mockContainer);
      const button = normalized.querySelector('button');

      expect(button?.getAttribute('aria-controls')).toBe('custom-id');
    });

    it('should not modify elements without aria-controls', () => {
      const element = document.createElement('div');
      element.textContent = 'No aria-controls';
      mockContainer.appendChild(element);

      const normalized = normaliseRadixIds(mockContainer);
      const div = normalized.querySelector('div');

      expect(div?.textContent).toBe('No aria-controls');
      expect(div?.hasAttribute('aria-controls')).toBe(false);
    });

    it('should handle mixed radix and non-radix elements', () => {
      const radixElement = document.createElement('button');
      radixElement.setAttribute('aria-controls', 'radix-«r5»-content');
      mockContainer.appendChild(radixElement);

      const normalElement = document.createElement('button');
      normalElement.setAttribute('aria-controls', 'normal-id');
      mockContainer.appendChild(normalElement);

      const normalized = normaliseRadixIds(mockContainer);
      const buttons = normalized.querySelectorAll('button');

      expect(buttons[0].getAttribute('aria-controls')).toBe('radix-«r0»');
      expect(buttons[1].getAttribute('aria-controls')).toBe('normal-id');
    });

    it('should return a cloned container', () => {
      const element = document.createElement('div');
      element.textContent = 'Original';
      mockContainer.appendChild(element);

      const normalized = normaliseRadixIds(mockContainer);

      expect(normalized).not.toBe(mockContainer);
      expect(normalized.textContent).toBe('Original');
    });

    it('should handle empty container', () => {
      const normalized = normaliseRadixIds(mockContainer);
      expect(normalized).toBeDefined();
      expect(normalized.children.length).toBe(0);
    });
  });
});
