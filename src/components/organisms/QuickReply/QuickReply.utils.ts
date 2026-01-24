import { QUICK_REPLY_PROMPTS_COUNT } from './QuickReply.constants';

/**
 * Returns a random index for quick reply prompts.
 * Use this index with translations: t(`quickReply.prompts.${index}`)
 */
export function pickRandomQuickReplyPromptIndex(): number {
  return Math.floor(Math.random() * QUICK_REPLY_PROMPTS_COUNT);
}
