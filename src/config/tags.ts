/**
 * Tag-related display configuration constants
 *
 * These are display/truncation limits, not validation limits.
 * For input validation limits, see posts.ts (TAG_MAX_LENGTH for max input length)
 */

// =============================================================================
// User List Item Display (Followers, Following, Active Users, Participants)
// =============================================================================

/** Maximum characters per tag before truncation in user list items */
export const USER_LIST_TAG_MAX_LENGTH = 8;

/** Maximum total characters across all displayed tags in user list items */
export const USER_LIST_TAGS_MAX_TOTAL_CHARS = 20;

/** Maximum number of tags to display in user list items */
export const USER_LIST_TAGS_MAX_COUNT = 3;

// =============================================================================
// Clickable Tags List Display (Default values, can be overridden via props)
// =============================================================================

/** Default maximum characters per tag before truncation in clickable tags list */
export const CLICKABLE_TAGS_DEFAULT_MAX_LENGTH = 8;

/** Default maximum total characters across all displayed tags in clickable tags list */
export const CLICKABLE_TAGS_DEFAULT_MAX_TOTAL_CHARS = 20;

/** Default maximum number of tags to display in clickable tags list */
export const CLICKABLE_TAGS_DEFAULT_MAX_TAGS = 3;
