import * as Core from '@/core';

export interface TimelineRepliesWithParentProps {
  /**
   * Stream ID for the replies timeline
   */
  streamId: Core.PostStreamId;
}

export interface ReplyWithParentProps {
  replyPostId: string;
  previousReplyId: string | null;
  onPostClick: (postId: string) => void;
}
