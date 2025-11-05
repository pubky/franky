'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import * as Core from '@/core';
import * as Libs from '@/libs';
import * as Atoms from '@/atoms';

export interface PostHeaderProps {
  postId: string;
  className?: string;
  hideTime?: boolean;
}

export function PostHeader({ postId, className, hideTime = false }: PostHeaderProps) {
  // Extract userId from postId (format: userId:postId or just userId if hideTime is true)
  const userId = hideTime ? postId : postId.split(':')[0];

  // Fetch post details to get indexed_at (only if we need to show time)
  const postDetails = useLiveQuery(async () => {
    if (hideTime) return null;
    return await Core.PostController.read({ postId });
  }, [postId, hideTime]);

  // Fetch user details for avatar and name
  const userDetails = useLiveQuery(async () => {
    if (!userId) return null;
    try {
      return await Core.ProfileController.read({ userId: userId as Core.Pubky });
    } catch (error) {
      console.error('Error fetching user details:', error);
      return null;
    }
  }, [userId]);

  // Use fallback/mock data if user details don't exist
  const displayUserDetails = userDetails || {
    name: 'User',
    bio: '',
  };

  // Only show loading if we need post details for time
  if (!hideTime && !postDetails) {
    return <div className="text-muted-foreground">Loading header...</div>;
  }

  const timeAgo = !hideTime && postDetails ? Libs.timeAgo(new Date(postDetails.indexed_at)) : null;

  return (
    <div className={Libs.cn('flex justify-between', className)}>
      <div className="flex gap-3">
        <Atoms.Avatar size="default">
          <Atoms.AvatarImage src={Core.filesApi.getAvatar(userId)} />
          <Atoms.AvatarFallback>
            {Libs.extractInitials({ name: displayUserDetails.name, maxLength: 2 })}
          </Atoms.AvatarFallback>
        </Atoms.Avatar>
        <div className="flex flex-col">
          <span className="text-base font-bold text-foreground">{displayUserDetails.name}</span>
          <span className="text-xs leading-4 font-medium tracking-[0.075rem] uppercase text-muted-foreground">
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
