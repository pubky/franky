'use client';

import { useTranslations } from 'next-intl';
import * as Atoms from '@/atoms';
import * as Hooks from '@/hooks';
import * as Molecules from '@/molecules';
import type { PostHeaderProps } from './PostHeader.types';

export function PostHeader({
  postId,
  isReplyInput = false,
  characterLimit,
  showPopover = true,
  size = 'normal',
  timeAgoPlacement = 'top-right',
}: PostHeaderProps) {
  const t = useTranslations('common');

  // Extract userId from postId (format: userId:postId or just userId if isReplyInput is true)
  const userId = isReplyInput ? postId : postId.split(':')[0];

  // When isReplyInput is true, skip fetching post details since there's no post yet
  const { postDetails } = Hooks.usePostDetails(isReplyInput ? null : postId);

  // Fetch user details for avatar and name
  const { userDetails } = Hooks.useUserDetails(userId);

  // Compute avatar URL from user details (only if the user has an image)
  const avatarUrl = Hooks.useAvatarUrl(userDetails);

  // Format relative time with localization support
  const { formatRelativeTime } = Hooks.useRelativeTime();

  const isLoading = !userDetails || (!isReplyInput && !postDetails);

  if (isLoading) {
    return (
      <Atoms.Container className="text-muted-foreground" overrideDefaults>
        {t('loadingHeader')}
      </Atoms.Container>
    );
  }

  const timeAgo = !isReplyInput && postDetails ? formatRelativeTime(new Date(postDetails.indexed_at)) : null;

  return (
    <Atoms.Container className="flex min-w-0 items-start justify-between gap-3" overrideDefaults>
      <Molecules.PostHeaderUserInfo
        userId={userId}
        userName={userDetails.name || ''}
        avatarUrl={avatarUrl}
        characterLimit={characterLimit}
        showPopover={showPopover}
        size={size}
        timeAgo={timeAgoPlacement === 'bottom-left' ? timeAgo : null}
      />
      {timeAgo && timeAgoPlacement === 'top-right' && <Molecules.PostHeaderTimestamp timeAgo={timeAgo} />}
    </Atoms.Container>
  );
}
