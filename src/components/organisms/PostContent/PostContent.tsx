'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import * as Atoms from '@/atoms';
import * as Core from '@/core';

interface PostContentProps {
  postId: string;
}

export function PostContent({ postId }: PostContentProps) {
  const post = useLiveQuery(() => Core.PostController.findById(postId).then((post) => post), [postId]);

  if (!post) return null;

  return <Atoms.Typography className="whitespace-pre-line">{post.details.content}</Atoms.Typography>;
}