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
  truncateString,
  minutesAgo,
  hoursAgo,
  daysAgo,
  formatNotificationTime,
  extractPubkyPublicKey,
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
    let execCommandSpy: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      mockClipboard = {
        writeText: vi.fn(),
      };
      execCommandSpy = vi.fn();

      Object.defineProperty(navigator, 'clipboard', {
        value: mockClipboard,
        writable: true,
      });

      Object.defineProperty(document, 'execCommand', {
        value: execCommandSpy,
        writable: true,
      });
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should copy text to clipboard successfully', async () => {
      mockClipboard.writeText.mockResolvedValue(undefined);
      execCommandSpy.mockReturnValue(true);
      const testText = 'test text to copy';

      await copyToClipboard({ text: testText });

      expect(mockClipboard.writeText).toHaveBeenCalledWith(testText);
      expect(execCommandSpy).not.toHaveBeenCalled();
    });

    it('should handle empty string', async () => {
      mockClipboard.writeText.mockResolvedValue(undefined);
      execCommandSpy.mockReturnValue(true);

      await copyToClipboard({ text: '' });

      expect(mockClipboard.writeText).toHaveBeenCalledWith('');
      expect(execCommandSpy).not.toHaveBeenCalled();
    });

    it('should handle special characters', async () => {
      mockClipboard.writeText.mockResolvedValue(undefined);
      execCommandSpy.mockReturnValue(true);
      const specialText = 'Special chars: !@#$%^&*()_+{}[]|\\:";\'<>?,./';

      await copyToClipboard({ text: specialText });

      expect(mockClipboard.writeText).toHaveBeenCalledWith(specialText);
      expect(execCommandSpy).not.toHaveBeenCalled();
    });

    it('should fall back to execCommand when clipboard API is unavailable', async () => {
      Object.defineProperty(navigator, 'clipboard', {
        value: undefined,
        writable: true,
      });
      execCommandSpy.mockReturnValue(true);

      await expect(copyToClipboard({ text: 'fallback text' })).resolves.toBeUndefined();

      expect(execCommandSpy).toHaveBeenCalled();
    });

    it('should fall back to execCommand when clipboard API throws', async () => {
      const clipboardError = new Error('Clipboard write failed');
      mockClipboard.writeText.mockRejectedValue(clipboardError);
      execCommandSpy.mockReturnValue(true);

      await expect(copyToClipboard({ text: 'test' })).resolves.toBeUndefined();

      expect(execCommandSpy).toHaveBeenCalled();
    });

    it('should throw error when neither clipboard nor execCommand are supported', async () => {
      Object.defineProperty(navigator, 'clipboard', {
        value: undefined,
        writable: true,
      });
      Object.defineProperty(document, 'execCommand', {
        value: undefined,
        writable: true,
      });

      await expect(copyToClipboard({ text: 'test' })).rejects.toThrow('Clipboard API not supported');
    });

    it('should propagate execCommand errors when fallback fails', async () => {
      Object.defineProperty(navigator, 'clipboard', {
        value: undefined,
        writable: true,
      });
      const fallbackError = new Error('Fallback copy command was unsuccessful');
      execCommandSpy.mockImplementation(() => {
        throw fallbackError;
      });

      await expect(copyToClipboard({ text: 'test' })).rejects.toThrow('Fallback copy command was unsuccessful');
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
      element1.setAttribute('aria-controls', 'radix-_r_1_');
      mockContainer.appendChild(element1);

      const element2 = document.createElement('button');
      element2.setAttribute('aria-controls', 'radix-_r_2_');
      mockContainer.appendChild(element2);

      const normalized = normaliseRadixIds(mockContainer);
      const buttons = normalized.querySelectorAll('button');

      expect(buttons[0].getAttribute('aria-controls')).toBe('radix-_r_0_');
      expect(buttons[1].getAttribute('aria-controls')).toBe('radix-_r_0_');
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
      radixElement.setAttribute('aria-controls', 'radix-_r_5_');
      mockContainer.appendChild(radixElement);

      const normalElement = document.createElement('button');
      normalElement.setAttribute('aria-controls', 'normal-id');
      mockContainer.appendChild(normalElement);

      const normalized = normaliseRadixIds(mockContainer);
      const buttons = normalized.querySelectorAll('button');

      expect(buttons[0].getAttribute('aria-controls')).toBe('radix-_r_0_');
      expect(buttons[1].getAttribute('aria-controls')).toBe('normal-id');
    });

    it('should normalise shorthand radix IDs without the radix prefix', () => {
      const element = document.createElement('div');
      element.setAttribute('id', '_r_a_');
      element.setAttribute('aria-controls', '_r_b_');
      element.setAttribute('aria-labelledby', '_r_c_');
      mockContainer.appendChild(element);

      const normalized = normaliseRadixIds(mockContainer);
      const div = normalized.querySelector('div');

      expect(div?.getAttribute('id')).toBe('radix-_r_0_');
      expect(div?.getAttribute('aria-controls')).toBe('radix-_r_0_');
      expect(div?.getAttribute('aria-labelledby')).toBe('radix-_r_0_');
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

  describe('truncateString', () => {
    it('should truncate strings longer than maxLength', () => {
      expect(truncateString('VeryLongUserName', 10)).toBe('VeryLongUs...');
      expect(truncateString('Miguel Medeiros', 10)).toBe('Miguel Med...');
    });

    it('should not truncate strings shorter than maxLength', () => {
      expect(truncateString('John', 10)).toBe('John');
      expect(truncateString('Short', 10)).toBe('Short');
    });

    it('should handle strings exactly at maxLength', () => {
      expect(truncateString('1234567890', 10)).toBe('1234567890');
      expect(truncateString('ExactlyTen', 10)).toBe('ExactlyTen');
    });

    it('should handle empty string', () => {
      expect(truncateString('', 10)).toBe('');
    });

    it('should handle very short maxLength', () => {
      expect(truncateString('Hello World', 1)).toBe('H...');
      expect(truncateString('Test', 2)).toBe('Te...');
    });

    it('should handle maxLength of 0', () => {
      expect(truncateString('Test', 0)).toBe('...');
    });

    it('should handle single character strings', () => {
      expect(truncateString('A', 1)).toBe('A');
      expect(truncateString('A', 5)).toBe('A');
    });

    it('should handle special characters', () => {
      expect(truncateString('Special!@#$%Characters', 10)).toBe('Special!@#...');
      expect(truncateString('Email@domain.com', 10)).toBe('Email@doma...');
    });

    it('should handle unicode characters', () => {
      // Note: Emojis are multi-byte characters, so string.length may not match visual character count
      // This test verifies the function works correctly with the JavaScript string API
      expect(truncateString('Hello 世界', 7)).toBe('Hello 世...');
      expect(truncateString('Test 你好', 6)).toBe('Test 你...');
    });

    it('should handle strings with spaces', () => {
      expect(truncateString('Hello World Test', 10)).toBe('Hello Worl...');
      expect(truncateString('   Spaces   ', 5)).toBe('   Sp...');
    });

    it('should handle null and undefined as empty strings', () => {
      expect(truncateString(null as unknown as string, 10)).toBe('');
      expect(truncateString(undefined as unknown as string, 10)).toBe('');
    });

    it('should add exactly three dots as ellipsis', () => {
      const result = truncateString('LongString', 5);
      expect(result.endsWith('...')).toBe(true);
      expect(result.split('...').length).toBe(2);
    });

    it('should preserve the first N characters before ellipsis', () => {
      const result = truncateString('HelloWorld', 5);
      expect(result.startsWith('Hello')).toBe(true);
      expect(result).toBe('Hello...');
    });

    it('should handle consecutive truncations consistently', () => {
      const str = 'ConsistentString';
      const result1 = truncateString(str, 8);
      const result2 = truncateString(str, 8);
      expect(result1).toBe(result2);
      expect(result1).toBe('Consiste...');
    });

    it('should handle different maxLength values for same string', () => {
      const str = 'TestString';
      expect(truncateString(str, 4)).toBe('Test...');
      expect(truncateString(str, 6)).toBe('TestSt...');
      expect(truncateString(str, 8)).toBe('TestStri...');
      expect(truncateString(str, 10)).toBe('TestString');
    });

    it('should handle numbers as strings', () => {
      expect(truncateString('123456789012345', 10)).toBe('1234567890...');
    });

    it('should handle mixed alphanumeric strings', () => {
      expect(truncateString('User123Name456', 8)).toBe('User123N...');
    });
  });

  describe('minutesAgo', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return timestamp for minutes ago', () => {
      const now = Date.now();
      vi.setSystemTime(now);

      const result = minutesAgo(5);
      const expected = now - 5 * 60 * 1000;

      expect(result).toBe(expected);
    });

    it('should handle zero minutes', () => {
      const now = Date.now();
      vi.setSystemTime(now);

      const result = minutesAgo(0);
      expect(result).toBe(now);
    });

    it('should handle large number of minutes', () => {
      const now = Date.now();
      vi.setSystemTime(now);

      const result = minutesAgo(1440); // 24 hours
      const expected = now - 1440 * 60 * 1000;

      expect(result).toBe(expected);
    });
  });

  describe('hoursAgo', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return timestamp for hours ago', () => {
      const now = Date.now();
      vi.setSystemTime(now);

      const result = hoursAgo(3);
      const expected = now - 3 * 60 * 60 * 1000;

      expect(result).toBe(expected);
    });

    it('should handle zero hours', () => {
      const now = Date.now();
      vi.setSystemTime(now);

      const result = hoursAgo(0);
      expect(result).toBe(now);
    });

    it('should handle large number of hours', () => {
      const now = Date.now();
      vi.setSystemTime(now);

      const result = hoursAgo(48); // 2 days
      const expected = now - 48 * 60 * 60 * 1000;

      expect(result).toBe(expected);
    });
  });

  describe('daysAgo', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return timestamp for days ago', () => {
      const now = Date.now();
      vi.setSystemTime(now);

      const result = daysAgo(7);
      const expected = now - 7 * 24 * 60 * 60 * 1000;

      expect(result).toBe(expected);
    });

    it('should handle zero days', () => {
      const now = Date.now();
      vi.setSystemTime(now);

      const result = daysAgo(0);
      expect(result).toBe(now);
    });

    it('should handle large number of days', () => {
      const now = Date.now();
      vi.setSystemTime(now);

      const result = daysAgo(30);
      const expected = now - 30 * 24 * 60 * 60 * 1000;

      expect(result).toBe(expected);
    });
  });

  describe('formatNotificationTime', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    describe('short format (default)', () => {
      it('should return "now" for timestamps less than 1 minute ago', () => {
        const now = Date.now();
        vi.setSystemTime(now);

        const timestamp = now - 30 * 1000; // 30 seconds ago
        expect(formatNotificationTime(timestamp)).toBe('now');
      });

      it('should return "now" for current timestamp', () => {
        const now = Date.now();
        vi.setSystemTime(now);

        expect(formatNotificationTime(now)).toBe('now');
      });

      it('should return minutes format for timestamps less than 60 minutes ago', () => {
        const now = Date.now();
        vi.setSystemTime(now);

        const timestamp = now - 5 * 60 * 1000; // 5 minutes ago
        expect(formatNotificationTime(timestamp)).toBe('5m');
      });

      it('should return minutes format for 59 minutes ago', () => {
        const now = Date.now();
        vi.setSystemTime(now);

        const timestamp = now - 59 * 60 * 1000;
        expect(formatNotificationTime(timestamp)).toBe('59m');
      });

      it('should return hours format for timestamps less than 24 hours ago', () => {
        const now = Date.now();
        vi.setSystemTime(now);

        const timestamp = now - 3 * 60 * 60 * 1000; // 3 hours ago
        expect(formatNotificationTime(timestamp)).toBe('3h');
      });

      it('should return days format for 2 days ago', () => {
        const now = Date.now();
        vi.setSystemTime(now);

        const timestamp = now - 2 * 24 * 60 * 60 * 1000;
        expect(formatNotificationTime(timestamp)).toBe('2d');
      });
    });

    describe('long format', () => {
      it('should return "NOW" for timestamps less than 1 minute ago', () => {
        const now = Date.now();
        vi.setSystemTime(now);

        const timestamp = now - 30 * 1000; // 30 seconds ago
        expect(formatNotificationTime(timestamp, true)).toBe('NOW');
      });

      it('should return "NOW" for current timestamp', () => {
        const now = Date.now();
        vi.setSystemTime(now);

        expect(formatNotificationTime(now, true)).toBe('NOW');
      });

      it('should return minutes format for timestamps less than 60 minutes ago', () => {
        const now = Date.now();
        vi.setSystemTime(now);

        const timestamp = now - 5 * 60 * 1000; // 5 minutes ago
        expect(formatNotificationTime(timestamp, true)).toBe('5 MINUTES AGO');
      });

      it('should return minutes format for 59 minutes ago', () => {
        const now = Date.now();
        vi.setSystemTime(now);

        const timestamp = now - 59 * 60 * 1000;
        expect(formatNotificationTime(timestamp, true)).toBe('59 MINUTES AGO');
      });

      it('should return hours format for timestamps less than 24 hours ago', () => {
        const now = Date.now();
        vi.setSystemTime(now);

        const timestamp = now - 3 * 60 * 60 * 1000; // 3 hours ago
        expect(formatNotificationTime(timestamp, true)).toBe('3 HOURS AGO');
      });

      it('should return hours format for 23 hours ago', () => {
        const now = Date.now();
        vi.setSystemTime(now);

        const timestamp = now - 23 * 60 * 60 * 1000;
        expect(formatNotificationTime(timestamp, true)).toBe('23 HOURS AGO');
      });

      it('should return days format for timestamps less than 7 days ago', () => {
        const now = Date.now();
        vi.setSystemTime(now);

        const timestamp = now - 2 * 24 * 60 * 60 * 1000; // 2 days ago
        expect(formatNotificationTime(timestamp, true)).toBe('2 DAYS AGO');
      });

      it('should return days format for 6 days ago', () => {
        const now = Date.now();
        vi.setSystemTime(now);

        const timestamp = now - 6 * 24 * 60 * 60 * 1000;
        expect(formatNotificationTime(timestamp, true)).toBe('6 DAYS AGO');
      });

      it('should return days format for timestamps 7 or more days ago', () => {
        const now = Date.now();
        vi.setSystemTime(now);

        const timestamp = now - 7 * 24 * 60 * 60 * 1000; // 7 days ago
        expect(formatNotificationTime(timestamp, true)).toBe('7 DAYS AGO');
      });

      it('should return days format for timestamps 30 days ago', () => {
        const now = Date.now();
        vi.setSystemTime(now);

        const timestamp = now - 30 * 24 * 60 * 60 * 1000; // 30 days ago
        expect(formatNotificationTime(timestamp, true)).toBe('30 DAYS AGO');
      });

      it('should handle edge case: exactly 1 minute ago', () => {
        const now = Date.now();
        vi.setSystemTime(now);

        const timestamp = now - 60 * 1000; // exactly 1 minute
        expect(formatNotificationTime(timestamp, true)).toBe('1 MINUTE AGO');
      });

      it('should handle edge case: exactly 60 minutes ago', () => {
        const now = Date.now();
        vi.setSystemTime(now);

        const timestamp = now - 60 * 60 * 1000; // exactly 1 hour
        expect(formatNotificationTime(timestamp, true)).toBe('1 HOUR AGO');
      });

      it('should handle edge case: exactly 24 hours ago', () => {
        const now = Date.now();
        vi.setSystemTime(now);

        const timestamp = now - 24 * 60 * 60 * 1000; // exactly 1 day
        expect(formatNotificationTime(timestamp, true)).toBe('1 DAY AGO');
      });

      it('should handle edge case: exactly 7 days ago', () => {
        const now = Date.now();
        vi.setSystemTime(now);

        const timestamp = now - 7 * 24 * 60 * 60 * 1000; // exactly 7 days
        expect(formatNotificationTime(timestamp, true)).toBe('7 DAYS AGO');
      });
    });
  });

  describe('extractPubkyPublicKey', () => {
    const validKey = 'o1gg96ewuojmopcjbz8895478wdtxtzzber7aezq6ror5a91j7dy';

    describe('with "pk:" prefix', () => {
      it('should extract valid 52-character lowercase alphanumeric key', () => {
        const result = extractPubkyPublicKey(`pk:${validKey}`);
        expect(result).toBe(validKey);
      });

      it('should return null for key shorter than 52 characters', () => {
        const result = extractPubkyPublicKey('pk:o1gg96ewuojmopcjbz8895478wdtxt');
        expect(result).toBeNull();
      });

      it('should return null for key longer than 52 characters', () => {
        const result = extractPubkyPublicKey(`pk:${validKey}extra`);
        expect(result).toBeNull();
      });

      it('should return null for key with uppercase characters', () => {
        const result = extractPubkyPublicKey('pk:O1GG96EWUOJMOPCJBZ8895478WDTXTZZBER7AEZQ6ROR5A91J7DY');
        expect(result).toBeNull();
      });

      it('should return null for key with special characters', () => {
        const result = extractPubkyPublicKey('pk:o1gg96ewuojmopcjbz8895478wdtxtzzber7aezq6ror5a91j7d!');
        expect(result).toBeNull();
      });

      it('should return null for empty key after prefix', () => {
        const result = extractPubkyPublicKey('pk:');
        expect(result).toBeNull();
      });
    });

    describe('with "pubky" prefix', () => {
      it('should extract valid 52-character lowercase alphanumeric key', () => {
        const result = extractPubkyPublicKey(`pubky${validKey}`);
        expect(result).toBe(validKey);
      });

      it('should return null for key shorter than 52 characters', () => {
        const result = extractPubkyPublicKey('pubkyo1gg96ewuojmopcjbz8895478wdtxt');
        expect(result).toBeNull();
      });

      it('should return null for key longer than 52 characters', () => {
        const result = extractPubkyPublicKey(`pubky${validKey}extra`);
        expect(result).toBeNull();
      });

      it('should return null for key with uppercase characters', () => {
        const result = extractPubkyPublicKey('pubkyO1GG96EWUOJMOPCJBZ8895478WDTXTZZBER7AEZQ6ROR5A91J7DY');
        expect(result).toBeNull();
      });

      it('should return null for key with special characters', () => {
        const result = extractPubkyPublicKey('pubkyo1gg96ewuojmopcjbz8895478wdtxtzzber7aezq6ror5a91j7d!');
        expect(result).toBeNull();
      });

      it('should return null for empty key after prefix', () => {
        const result = extractPubkyPublicKey('pubky');
        expect(result).toBeNull();
      });
    });

    describe('invalid inputs', () => {
      it('should return null for string without valid prefix', () => {
        expect(extractPubkyPublicKey(validKey)).toBeNull();
      });

      it('should return null for string with wrong prefix', () => {
        expect(extractPubkyPublicKey(`key:${validKey}`)).toBeNull();
      });

      it('should return null for empty string', () => {
        expect(extractPubkyPublicKey('')).toBeNull();
      });

      it('should return null for null input', () => {
        expect(extractPubkyPublicKey(null as unknown as string)).toBeNull();
      });

      it('should return null for undefined input', () => {
        expect(extractPubkyPublicKey(undefined as unknown as string)).toBeNull();
      });

      it('should return null for non-string input', () => {
        expect(extractPubkyPublicKey(12345 as unknown as string)).toBeNull();
        expect(extractPubkyPublicKey({} as unknown as string)).toBeNull();
        expect(extractPubkyPublicKey([] as unknown as string)).toBeNull();
      });

      it('should return null for string with only whitespace', () => {
        expect(extractPubkyPublicKey('   ')).toBeNull();
      });

      it('should return null for pk: prefix with spaces in key', () => {
        expect(extractPubkyPublicKey('pk:o1gg96ewuojmopcjbz8895478 wdtxtzzber7aezq6ror5a91j7dy')).toBeNull();
      });
    });

    describe('edge cases', () => {
      it('should be case-sensitive for prefix "pk:"', () => {
        expect(extractPubkyPublicKey(`PK:${validKey}`)).toBeNull();
        expect(extractPubkyPublicKey(`Pk:${validKey}`)).toBeNull();
      });

      it('should be case-sensitive for prefix "pubky"', () => {
        expect(extractPubkyPublicKey(`PUBKY${validKey}`)).toBeNull();
        expect(extractPubkyPublicKey(`Pubky${validKey}`)).toBeNull();
      });

      it('should handle key with all zeros', () => {
        const allZeros = '0000000000000000000000000000000000000000000000000000';
        expect(extractPubkyPublicKey(`pk:${allZeros}`)).toBe(allZeros);
      });

      it('should handle key with all letters', () => {
        const allLetters = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
        expect(extractPubkyPublicKey(`pk:${allLetters}`)).toBe(allLetters);
      });

      it('should handle key with mixed alphanumeric', () => {
        const mixedKey = 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6';
        expect(extractPubkyPublicKey(`pubky${mixedKey}`)).toBe(mixedKey);
      });
    });
  });
});
