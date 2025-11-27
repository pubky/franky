/**
 * HTML parsing utilities and patterns
 */

/**
 * Regex patterns for extracting OpenGraph metadata from HTML
 */
export const OG_PATTERNS = {
  /**
   * Patterns for matching og:title meta tags
   * Handles both property and name attributes in various orders
   */
  TITLE: [
    /<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i,
    /<meta\s+name=["']og:title["']\s+content=["']([^"']+)["']/i,
    /<meta\s+content=["']([^"']+)["']\s+property=["']og:title["']/i,
    /<meta\s+content=["']([^"']+)["']\s+name=["']og:title["']/i,
  ],

  /**
   * Pattern for matching HTML <title> tag
   */
  TITLE_TAG: /<title[^>]*>([^<]+)<\/title>/i,

  /**
   * Patterns for matching og:image meta tags
   * Handles both property and name attributes in various orders
   */
  IMAGE: [
    /<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i,
    /<meta\s+name=["']og:image["']\s+content=["']([^"']+)["']/i,
    /<meta\s+content=["']([^"']+)["']\s+property=["']og:image["']/i,
    /<meta\s+content=["']([^"']+)["']\s+name=["']og:image["']/i,
  ],
} as const;

/**
 * Extracts the first matching value from HTML using an array of regex patterns
 *
 * @param html - The HTML content to search
 * @param patterns - Array of regex patterns to try
 * @returns The first captured group that matches, or null if no match
 *
 * @example
 * const title = extractFromHtml(html, OG_PATTERNS.TITLE);
 */
export function extractFromHtml(html: string, patterns: readonly RegExp[]): string | null {
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      return match[1];
    }
  }
  return null;
}
