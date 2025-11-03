'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import * as Core from '@/core';

export interface PostContentOrganismProps {
  postId: string;
  className?: string;
}

export function PostContent({ postId, className }: PostContentOrganismProps) {
  // Fetch post details for content
  const postDetails = useLiveQuery(async () => {
    return await Core.PostDetailsModel.findById(postId);
  }, [postId]);

  if (!postDetails) {
    // TODO: Add skeleton loading component for PostContent
    return <div className="text-muted-foreground">Loading content...</div>;
  }

  return (
    <div className={className}>
      <p className="text-base font-medium text-secondary-foreground whitespace-pre-wrap">{postDetails.content}</p>
    </div>
  );
}
