import React from 'react';

export interface PostPreviewCardProps {
  /** Post ID to display */
  postId: string;
  /** Additional content after PostContent (e.g., footer) */
  children?: React.ReactNode;
  /** Rendering inside a repost preview (prevents further nesting) */
  isRepostPreview?: boolean;
}
