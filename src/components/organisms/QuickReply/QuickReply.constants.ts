/** Number of available quick reply prompts (must match quickReply.prompts array length in translations) */
export const QUICK_REPLY_PROMPTS_COUNT = 5;

/**
 * Height of PostThreadSpacer component in pixels.
 * Matches the h-4 Tailwind class (16px = 1rem).
 */
const POST_THREAD_SPACER_HEIGHT = 16;

/**
 * Approximate gap between SinglePostCard and replies section in pixels.
 * This accounts for the visual spacing in the layout.
 */
const SINGLE_POST_REPLIES_GAP = 50;

/**
 * Height in pixels to account for spacing between main post and QuickReply in connector calculation.
 * The connector needs to extend upward to cover the gap.
 * This ensures the connector properly connects from the main post to QuickReply
 */
export const QUICK_REPLY_CONNECTOR_SPACER_HEIGHT = POST_THREAD_SPACER_HEIGHT + SINGLE_POST_REPLIES_GAP;
