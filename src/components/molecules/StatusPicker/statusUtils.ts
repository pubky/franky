import { statusHelper } from './statusHelper';

const EMOJI_REGEX = /\p{RI}\p{RI}|\p{Extended_Pictographic}(?:\u200D\p{Extended_Pictographic})*/gu;

export interface ParsedStatus {
  emoji: string;
  text: string;
  isCustom: boolean;
}

function extractEmoji(status: string): string | null {
  const match = status.match(EMOJI_REGEX);
  return match ? match[0] : null;
}

export function parseStatus(status: string, defaultEmoji: string = '🌴'): ParsedStatus {
  if (!status) {
    return {
      emoji: statusHelper.emojis.vacationing,
      text: statusHelper.labels.vacationing,
      isCustom: false,
    };
  }

  const emoji = extractEmoji(status);
  if (emoji) {
    return {
      emoji,
      text: status.replace(EMOJI_REGEX, '').trim() || statusHelper.labels.noStatus,
      isCustom: true,
    };
  }

  // Predefined status
  const statusKey = status as keyof typeof statusHelper.labels;
  return {
    emoji: statusHelper.emojis[statusKey] || defaultEmoji,
    text: statusHelper.labels[statusKey] || status,
    isCustom: false,
  };
}

export function extractEmojiFromStatus(status: string, defaultEmoji: string = '🌴'): string {
  if (!status) {
    return statusHelper.emojis.vacationing;
  }

  const emoji = extractEmoji(status);
  if (emoji) {
    return emoji;
  }

  const statusKey = status as keyof typeof statusHelper.emojis;
  return statusHelper.emojis[statusKey] || defaultEmoji;
}
