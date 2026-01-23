/**
 * Formats the invite code input by:
 * - Converting to uppercase
 * - Removing non-alphanumeric characters
 * - Auto-inserting dashes after the 4th and 8th characters
 * - Limiting to 12 alphanumeric characters (14 with dashes)
 *
 * @param value - The raw input value to format
 * @returns The formatted invite code string (e.g., "XXXX-XXXX-XXXX")
 */
export function formatInviteCode(value: string): string {
  // Remove all non-alphanumeric characters and convert to uppercase
  const alphanumeric = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();

  // Limit to 12 characters (the format is XXXX-XXXX-XXXX = 12 alphanumeric chars)
  const limited = alphanumeric.slice(0, 12);

  // Insert dashes after 4th and 8th characters
  const parts: string[] = [];
  if (limited.length > 0) {
    parts.push(limited.slice(0, 4));
  }
  if (limited.length > 4) {
    parts.push(limited.slice(4, 8));
  }
  if (limited.length > 8) {
    parts.push(limited.slice(8, 12));
  }

  return parts.join('-');
}
