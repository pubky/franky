'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import * as Core from '@/core';

interface PostUserDetailsProps {
  postId: string;
}

export function PostUserDetails({ postId }: PostUserDetailsProps) {
  const postDetails = useLiveQuery(() => Core.db.post_details.get(postId).then((details) => details), [postId]);

  if (!postDetails) return null;

  const author = postDetails.author;
  const indexedAt = postDetails.indexed_at;

  return (
    <Atoms.Container className="flex items-center gap-3">
      <Atoms.Container className="flex flex-row gap-4">
        <Atoms.Avatar className="w-12 h-12">
          <Atoms.AvatarImage src="/images/default-avatar.png" />
          <Atoms.AvatarFallback>{author.charAt(0).toUpperCase()}</Atoms.AvatarFallback>
        </Atoms.Avatar>
        <Atoms.Container className="flex flex-col">
          <Atoms.Typography size="md" className="font-bold">
            {author}
          </Atoms.Typography>
          <Atoms.Container className="flex flex-row gap-2">
            <Atoms.Typography size="sm" className="text-muted-foreground">
              {shorten(author).toUpperCase()}
            </Atoms.Typography>
            <Atoms.Container className="flex flex-row gap-1 items-center">
              <Libs.Clock className="h-4 w-4 text-muted-foreground" />
              <Atoms.Typography size="sm" className="text-muted-foreground">
                {timeAgo(new Date(indexedAt))}
              </Atoms.Typography>
            </Atoms.Container>
          </Atoms.Container>
        </Atoms.Container>
      </Atoms.Container>
    </Atoms.Container>
  );
}

// TODO: use proper helper/util
function shorten(value: string, chars: number = 4) {
  if (value.length <= chars * 2) {
    return value;
  }
  return `${value.slice(0, chars)}...${value.slice(-chars)}`;
}

// TODO: use proper helper/util
function timeAgo(date: Date) {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;

  // For older posts, show the date
  return date.toLocaleDateString();
}
