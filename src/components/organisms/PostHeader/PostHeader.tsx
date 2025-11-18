'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import * as Core from '@/core';
import * as Libs from '@/libs';
import * as Atoms from '@/atoms';

export interface PostHeaderProps {
  postId: string;
  hideTime?: boolean;
  characterCount?: number;
  maxLength?: number;
}

export function PostHeader({ postId, hideTime = false, characterCount, maxLength }: PostHeaderProps) {
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

  // Show loading if user details or post details (when needed) are not available
  if (!userDetails || (!hideTime && !postDetails)) {
    return (
      <Atoms.Container className="text-muted-foreground" overrideDefaults>
        Loading header...
      </Atoms.Container>
    );
  }

  const timeAgo = !hideTime && postDetails ? Libs.timeAgo(new Date(postDetails.indexed_at)) : null;

  return (
    <Atoms.Container className="flex justify-between" overrideDefaults>
      <Atoms.Container className="flex gap-3" overrideDefaults>
        <Atoms.Avatar size="default">
          <Atoms.AvatarImage src={Core.filesApi.getAvatar(userId)} />
          <Atoms.AvatarFallback>{Libs.extractInitials({ name: userDetails.name, maxLength: 2 })}</Atoms.AvatarFallback>
        </Atoms.Avatar>
        <Atoms.Container className="flex flex-col" overrideDefaults>
          <Atoms.Typography as="span" size="sm" className="text-base font-bold text-foreground">
            {userDetails.name}
          </Atoms.Typography>
          <Atoms.Container className="flex min-w-0 items-center gap-2" overrideDefaults>
            <Atoms.Typography
              as="span"
              size="sm"
              className="text-xs leading-4 font-medium tracking-[0.075rem] whitespace-nowrap text-muted-foreground uppercase"
            >
              @{Libs.formatPublicKey({ key: userId, length: 8 })}
            </Atoms.Typography>
            {characterCount !== undefined && maxLength !== undefined && (
              <Atoms.Typography
                as="span"
                size="sm"
                className="flex-shrink-0 text-xs leading-4 font-medium tracking-[0.075rem] whitespace-nowrap text-muted-foreground"
              >
                {characterCount}/{maxLength}
              </Atoms.Typography>
            )}
          </Atoms.Container>
        </Atoms.Container>
      </Atoms.Container>
      {timeAgo && (
        <Atoms.Container className="flex items-center gap-1" overrideDefaults>
          <Libs.Clock className="size-4 text-muted-foreground" />
          <Atoms.Typography
            as="span"
            size="sm"
            className="text-xs leading-4 font-medium tracking-[0.075rem] text-muted-foreground"
          >
            {timeAgo}
          </Atoms.Typography>
        </Atoms.Container>
      )}
    </Atoms.Container>
  );
}
