'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import * as Core from '@/core';

interface PostCountsProps {
  postId: string;
}

export function SinglePostCounts({ postId }: PostCountsProps) {
  const countsData = useLiveQuery(() => Core.db.post_counts.get(postId), [postId], null);

  const tagsCount = countsData?.tags ?? 0;
  const repliesCount = countsData?.replies ?? 0;
  const repostsCount = countsData?.reposts ?? 0;

  return (
    <Atoms.Container className="flex flex-row gap-2">
      <Atoms.Button variant="secondary" size="sm" className="flex items-center gap-1">
        <Libs.Tag className="h-4 w-4" />
        <Atoms.Typography size="sm">{tagsCount}</Atoms.Typography>
      </Atoms.Button>
      <Atoms.Button variant="secondary" size="sm" className="flex items-center gap-1">
        <Libs.MessageCircle className="h-4 w-4" />
        <Atoms.Typography size="sm">{repliesCount}</Atoms.Typography>
      </Atoms.Button>
      <Atoms.Button
        variant="secondary"
        size="sm"
        className="flex items-center gap-1"
        onClick={() => console.log('TODO: repost', postId)}
      >
        <Libs.RefreshCw className="h-4 w-4" />
        <Atoms.Typography size="sm">{repostsCount}</Atoms.Typography>
      </Atoms.Button>
      <Atoms.Button
        variant="secondary"
        size="sm"
        className="flex items-center gap-1"
        onClick={() => console.log('TODO: add to bookmarks', postId)}
      >
        <Libs.Bookmark className="h-4 w-4" />
      </Atoms.Button>
      <Atoms.Button variant="secondary" size="sm" className="flex items-center gap-1">
        <Libs.MoreHorizontal className="h-4 w-4" />
      </Atoms.Button>
    </Atoms.Container>
  );
}
