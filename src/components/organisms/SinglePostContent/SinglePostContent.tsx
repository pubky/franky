'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import * as Atoms from '@/atoms';
import * as Core from '@/core';

interface PostContentProps {
  postId: string;
}

export function SinglePostContent({ postId }: PostContentProps) {
  const postDetails = useLiveQuery(() => Core.db.post_details.get(postId).then((details) => details), [postId]);

  if (!postDetails) return null;

  return <Atoms.Typography className="whitespace-pre-line">{postDetails.content}</Atoms.Typography>;
}
