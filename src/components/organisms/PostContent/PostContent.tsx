'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import * as Core from '@/core';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';
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
      <Molecules.PostText content={postDetails.content} />
      <Molecules.PostLinkEmbeds content={postDetails.content} />
      <Organisms.PostAttachments attachments={postDetails.attachments} />
    </Atoms.Container>
  );
}
