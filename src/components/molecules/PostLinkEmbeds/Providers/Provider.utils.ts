/**
 * Regex pattern for parsing H:M:S timestamp format
 * Matches formats: "1h2m3s", "5m30s", "45s", "30" (plain seconds)
 *
 * Pattern breakdown:
 * - `(?:(\d+)h)?` - Optional hours with 'h' suffix
 * - `(?:(\d+)m)?` - Optional minutes with 'm' suffix
 * - `(?:(\d+)s?)?` - Optional seconds with optional 's' suffix
 *
 * The 's?' makes seconds suffix optional (allows "30" or "30s")
 * The outer '?' makes each entire group optional (allows "1h" or "5m" alone)
 *
 * @example
 * "1h2m3s".match(HMS_TIMESTAMP_REGEX) // ["1h2m3s", "1", "2", "3"]
 * "30s".match(HMS_TIMESTAMP_REGEX)    // ["30s", undefined, undefined, "30"]
 * "30".match(HMS_TIMESTAMP_REGEX)     // ["30", undefined, undefined, "30"]
 * "5m".match(HMS_TIMESTAMP_REGEX)     // ["5m", undefined, "5", undefined]
 * "30ss".match(HMS_TIMESTAMP_REGEX)   // null (rejected by $ anchor)
 */
export const HMS_TIMESTAMP_REGEX = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s?)?$/;

/**
 * Convert hours, minutes, and seconds to total seconds
 * Used by video providers to parse timestamps
 *
 * @param hours - Number of hours (can be undefined or string)
 * @param minutes - Number of minutes (can be undefined or string)
 * @param seconds - Number of seconds (can be undefined or string)
 * @returns Total seconds as a number, or null if any value is invalid (NaN)
 *
 * @security Defense in Depth
 * While regex validation should prevent malformed input, this function guards
 * against NaN propagation by returning null for invalid values. This prevents
 * silent failures where NaN could corrupt calculations downstream.
 *
 * @example
 * convertHmsToSeconds('1', '2', '3') // 3723 (1h 2m 3s)
 * convertHmsToSeconds(undefined, '5', '30') // 330 (5m 30s)
 * convertHmsToSeconds(undefined, undefined, '45') // 45 (45s)
 * convertHmsToSeconds('abc', '2', '3') // null (invalid input)
 */
export const convertHmsToSeconds = (
  hours: string | undefined,
  minutes: string | undefined,
  seconds: string | undefined,
): number | null => {
  const h = parseInt(hours || '0', 10);
  const m = parseInt(minutes || '0', 10);
  const s = parseInt(seconds || '0', 10);

  // Guard against NaN propagation (defense in depth)
  if (isNaN(h) || isNaN(m) || isNaN(s)) {
    return null;
  }

  return h * 3600 + m * 60 + s;
};
