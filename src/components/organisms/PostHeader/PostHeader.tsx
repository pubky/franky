'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import * as Core from '@/core';
import * as Libs from '@/libs';
import * as Atoms from '@/atoms';

export interface PostHeaderProps {
  postId: string;
  className?: string;
}

export function PostHeader({ postId, className }: PostHeaderProps) {
  const [userId] = postId.split(':');

  // Fetch post details to get indexed_at
  const postDetails = useLiveQuery(() => Core.PostController.getPostDetails({ compositeId: postId }), [postId]);

  // Fetch user details for avatar and name
  const userDetails = useLiveQuery(() => Core.UserController.getDetails({ userId }), [userId]);

  if (!postDetails || !userDetails) {
    // TODO: Add skeleton loading component for PostHeader
    return <div className="text-muted-foreground">Loading header...</div>;
  }

  const timeAgo = Libs.timeAgo(new Date(postDetails.indexed_at));

  return (
    <div className={Libs.cn('flex justify-between', className)}>
      <div className="flex gap-3">
        <Atoms.Avatar size="default">
          <Atoms.AvatarImage src={Core.FileController.getAvatarUrl(userId)} />
          <Atoms.AvatarFallback>{Libs.extractInitials({ name: userDetails.name, maxLength: 2 })}</Atoms.AvatarFallback>
        </Atoms.Avatar>
        <div className="flex flex-col">
          <span className="text-base font-bold text-foreground">{userDetails.name}</span>
          <span className="text-xs leading-4 font-medium tracking-[0.075rem] text-muted-foreground uppercase">
            @{Libs.formatPublicKey({ key: userId, length: 8 })}
          </span>
        </div>
      </div>
      {timeAgo && (
        <div className="flex items-center gap-1">
          <Libs.Clock className="size-4 text-muted-foreground" />
          <span className="text-xs leading-4 font-medium tracking-[0.075rem] text-muted-foreground">{timeAgo}</span>
        </div>
      )}
    </div>
  );
}
