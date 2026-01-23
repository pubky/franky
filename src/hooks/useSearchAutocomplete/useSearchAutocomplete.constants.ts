/**
 * Search Autocomplete Constants
 *
 * Constants for search autocomplete functionality including debounce timing,
 * result limits, and user ID prefix handling.
 */

/** Debounce delay in milliseconds for autocomplete search */
export const AUTOCOMPLETE_DEBOUNCE_MS = 500;

/** Maximum number of tag suggestions to return */
export const AUTOCOMPLETE_TAG_LIMIT = 3;

/** Maximum number of user suggestions to return */
export const AUTOCOMPLETE_USER_LIMIT = 10;

/** Minimum character length for user ID searches after "pubky" prefix */
export const MIN_USER_ID_SEARCH_LENGTH = 3;

/** Prefix for user ID searches */
export const USER_ID_PREFIXES = ['pubky:', 'pk:'] as const;
