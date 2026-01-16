import { STATUS_LABELS, STATUS_EMOJIS, DEFAULT_STATUS, EMOJI_REGEX } from './status.constants';
import type { ParsedStatus, StatusKey } from './status.types';

/**
 * Extracts the first emoji from a string
 * @param status - The string to extract emoji from
 * @returns The first emoji found, or null if none
 */
function extractEmoji(status: string): string | null {
  const match = status.match(EMOJI_REGEX);
  return match ? match[0] : null;
}

/**
 * Parses a status string into its emoji and text components
 * Handles both predefined statuses (e.g., "vacationing") and custom statuses (e.g., "🎉 Birthday!")
 *
 * @param status - The status string to parse
 * @param defaultEmoji - Fallback emoji if none found (defaults to noStatus emoji)
 * @returns Parsed status object with emoji, text, and isCustom flag
 *
 * @example
 * // Predefined status
 * parseStatus('vacationing')
 * // => { emoji: '🌴', text: 'Vacationing', isCustom: false }
 *
 * @example
 * // Custom status
 * parseStatus('🎉 Birthday!')
 * // => { emoji: '🎉', text: 'Birthday!', isCustom: true }
 */
export function parseStatus(status: string, defaultEmoji: string = STATUS_EMOJIS[DEFAULT_STATUS]): ParsedStatus {
  if (!status) {
    return {
      emoji: STATUS_EMOJIS[DEFAULT_STATUS],
      text: STATUS_LABELS[DEFAULT_STATUS],
      isCustom: false,
    };
  }

  const emoji = extractEmoji(status);
  if (emoji) {
    return {
      emoji,
      text: status.replace(EMOJI_REGEX, '').trim() || STATUS_LABELS.noStatus,
      isCustom: true,
    };
  }

  // Predefined status
  const statusKey = status as StatusKey;
  return {
    emoji: STATUS_EMOJIS[statusKey] || defaultEmoji,
    text: STATUS_LABELS[statusKey] || status,
    isCustom: false,
  };
}

/**
 * Extracts just the emoji from a status string
 * Useful when you only need the emoji representation
 *
 * @param status - The status string to extract emoji from
 * @param defaultEmoji - Fallback emoji if none found (defaults to noStatus emoji)
 * @returns The emoji string
 *
 * @example
 * extractEmojiFromStatus('vacationing')
 * // => '🌴'
 *
 * @example
 * extractEmojiFromStatus('🎉 Birthday!')
 * // => '🎉'
 */
export function extractEmojiFromStatus(status: string, defaultEmoji: string = STATUS_EMOJIS[DEFAULT_STATUS]): string {
  if (!status) {
    return STATUS_EMOJIS[DEFAULT_STATUS];
  }

  const emoji = extractEmoji(status);
  if (emoji) {
    return emoji;
  }

  const statusKey = status as StatusKey;
  return STATUS_EMOJIS[statusKey] || defaultEmoji;
}
