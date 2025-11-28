import * as Core from '@/core';

export interface TimelinePostsProps {
  /**
   * Optional stream ID to use instead of filters
   * If provided, the component will fetch posts from this stream
   * If not provided, it will use the global filters to determine the stream
   */
  streamId?: Core.PostStreamId;
}
