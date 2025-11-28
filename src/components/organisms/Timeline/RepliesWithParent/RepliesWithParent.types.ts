import * as Core from '@/core';

export interface TimelineRepliesWithParentProps {
  /**
   * Stream ID for the replies timeline
   */
  streamId: Core.PostStreamId;
}

export interface ReplyWithParentProps {
  replyPostId: string;
  onPostClick: (postId: string) => void;
}
