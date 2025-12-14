import { QUICK_REPLY_PROMPTS } from './QuickReply.constants';
import type { QuickReplyPrompt } from './QuickReply.types';

export function pickRandomQuickReplyPrompt(): QuickReplyPrompt {
  const idx = Math.floor(Math.random() * QUICK_REPLY_PROMPTS.length);
  return QUICK_REPLY_PROMPTS[idx] ?? QUICK_REPLY_PROMPTS[0];
}
