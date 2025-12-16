export const QUICK_REPLY_PROMPTS = [
  'What are your thoughts on this?',
  'What do you think?',
  'Do you agree?',
  'Any additional insights?',
  'How would you respond?',
] as const;

/**
 * Height in pixels to account for spacing between main post and QuickReply in connector calculation.
 * The connector needs to extend upward to cover the gap.
 * 66px accounts for: PostThreadSpacer (16px = h-4) + gap between SinglePostCard and replies section (~50px)
 * This ensures the connector properly connects from the main post to QuickReply
 */
export const QUICK_REPLY_CONNECTOR_SPACER_HEIGHT = 66;
