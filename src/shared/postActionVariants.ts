/**
 * Shared constants for post action variants
 * Used across hooks, components, and related utilities
 */

export const POST_ACTION_VARIANT = {
  REPLY: 'reply',
  REPOST: 'repost',
  NEW: 'new',
} as const;

export type PostActionVariant = (typeof POST_ACTION_VARIANT)[keyof typeof POST_ACTION_VARIANT];

/**
 * Placeholder text for each variant
 */
export const POST_ACTION_PLACEHOLDERS: Record<PostActionVariant, string> = {
  [POST_ACTION_VARIANT.REPLY]: 'Write a reply...',
  [POST_ACTION_VARIANT.REPOST]: 'Optional comment',
  [POST_ACTION_VARIANT.NEW]: "What's on your mind?",
};

/**
 * Variants that require content to be non-empty
 */
export const VARIANTS_REQUIRING_CONTENT: PostActionVariant[] = [POST_ACTION_VARIANT.REPLY, POST_ACTION_VARIANT.NEW];

/**
 * Variants that require a postId
 */
export const VARIANTS_REQUIRING_POST_ID: PostActionVariant[] = [POST_ACTION_VARIANT.REPLY, POST_ACTION_VARIANT.REPOST];

/**
 * Check if a variant requires content
 */
export function requiresContent(variant: PostActionVariant): boolean {
  return VARIANTS_REQUIRING_CONTENT.includes(variant);
}

/**
 * Check if a variant requires a postId
 */
export function requiresPostId(variant: PostActionVariant): boolean {
  return VARIANTS_REQUIRING_POST_ID.includes(variant);
}
