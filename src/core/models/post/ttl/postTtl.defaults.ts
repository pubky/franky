// Default TTL values for posts (in milliseconds)
export const DEFAULT_POST_TTL = {
  // 30 days default TTL for posts
  DEFAULT: 30 * 24 * 60 * 60 * 1000, // 30 days
  // 7 days for temporary posts
  TEMPORARY: 7 * 24 * 60 * 60 * 1000, // 7 days
  // 365 days for important posts
  LONG_TERM: 365 * 24 * 60 * 60 * 1000, // 1 year
};
