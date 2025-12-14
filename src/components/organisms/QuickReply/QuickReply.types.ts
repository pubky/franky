import { QUICK_REPLY_PROMPTS } from './QuickReply.constants';

export type QuickReplyPrompt = (typeof QUICK_REPLY_PROMPTS)[number];

export interface QuickReplyProps {
  parentPostId: string;
}
