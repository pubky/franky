'use client';

import * as Hooks from '@/hooks';
import * as Molecules from '@/molecules';
import * as Libs from '@/libs';

export interface ReposterAvatarProps {
  /** ID of the reposter */
  reposterId: string;
  /** Index in the avatar group (used for negative margin overlap) */
  index: number;
}

/**
 * ReposterAvatar
 *
 * Displays an avatar for a reposter with fallback handling.
 * Used in repost indicator bars to show who reposted a post.
 *
 * @example
 * ```tsx
 * <ReposterAvatar reposterId="user-123" index={0} />
 * ```
 */
export function ReposterAvatar({ reposterId, index }: ReposterAvatarProps) {
  const { userDetails } = Hooks.useUserDetails(reposterId);
  const avatarUrl = Hooks.useAvatarUrl(userDetails);

  return (
    <Molecules.AvatarWithFallback
      avatarUrl={avatarUrl}
      name={userDetails?.name || reposterId}
      size="sm"
      className={Libs.cn('size-8 shrink-0', index > 0 && '-ml-2')}
    />
  );
}
