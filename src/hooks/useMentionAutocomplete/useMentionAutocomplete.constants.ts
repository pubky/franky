/**
 * Mention Autocomplete Constants
 *
 * Constants for mention autocomplete functionality including debounce timing,
 * result limits, and pattern matching rules.
 */

/** Debounce delay in milliseconds for mention search */
export const MENTION_DEBOUNCE_MS = 250;

/** Maximum number of user suggestions to return */
export const MENTION_USER_LIMIT = 10;

/** Minimum character length for @ username searches */
export const MIN_USERNAME_SEARCH_LENGTH = 2;

/** Minimum character length for pk: ID searches */
export const MIN_USER_ID_SEARCH_LENGTH = 3;

/** Length of a complete pubky identifier (52 chars) */
export const COMPLETE_PUBKY_LENGTH = 52;

/** Regex pattern to match @username at end of text */
export const AT_PATTERN_END = /@[^\s]*$/;

/** Regex pattern to match pk:id at end of text */
export const PK_PATTERN_END = /pk:[^\s]*$/;

/** Prefix for pubky ID mentions */
export const PK_PREFIX = 'pk:';
