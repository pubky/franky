import { describe, it, expect } from 'vitest';
import { parseStatus, extractEmojiFromStatus } from './status';
import { STATUS_LABELS, STATUS_EMOJIS, DEFAULT_STATUS, EMOJI_REGEX } from './status.constants';

describe('status', () => {
  describe('constants', () => {
    describe('STATUS_LABELS', () => {
      it('should export all predefined status labels', () => {
        expect(STATUS_LABELS.available).toBe('Available');
        expect(STATUS_LABELS.away).toBe('Away');
        expect(STATUS_LABELS.vacationing).toBe('Vacationing');
        expect(STATUS_LABELS.working).toBe('Working');
        expect(STATUS_LABELS.traveling).toBe('Traveling');
        expect(STATUS_LABELS.celebrating).toBe('Celebrating');
        expect(STATUS_LABELS.sick).toBe('Sick');
        expect(STATUS_LABELS.noStatus).toBe('No Status');
        expect(STATUS_LABELS.loading).toBe('Loading');
      });

      it('should have all labels as non-empty strings', () => {
        Object.values(STATUS_LABELS).forEach((label) => {
          expect(typeof label).toBe('string');
          expect(label.length).toBeGreaterThan(0);
        });
      });

      it('should have consistent keys between labels and emojis', () => {
        const labelKeys = Object.keys(STATUS_LABELS).sort();
        const emojiKeys = Object.keys(STATUS_EMOJIS).sort();
        expect(labelKeys).toEqual(emojiKeys);
      });
    });

    describe('STATUS_EMOJIS', () => {
      it('should export all predefined status emojis', () => {
        expect(STATUS_EMOJIS.available).toBe('👋');
        expect(STATUS_EMOJIS.away).toBe('🕓');
        expect(STATUS_EMOJIS.vacationing).toBe('🌴');
        expect(STATUS_EMOJIS.working).toBe('👨‍💻');
        expect(STATUS_EMOJIS.traveling).toBe('✈️');
        expect(STATUS_EMOJIS.celebrating).toBe('🥂');
        expect(STATUS_EMOJIS.sick).toBe('🤒');
        expect(STATUS_EMOJIS.noStatus).toBe('💭');
        expect(STATUS_EMOJIS.loading).toBe('⏳');
      });

      it('should have all emojis as non-empty strings', () => {
        Object.values(STATUS_EMOJIS).forEach((emoji) => {
          expect(typeof emoji).toBe('string');
          expect(emoji.length).toBeGreaterThan(0);
        });
      });

      it('should have emojis that match Unicode emoji pattern', () => {
        Object.values(STATUS_EMOJIS).forEach((emoji) => {
          expect(emoji).toMatch(/\p{Extended_Pictographic}/u);
        });
      });
    });

    describe('DEFAULT_STATUS', () => {
      it('should be a valid status key', () => {
        expect(DEFAULT_STATUS).toBe('vacationing');
        expect(STATUS_LABELS[DEFAULT_STATUS]).toBeDefined();
        expect(STATUS_EMOJIS[DEFAULT_STATUS]).toBeDefined();
      });
    });

    describe('EMOJI_REGEX', () => {
      it('should match standard emojis', () => {
        expect('😊'.match(EMOJI_REGEX)?.[0]).toBe('😊');
        expect('🎉'.match(EMOJI_REGEX)?.[0]).toBe('🎉');
        expect('🚀'.match(EMOJI_REGEX)?.[0]).toBe('🚀');
      });

      it('should match complex emojis', () => {
        expect('👨‍💻'.match(EMOJI_REGEX)?.[0]).toBe('👨‍💻');
        expect('👋'.match(EMOJI_REGEX)?.[0]).toBe('👋');
      });

      it('should match flag emojis', () => {
        expect('🇺🇸'.match(EMOJI_REGEX)?.[0]).toBe('🇺🇸');
        expect('🇬🇧'.match(EMOJI_REGEX)?.[0]).toBe('🇬🇧');
      });
    });
  });

  describe('parseStatus', () => {
    describe('empty status', () => {
      it('should return default vacationing status for empty string', () => {
        const result = parseStatus('');
        expect(result).toEqual({
          emoji: STATUS_EMOJIS.vacationing,
          text: STATUS_LABELS.vacationing,
          isCustom: false,
        });
      });

      it('should return default vacationing status for empty string with custom default emoji', () => {
        const result = parseStatus('', '🎉');
        expect(result).toEqual({
          emoji: STATUS_EMOJIS.vacationing,
          text: STATUS_LABELS.vacationing,
          isCustom: false,
        });
      });
    });

    describe('predefined status keys', () => {
      it('should parse "available" status', () => {
        const result = parseStatus('available');
        expect(result).toEqual({
          emoji: STATUS_EMOJIS.available,
          text: STATUS_LABELS.available,
          isCustom: false,
        });
      });

      it('should parse "away" status', () => {
        const result = parseStatus('away');
        expect(result).toEqual({
          emoji: STATUS_EMOJIS.away,
          text: STATUS_LABELS.away,
          isCustom: false,
        });
      });

      it('should parse "vacationing" status', () => {
        const result = parseStatus('vacationing');
        expect(result).toEqual({
          emoji: STATUS_EMOJIS.vacationing,
          text: STATUS_LABELS.vacationing,
          isCustom: false,
        });
      });

      it('should parse "working" status', () => {
        const result = parseStatus('working');
        expect(result).toEqual({
          emoji: STATUS_EMOJIS.working,
          text: STATUS_LABELS.working,
          isCustom: false,
        });
      });

      it('should parse "traveling" status', () => {
        const result = parseStatus('traveling');
        expect(result).toEqual({
          emoji: STATUS_EMOJIS.traveling,
          text: STATUS_LABELS.traveling,
          isCustom: false,
        });
      });

      it('should parse "celebrating" status', () => {
        const result = parseStatus('celebrating');
        expect(result).toEqual({
          emoji: STATUS_EMOJIS.celebrating,
          text: STATUS_LABELS.celebrating,
          isCustom: false,
        });
      });

      it('should parse "sick" status', () => {
        const result = parseStatus('sick');
        expect(result).toEqual({
          emoji: STATUS_EMOJIS.sick,
          text: STATUS_LABELS.sick,
          isCustom: false,
        });
      });

      it('should parse "noStatus" status', () => {
        const result = parseStatus('noStatus');
        expect(result).toEqual({
          emoji: STATUS_EMOJIS.noStatus,
          text: STATUS_LABELS.noStatus,
          isCustom: false,
        });
      });

      it('should treat unknown status key as text-only custom status', () => {
        const result = parseStatus('unknownStatus', '🎯');
        expect(result).toEqual({
          emoji: '',
          text: 'unknownStatus',
          isCustom: true,
        });
      });

      it('should handle text-only custom status', () => {
        const result = parseStatus('Working hard');
        expect(result).toEqual({
          emoji: '',
          text: 'Working hard',
          isCustom: true,
        });
      });

      it('should use default emoji when predefined key has no emoji mapping', () => {
        const result = parseStatus('loading', '🎯');
        expect(result.emoji).toBeDefined();
        expect(result.text).toBe(STATUS_LABELS.loading);
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
          text: STATUS_LABELS.noStatus,
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
        expect(result.emoji).toBe('👋🏿');
        expect(result.text).toBe('Waving');
        expect(result.isCustom).toBe(true);
      });

      it('should handle flag emojis', () => {
        const result = parseStatus('🇺🇸 In USA');
        expect(result.emoji).toBe('🇺🇸');
        expect(result.text).toBe('In USA');
        expect(result.isCustom).toBe(true);
      });

      it('should handle multi-codepoint emojis with skin tones in ZWJ sequences', () => {
        const result = parseStatus('👨🏻‍💻 Coding');
        expect(result.emoji).toBe('👨🏻‍💻');
        expect(result.text).toBe('Coding');
        expect(result.isCustom).toBe(true);
      });

      it('should handle emojis with variation selectors', () => {
        const result = parseStatus('☹️ Sad');
        expect(result.emoji).toBe('☹️');
        expect(result.text).toBe('Sad');
        expect(result.isCustom).toBe(true);
      });

      it('should handle family emoji sequences', () => {
        const result = parseStatus('👨‍👩‍👧‍👦 Family time');
        expect(result.emoji).toBe('👨‍👩‍👧‍👦');
        expect(result.text).toBe('Family time');
        expect(result.isCustom).toBe(true);
      });
    });

    describe('edge cases', () => {
      it('should handle status with only whitespace after emoji removal', () => {
        const result = parseStatus('😊   ');
        expect(result.emoji).toBe('😊');
        expect(result.text).toBe(STATUS_LABELS.noStatus);
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
        expect(result).toBe(STATUS_EMOJIS.vacationing);
      });

      it('should return vacationing emoji for empty string with custom default', () => {
        const result = extractEmojiFromStatus('', '🎯');
        expect(result).toBe(STATUS_EMOJIS.vacationing);
      });
    });

    describe('predefined status keys', () => {
      it('should extract emoji for "available" status', () => {
        const result = extractEmojiFromStatus('available');
        expect(result).toBe(STATUS_EMOJIS.available);
      });

      it('should extract emoji for "away" status', () => {
        const result = extractEmojiFromStatus('away');
        expect(result).toBe(STATUS_EMOJIS.away);
      });

      it('should extract emoji for "vacationing" status', () => {
        const result = extractEmojiFromStatus('vacationing');
        expect(result).toBe(STATUS_EMOJIS.vacationing);
      });

      it('should extract emoji for "working" status', () => {
        const result = extractEmojiFromStatus('working');
        expect(result).toBe(STATUS_EMOJIS.working);
      });

      it('should extract emoji for "traveling" status', () => {
        const result = extractEmojiFromStatus('traveling');
        expect(result).toBe(STATUS_EMOJIS.traveling);
      });

      it('should extract emoji for "celebrating" status', () => {
        const result = extractEmojiFromStatus('celebrating');
        expect(result).toBe(STATUS_EMOJIS.celebrating);
      });

      it('should extract emoji for "sick" status', () => {
        const result = extractEmojiFromStatus('sick');
        expect(result).toBe(STATUS_EMOJIS.sick);
      });

      it('should return empty string for unknown status key (text-only custom)', () => {
        const result = extractEmojiFromStatus('unknownStatus', '🎯');
        expect(result).toBe('');
      });

      it('should use default emoji when status key has no emoji mapping', () => {
        const result = extractEmojiFromStatus('loading', '🎯');
        expect(result).toBe(STATUS_EMOJIS.loading);
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
        expect(result).toBe('👋🏿');
      });

      it('should handle flag emojis', () => {
        const result = extractEmojiFromStatus('🇺🇸 In USA');
        expect(result).toBe('🇺🇸');
      });

      it('should handle emoji sequences (regional indicators)', () => {
        const result = extractEmojiFromStatus('🇬🇧 In UK');
        expect(result).toBe('🇬🇧');
      });

      it('should handle multi-codepoint emojis with skin tones in ZWJ sequences', () => {
        const result = extractEmojiFromStatus('👨🏻‍💻 Coding');
        expect(result).toBe('👨🏻‍💻');
      });

      it('should handle emojis with variation selectors', () => {
        const result = extractEmojiFromStatus('☹️ Sad');
        expect(result).toBe('☹️');
      });

      it('should handle family emoji sequences', () => {
        const result = extractEmojiFromStatus('👨‍👩‍👧‍👦 Family time');
        expect(result).toBe('👨‍👩‍👧‍👦');
      });
    });

    describe('edge cases', () => {
      it('should prioritize emoji extraction over predefined status', () => {
        const result = extractEmojiFromStatus('😊available');
        expect(result).toBe('😊');
      });

      it('should return empty string for text-only custom status', () => {
        const result = extractEmojiFromStatus('just text', '🎯');
        expect(result).toBe('');
      });

      it('should return empty string for whitespace-only status', () => {
        const result = extractEmojiFromStatus('   ', '🎯');
        expect(result).toBe('');
      });

      it('should return empty string for status with special characters but no emoji', () => {
        const result = extractEmojiFromStatus('@#$%^&*()', '🎯');
        expect(result).toBe('');
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
        });
      });

      it('should return valid emoji strings for predefined and emoji statuses', () => {
        const results = [
          extractEmojiFromStatus('available'),
          extractEmojiFromStatus('😊Working'),
          extractEmojiFromStatus('🎉'),
        ];

        results.forEach((result) => {
          expect(result).toMatch(/\p{Extended_Pictographic}/u);
        });
      });

      it('should return empty string for text-only custom statuses', () => {
        const result = extractEmojiFromStatus('custom text');
        expect(result).toBe('');
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
      expect(extracted).toBe(STATUS_EMOJIS.vacationing);
    });
  });
});
