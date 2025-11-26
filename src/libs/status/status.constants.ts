/**
 * Status labels for predefined status types
 */
export const STATUS_LABELS = {
  available: 'Available',
  away: 'Away',
  vacationing: 'Vacationing',
  working: 'Working',
  traveling: 'Traveling',
  celebrating: 'Celebrating',
  sick: 'Sick',
  noStatus: 'No Status',
  loading: 'Loading',
} as const;

/**
 * Default emojis for predefined status types
 */
export const STATUS_EMOJIS = {
  available: '👋',
  away: '🕓',
  vacationing: '🌴',
  working: '👨‍💻',
  traveling: '✈️',
  celebrating: '🥂',
  sick: '🤒',
  noStatus: '💭',
  loading: '⏳',
} as const;

/**
 * Default status when none is provided
 */
export const DEFAULT_STATUS = 'vacationing' as const;

/**
 * Emoji regex pattern for extracting emojis from strings
 * Matches Unicode emoji sequences including skin tones and combinations
 */
export const EMOJI_REGEX = /\p{RI}\p{RI}|\p{Extended_Pictographic}(?:\u200D\p{Extended_Pictographic})*/gu;
