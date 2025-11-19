/**
 * Convert hours, minutes, and seconds to total seconds
 * Used by video providers to parse timestamps
 *
 * @param hours - Number of hours (can be undefined or string)
 * @param minutes - Number of minutes (can be undefined or string)
 * @param seconds - Number of seconds (can be undefined or string)
 * @returns Total seconds as a number
 *
 * @example
 * convertHmsToSeconds('1', '2', '3') // 3723 (1h 2m 3s)
 * convertHmsToSeconds(undefined, '5', '30') // 330 (5m 30s)
 * convertHmsToSeconds(undefined, undefined, '45') // 45 (45s)
 */
export const convertHmsToSeconds = (
  hours: string | undefined,
  minutes: string | undefined,
  seconds: string | undefined,
): number => {
  const h = parseInt(hours || '0', 10);
  const m = parseInt(minutes || '0', 10);
  const s = parseInt(seconds || '0', 10);
  return h * 3600 + m * 60 + s;
};
