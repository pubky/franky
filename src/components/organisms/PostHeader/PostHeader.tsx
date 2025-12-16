'use client';

import * as Libs from '@/libs';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Hooks from '@/hooks';

export interface PostHeaderProps {
  // We should rethink how we want to name this variable, because sometimes we use it as postID and sometimes as userId.
  // Potentially even refactor this component
  postId: string;
  isReplyInput?: boolean;
  characterCount?: number;
  maxLength?: number;
}

export function PostHeader({ postId, isReplyInput = false, characterCount, maxLength }: PostHeaderProps) {
  // Extract userId from postId (format: userId:postId or just userId if isReplyInput is true)
  const userId = isReplyInput ? postId : postId.split(':')[0];

  // When isReplyInput is true, skip fetching post details since there's no post yet
  const { postDetails } = Hooks.usePostDetails(isReplyInput ? null : postId);

  // Fetch user details for avatar and name
  const { userDetails } = Hooks.useUserDetails(userId);

  // Compute avatar URL from user details (only if the user has an image)
  const avatarUrl = Hooks.useAvatarUrl(userDetails);

  if (!userDetails || (!isReplyInput && !postDetails)) {
    return (
      <Atoms.Container className="text-muted-foreground" overrideDefaults>
        Loading header...
      </Atoms.Container>
    );
  }

  const timeAgo = !isReplyInput && postDetails ? Libs.timeAgo(new Date(postDetails.indexed_at)) : null;

  return (
    <Atoms.Container className="flex min-w-0 items-start justify-between gap-3" overrideDefaults>
      <Atoms.Container className="flex min-w-0 flex-1 gap-3" overrideDefaults>
        <Molecules.AvatarWithFallback avatarUrl={avatarUrl} name={userDetails.name || ''} size="default" />
        <Atoms.Container className="min-w-0 flex-1" overrideDefaults>
          <Atoms.Typography className="block truncate text-base font-bold text-foreground" overrideDefaults>
            {userDetails.name}
          </Atoms.Typography>
          <Atoms.Container className="flex min-w-0 items-center gap-2" overrideDefaults>
            <Atoms.Typography
              as="span"
              className="text-xs leading-4 font-medium tracking-[0.075rem] whitespace-nowrap text-muted-foreground uppercase"
              overrideDefaults
            >
              @{Libs.formatPublicKey({ key: userId, length: 8 })}
            </Atoms.Typography>
            {characterCount !== undefined && maxLength !== undefined && (
              <Atoms.Typography
                as="span"
                className="shrink-0 text-xs leading-4 font-medium tracking-[0.075rem] whitespace-nowrap text-muted-foreground"
                overrideDefaults
              >
                {characterCount}/{maxLength}
              </Atoms.Typography>
            )}
          </Atoms.Container>
        </Atoms.Container>
      </Atoms.Container>
      {timeAgo && (
        <Atoms.Container className="flex flex-shrink-0 items-center gap-1" overrideDefaults>
          <Libs.Clock className="size-4 text-muted-foreground" />
          <Atoms.Typography
            as="span"
            className="text-xs leading-4 font-medium tracking-[0.075rem] whitespace-nowrap text-muted-foreground"
            overrideDefaults
          >
            {timeAgo}
          </Atoms.Typography>
        </Atoms.Container>
      )}
    </Atoms.Container>
  );
}
