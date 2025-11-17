'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import * as Core from '@/core';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
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
    <Atoms.Container className={Libs.cn('gap-3', className)}>
      <p className="text-base leading-6 font-medium break-all whitespace-pre-line text-secondary-foreground">
        {postDetails.content}
      </p>

      <Molecules.PostLinkEmbed content={postDetails.content} />
    </Atoms.Container>
  );
}
