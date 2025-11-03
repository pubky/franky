'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import * as Core from '@/core';
import * as Libs from '@/libs';

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
    <div className={Libs.cn('flex flex-col gap-3 rounded-xl', className)}>
      <p className="text-base leading-6 font-medium text-secondary-foreground break-all whitespace-pre-line">
        {postDetails.content}
      </p>
    </div>
  );
}
