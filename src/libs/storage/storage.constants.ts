/**
 * LocalStorage keys used across the application
 */
export const STORAGE_KEYS = {
  /** Whether to show confirmation dialog before opening external links */
  CHECK_LINK: 'checkLink',
  /** Whether to blur censored content */
  BLUR_CENSORED: 'blurCensored',
} as const;

/**
 * Default values for storage keys
 */
export const STORAGE_DEFAULTS = {
  [STORAGE_KEYS.CHECK_LINK]: true,
  [STORAGE_KEYS.BLUR_CENSORED]: true,
} as const;
