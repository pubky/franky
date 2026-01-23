import {
  MIN_USERNAME_SEARCH_LENGTH,
  MIN_USER_ID_SEARCH_LENGTH,
  COMPLETE_PUBKY_LENGTH,
  AT_PATTERN_END,
  PK_PATTERN_END,
  PK_PREFIX,
} from './useMentionAutocomplete.constants';

export interface ExtractedMentionQuery {
  /** The last valid @username query (without @ prefix), or null if none */
  atQuery: string | null;
  /** The last valid pk:id query (without pk: prefix), or null if none */
  pkQuery: string | null;
}

/**
 * Extract the last mention query from content
 *
 * Finds @username or pk:id pattern at the end of content and returns
 * the query if it should trigger a search.
 *
 * Filtering rules (matching pubky-app):
 * - @username: requires at least MIN_USERNAME_SEARCH_LENGTH (2) chars after @
 * - pk:id: requires at least MIN_USER_ID_SEARCH_LENGTH (3) chars after pk:
 * - pk:id: skips complete pubkeys (52+ alphanumeric chars)
 */
export function extractMentionQuery(content: string): ExtractedMentionQuery {
  let atQuery: string | null = null;
  let pkQuery: string | null = null;

  // Check for @username at end of content
  const atMatch = content.match(AT_PATTERN_END);
  if (atMatch) {
    const username = atMatch[0].slice(1); // Remove @ prefix
    if (username.length >= MIN_USERNAME_SEARCH_LENGTH) {
      atQuery = username;
    }
  }

  // Check for pk:id at end of content
  const pkMatch = content.match(PK_PATTERN_END);
  if (pkMatch) {
    const userId = pkMatch[0].slice(PK_PREFIX.length); // Remove pk: prefix
    const isCompletePubkey = userId.length >= COMPLETE_PUBKY_LENGTH && /^[a-z0-9]+$/.test(userId);
    if (!isCompletePubkey && userId.length >= MIN_USER_ID_SEARCH_LENGTH) {
      pkQuery = userId;
    }
  }

  return { atQuery, pkQuery };
}

/**
 * Replace mention pattern in content with user ID
 *
 * Finds the @username or pk:id pattern at the end of content
 * and replaces it with pk:{userId}.
 */
export function getContentWithMention(content: string, userId: string): string {
  // Check if there's a pk: pattern at the end of the text
  if (PK_PATTERN_END.test(content)) {
    return content.replace(PK_PATTERN_END, `${PK_PREFIX}${userId} `);
  }
  // Check if there's an @ pattern at the end of the text
  if (AT_PATTERN_END.test(content)) {
    return content.replace(AT_PATTERN_END, `${PK_PREFIX}${userId} `);
  }
  // Fallback: just append (with space before if content is not empty)
  const space = content.length > 0 ? ' ' : '';
  return content + `${space}${PK_PREFIX}${userId} `;
}
