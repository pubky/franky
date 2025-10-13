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
  const postDetails = useLiveQuery(async () => {
    return await Core.PostDetailsModel.findById(postId);
  }, [postId]);

  // Fetch user details for avatar and name
  const userDetails = useLiveQuery(async () => {
    try {
      return await Core.ProfileController.read({ user_id: userId as Core.Pubky });
    } catch (error) {
      console.error('Error fetching user details:', error);
      return null;
    }
  }, [userId]);

  if (!postDetails || !userDetails) {
    // TODO: Add skeleton loading component for PostHeader
    return <div className="text-muted-foreground">Loading header...</div>;
  }

  return (
    <div className={Libs.cn('flex items-start justify-between w-full', className)}>
      <div className="flex items-center gap-3">
        <Atoms.Avatar size="lg">
          <Atoms.AvatarImage src={userDetails.image || undefined} />
          <Atoms.AvatarFallback>{Libs.extractInitials({ name: userDetails.name, maxLength: 2 })}</Atoms.AvatarFallback>
        </Atoms.Avatar>
        <div className="flex flex-col">
          <span className="text-base leading-6 font-bold text-foreground">{userDetails.name}</span>
          <span className="text-xs leading-4 font-medium tracking-[0.075em] uppercase text-muted-foreground">
            @{Libs.formatPublicKey({ key: userId, length: 8 })}
          </span>
        </div>
      </div>
      {Libs.timeAgo(new Date(postDetails.indexed_at)) && (
        <div className="flex items-center gap-1 text-xs font-medium tracking-[0.075em] text-muted-foreground">
          <Libs.Clock className="size-4 text-muted-foreground" />
          <span>{Libs.timeAgo(new Date(postDetails.indexed_at))}</span>
        </div>
      )}
    </div>
  );
}
