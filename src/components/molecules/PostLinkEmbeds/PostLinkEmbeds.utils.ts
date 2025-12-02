// ============================================================================
// Native URL Parser - Replaces linkify-it dependency
// ============================================================================

/**
 * URL matching regex pattern
 * Matches:
 * - URLs with http/https protocol: http://example.com, https://example.com
 * - URLs starting with www: www.example.com
 * - URLs without protocol: example.com/path (domain.tld followed by /)
 * - URLs with ports: http://localhost:3000
 * - URLs with paths, query strings, and fragments
 */
const URL_PATTERN =
  /(?:https?:\/\/|www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:\/[-a-zA-Z0-9()@:%_+.~#?&/=]*)?/gi;

/**
 * Protocol patterns to ignore when parsing URLs
 */
const IGNORED_PROTOCOL_PATTERNS = [/^ftp:/i, /^mailto:/i];

/**
 * Check if a URL should be ignored based on its protocol
 */
const shouldIgnoreUrl = (url: string): boolean => IGNORED_PROTOCOL_PATTERNS.some((pattern) => pattern.test(url));

/**
 * Normalize a URL by adding https:// if missing protocol
 */
const normalizeUrl = (url: string): string => {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `https://${url.startsWith('www.') ? url : url}`;
};

/**
 * Parse content for the first valid URL
 * Ignores ftp: and mailto: protocols
 * Returns the normalized URL or undefined if none found
 */
export const parseFirstUrl = (content: string): string | undefined => {
  const matches = content.match(URL_PATTERN);

  if (!matches) return undefined;

  // Find the first URL that isn't ignored
  for (const match of matches) {
    if (!shouldIgnoreUrl(match)) {
      return normalizeUrl(match);
    }
  }

  return undefined;
};

/**
 * Parse content for all valid URLs
 * Ignores ftp: and mailto: protocols
 * Returns an array of normalized URLs
 */
export const parseAllUrls = (content: string): string[] => {
  const matches = content.match(URL_PATTERN);

  if (!matches) return [];

  return matches.filter((url) => !shouldIgnoreUrl(url)).map(normalizeUrl);
};
