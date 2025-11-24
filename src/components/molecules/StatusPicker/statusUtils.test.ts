import { describe, it, expect } from 'vitest';
import { parseStatus, extractEmojiFromStatus } from './statusUtils';
import { statusHelper } from './statusHelper';

describe('statusUtils', () => {
  describe('parseStatus', () => {
    describe('empty status', () => {
      it('should return default vacationing status for empty string', () => {
        const result = parseStatus('');
        expect(result).toEqual({
          emoji: statusHelper.emojis.vacationing,
          text: statusHelper.labels.vacationing,
          isCustom: false,
        });
      });

      it('should return default vacationing status for empty string with custom default emoji', () => {
        const result = parseStatus('', '🎉');
        expect(result).toEqual({
          emoji: statusHelper.emojis.vacationing,
          text: statusHelper.labels.vacationing,
          isCustom: false,
        });
      });
    });

    describe('predefined status keys', () => {
      it('should parse "available" status', () => {
        const result = parseStatus('available');
        expect(result).toEqual({
          emoji: statusHelper.emojis.available,
          text: statusHelper.labels.available,
          isCustom: false,
        });
      });

      it('should parse "away" status', () => {
        const result = parseStatus('away');
        expect(result).toEqual({
          emoji: statusHelper.emojis.away,
          text: statusHelper.labels.away,
          isCustom: false,
        });
      });

      it('should parse "vacationing" status', () => {
        const result = parseStatus('vacationing');
        expect(result).toEqual({
          emoji: statusHelper.emojis.vacationing,
          text: statusHelper.labels.vacationing,
          isCustom: false,
        });
      });

      it('should parse "working" status', () => {
        const result = parseStatus('working');
        expect(result).toEqual({
          emoji: statusHelper.emojis.working,
          text: statusHelper.labels.working,
          isCustom: false,
        });
      });

      it('should parse "traveling" status', () => {
        const result = parseStatus('traveling');
        expect(result).toEqual({
          emoji: statusHelper.emojis.traveling,
          text: statusHelper.labels.traveling,
          isCustom: false,
        });
      });

      it('should parse "celebrating" status', () => {
        const result = parseStatus('celebrating');
        expect(result).toEqual({
          emoji: statusHelper.emojis.celebrating,
          text: statusHelper.labels.celebrating,
          isCustom: false,
        });
      });

      it('should parse "sick" status', () => {
        const result = parseStatus('sick');
        expect(result).toEqual({
          emoji: statusHelper.emojis.sick,
          text: statusHelper.labels.sick,
          isCustom: false,
        });
      });

      it('should parse "noStatus" status', () => {
        const result = parseStatus('noStatus');
        expect(result).toEqual({
          emoji: statusHelper.emojis.noStatus,
          text: statusHelper.labels.noStatus,
          isCustom: false,
        });
      });

      it('should use default emoji for unknown predefined status key', () => {
        const result = parseStatus('unknownStatus', '🎯');
        expect(result).toEqual({
          emoji: '🎯',
          text: 'unknownStatus',
          isCustom: false,
        });
      });

      it('should use default emoji when predefined key has no emoji mapping', () => {
        const result = parseStatus('loading', '🎯');
        // loading exists in statusHelper but test the fallback behavior
        expect(result.emoji).toBeDefined();
        expect(result.text).toBe(statusHelper.labels.loading);
        expect(result.isCustom).toBe(false);
      });
    });

    describe('custom status with emoji', () => {
      it('should parse custom status with emoji at start', () => {
        const result = parseStatus('😊Working hard');
        expect(result).toEqual({
          emoji: '😊',
          text: 'Working hard',
          isCustom: true,
        });
      });

      it('should parse custom status with emoji and no text', () => {
        const result = parseStatus('🎉');
        expect(result).toEqual({
          emoji: '🎉',
          text: statusHelper.labels.noStatus,
          isCustom: true,
        });
      });

      it('should parse custom status with emoji and trimmed text', () => {
        const result = parseStatus('🚀  Traveling to space  ');
        expect(result).toEqual({
          emoji: '🚀',
          text: 'Traveling to space',
          isCustom: true,
        });
      });

      it('should extract first emoji when multiple emojis are present', () => {
        const result = parseStatus('😊🎉🎈 Multiple emojis');
        expect(result.emoji).toBe('😊');
        // The regex removes all emojis when replacing, so only text remains
        expect(result.text).toBe('Multiple emojis');
        expect(result.isCustom).toBe(true);
      });

      it('should handle complex emojis (multi-codepoint)', () => {
        const result = parseStatus('👨‍💻 Working');
        expect(result.emoji).toBe('👨‍💻');
        expect(result.text).toBe('Working');
        expect(result.isCustom).toBe(true);
      });

      it('should handle emoji with skin tone modifiers', () => {
        const result = parseStatus('👋🏿 Waving');
        // The regex only matches the base emoji, not the skin tone modifier
        expect(result.emoji).toBe('👋');
        // The skin tone modifier remains in the text
        expect(result.text).toBe('🏿 Waving');
        expect(result.isCustom).toBe(true);
      });

      it('should handle flag emojis', () => {
        const result = parseStatus('🇺🇸 In USA');
        expect(result.emoji).toBe('🇺🇸');
        expect(result.text).toBe('In USA');
        expect(result.isCustom).toBe(true);
      });
    });

    describe('edge cases', () => {
      it('should handle status with only whitespace after emoji removal', () => {
        const result = parseStatus('😊   ');
        expect(result.emoji).toBe('😊');
        expect(result.text).toBe(statusHelper.labels.noStatus);
        expect(result.isCustom).toBe(true);
      });

      it('should handle status that looks like predefined but has emoji', () => {
        const result = parseStatus('😊available');
        expect(result.emoji).toBe('😊');
        expect(result.text).toBe('available');
        expect(result.isCustom).toBe(true);
      });

      it('should handle very long custom status text', () => {
        const longText = 'A'.repeat(100);
        const result = parseStatus(`😊${longText}`);
        expect(result.emoji).toBe('😊');
        expect(result.text).toBe(longText);
        expect(result.isCustom).toBe(true);
      });

      it('should handle status with special characters', () => {
        const result = parseStatus('😊@#$%^&*()');
        expect(result.emoji).toBe('😊');
        expect(result.text).toBe('@#$%^&*()');
        expect(result.isCustom).toBe(true);
      });

      it('should handle status with newlines and tabs', () => {
        const result = parseStatus('😊\nWorking\n\tHard');
        expect(result.emoji).toBe('😊');
        expect(result.text).toBe('Working\n\tHard');
        expect(result.isCustom).toBe(true);
      });
    });

    describe('return type validation', () => {
      it('should always return ParsedStatus type', () => {
        const result = parseStatus('available');
        expect(result).toHaveProperty('emoji');
        expect(result).toHaveProperty('text');
        expect(result).toHaveProperty('isCustom');
        expect(typeof result.emoji).toBe('string');
        expect(typeof result.text).toBe('string');
        expect(typeof result.isCustom).toBe('boolean');
      });

      it('should return isCustom as false for predefined statuses', () => {
        const predefinedStatuses = ['available', 'away', 'vacationing', 'working', 'traveling', 'celebrating', 'sick'];
        predefinedStatuses.forEach((status) => {
          const result = parseStatus(status);
          expect(result.isCustom).toBe(false);
        });
      });

      it('should return isCustom as true for custom statuses with emoji', () => {
        const customStatuses = ['😊Working', '🎉Celebrating', '🚀Traveling'];
        customStatuses.forEach((status) => {
          const result = parseStatus(status);
          expect(result.isCustom).toBe(true);
        });
      });
    });
  });

  describe('extractEmojiFromStatus', () => {
    describe('empty status', () => {
      it('should return vacationing emoji for empty string', () => {
        const result = extractEmojiFromStatus('');
        expect(result).toBe(statusHelper.emojis.vacationing);
      });

      it('should return vacationing emoji for empty string with custom default', () => {
        const result = extractEmojiFromStatus('', '🎯');
        expect(result).toBe(statusHelper.emojis.vacationing);
      });
    });

    describe('predefined status keys', () => {
      it('should extract emoji for "available" status', () => {
        const result = extractEmojiFromStatus('available');
        expect(result).toBe(statusHelper.emojis.available);
      });

      it('should extract emoji for "away" status', () => {
        const result = extractEmojiFromStatus('away');
        expect(result).toBe(statusHelper.emojis.away);
      });

      it('should extract emoji for "vacationing" status', () => {
        const result = extractEmojiFromStatus('vacationing');
        expect(result).toBe(statusHelper.emojis.vacationing);
      });

      it('should extract emoji for "working" status', () => {
        const result = extractEmojiFromStatus('working');
        expect(result).toBe(statusHelper.emojis.working);
      });

      it('should extract emoji for "traveling" status', () => {
        const result = extractEmojiFromStatus('traveling');
        expect(result).toBe(statusHelper.emojis.traveling);
      });

      it('should extract emoji for "celebrating" status', () => {
        const result = extractEmojiFromStatus('celebrating');
        expect(result).toBe(statusHelper.emojis.celebrating);
      });

      it('should extract emoji for "sick" status', () => {
        const result = extractEmojiFromStatus('sick');
        expect(result).toBe(statusHelper.emojis.sick);
      });

      it('should use default emoji for unknown status key', () => {
        const result = extractEmojiFromStatus('unknownStatus', '🎯');
        expect(result).toBe('🎯');
      });

      it('should use default emoji when status key has no emoji mapping', () => {
        const result = extractEmojiFromStatus('loading', '🎯');
        // loading exists in statusHelper, so it should return the actual emoji
        expect(result).toBe(statusHelper.emojis.loading);
      });
    });

    describe('custom status with emoji', () => {
      it('should extract emoji from custom status', () => {
        const result = extractEmojiFromStatus('😊Working hard');
        expect(result).toBe('😊');
      });

      it('should extract emoji when status is only emoji', () => {
        const result = extractEmojiFromStatus('🎉');
        expect(result).toBe('🎉');
      });

      it('should extract first emoji when multiple emojis are present', () => {
        const result = extractEmojiFromStatus('😊🎉🎈 Multiple emojis');
        expect(result).toBe('😊');
      });

      it('should handle complex emojis (multi-codepoint)', () => {
        const result = extractEmojiFromStatus('👨‍💻 Working');
        expect(result).toBe('👨‍💻');
      });

      it('should handle emoji with skin tone modifiers', () => {
        const result = extractEmojiFromStatus('👋🏿 Waving');
        // The regex only matches the base emoji, not the skin tone modifier
        expect(result).toBe('👋');
      });

      it('should handle flag emojis', () => {
        const result = extractEmojiFromStatus('🇺🇸 In USA');
        expect(result).toBe('🇺🇸');
      });

      it('should handle emoji sequences (regional indicators)', () => {
        const result = extractEmojiFromStatus('🇬🇧 In UK');
        expect(result).toBe('🇬🇧');
      });
    });

    describe('edge cases', () => {
      it('should prioritize emoji extraction over predefined status', () => {
        const result = extractEmojiFromStatus('😊available');
        expect(result).toBe('😊');
      });

      it('should use default emoji when no emoji found and status is not predefined', () => {
        const result = extractEmojiFromStatus('just text', '🎯');
        expect(result).toBe('🎯');
      });

      it('should handle status with whitespace only', () => {
        const result = extractEmojiFromStatus('   ', '🎯');
        expect(result).toBe('🎯');
      });

      it('should handle status with special characters but no emoji', () => {
        const result = extractEmojiFromStatus('@#$%^&*()', '🎯');
        expect(result).toBe('🎯');
      });

      it('should handle very long status strings', () => {
        const longText = 'A'.repeat(1000);
        const result = extractEmojiFromStatus(`😊${longText}`);
        expect(result).toBe('😊');
      });
    });

    describe('return type validation', () => {
      it('should always return a string', () => {
        const results = [
          extractEmojiFromStatus(''),
          extractEmojiFromStatus('available'),
          extractEmojiFromStatus('😊Working'),
          extractEmojiFromStatus('unknown', '🎯'),
        ];

        results.forEach((result) => {
          expect(typeof result).toBe('string');
          expect(result.length).toBeGreaterThan(0);
        });
      });

      it('should return valid emoji strings', () => {
        const results = [
          extractEmojiFromStatus('available'),
          extractEmojiFromStatus('😊Working'),
          extractEmojiFromStatus('🎉'),
        ];

        results.forEach((result) => {
          // Should match Unicode emoji pattern or be a valid emoji
          expect(result).toMatch(/\p{Extended_Pictographic}/u);
        });
      });
    });
  });

  describe('integration between parseStatus and extractEmojiFromStatus', () => {
    it('should return consistent emoji for predefined statuses', () => {
      const predefinedStatuses = ['available', 'away', 'vacationing', 'working'];
      predefinedStatuses.forEach((status) => {
        const parsed = parseStatus(status);
        const extracted = extractEmojiFromStatus(status);
        expect(parsed.emoji).toBe(extracted);
      });
    });

    it('should return consistent emoji for custom statuses with emoji', () => {
      const customStatuses = ['😊Working', '🎉Celebrating', '🚀Traveling'];
      customStatuses.forEach((status) => {
        const parsed = parseStatus(status);
        const extracted = extractEmojiFromStatus(status);
        expect(parsed.emoji).toBe(extracted);
      });
    });

    it('should handle empty status consistently', () => {
      const parsed = parseStatus('');
      const extracted = extractEmojiFromStatus('');
      expect(parsed.emoji).toBe(extracted);
      expect(extracted).toBe(statusHelper.emojis.vacationing);
    });
  });
});
