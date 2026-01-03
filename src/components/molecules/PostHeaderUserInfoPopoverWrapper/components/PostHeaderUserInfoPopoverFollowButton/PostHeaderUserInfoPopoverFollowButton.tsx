'use client';

import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import type { PostHeaderUserInfoPopoverFollowButtonProps } from './PostHeaderUserInfoPopoverFollowButton.types';

export function PostHeaderUserInfoPopoverFollowButton({
  isFollowing,
  isLoading,
  onClick,
}: PostHeaderUserInfoPopoverFollowButtonProps) {
  return (
    <Atoms.Button
      variant="secondary"
      size="sm"
      className="group gap-2"
      onClick={onClick}
      disabled={isLoading}
      aria-label={isFollowing ? 'Unfollow' : 'Follow'}
    >
      {isLoading ? (
        <Libs.Loader2 className="size-4 animate-spin" />
      ) : isFollowing ? (
        <>
          <Libs.Check className="size-4 group-hover:hidden" />
          <Atoms.Typography className="text-xs leading-4 font-bold group-hover:hidden" overrideDefaults>
            Following
          </Atoms.Typography>
          <Libs.UserMinus className="hidden size-4 group-hover:block" />
          <Atoms.Typography className="hidden text-xs leading-4 font-bold group-hover:block" overrideDefaults>
            Unfollow
          </Atoms.Typography>
        </>
      ) : (
        <>
          <Libs.UserRoundPlus className="size-4" />
          <Atoms.Typography className="text-xs leading-4 font-bold" overrideDefaults>
            Follow
          </Atoms.Typography>
        </>
      )}
    </Atoms.Button>
  );
}
