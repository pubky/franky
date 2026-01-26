'use client';

import * as Atoms from '@/atoms';
import * as Organisms from '@/organisms';
import * as Hooks from '@/hooks';
import * as Libs from '@/libs';
import * as Core from '@/core';
import { useRouter } from 'next/navigation';
import { APP_ROUTES } from '@/app/routes';
import type { WhoTaggedExpandedListProps } from './WhoTaggedExpandedList.types';
import type { TaggerWithAvatar } from '@/molecules/TaggedItem/TaggedItem.types';

/**
 * TaggerUserRow
 *
 * Internal component that wraps UserListItem and fetches the follow relationship
 * for each individual tagger. This allows us to use the useIsFollowing hook
 * per-user since hooks cannot be called in loops.
 */
function TaggerUserRow({
  tagger,
  isLoading,
  isCurrentUser,
  onUserClick,
  onFollowClick,
}: {
  tagger: TaggerWithAvatar;
  isLoading: boolean;
  isCurrentUser: boolean;
  onUserClick: (userId: string) => void;
  onFollowClick: (userId: string, isFollowing: boolean) => void;
}) {
  const { isFollowing, isLoading: isStatusLoading } = Hooks.useIsFollowing(tagger.id);

  return (
    <Organisms.UserListItem
      user={{
        id: tagger.id,
        name: tagger.name,
        avatarUrl: tagger.avatarUrl,
      }}
      variant="compact"
      isFollowing={isFollowing}
      isLoading={isLoading}
      isStatusLoading={isStatusLoading}
      isCurrentUser={isCurrentUser}
      onUserClick={onUserClick}
      onFollowClick={onFollowClick}
    />
  );
}

/**
 * WhoTaggedExpandedList
 *
 * Displays an expandable list of users who tagged a post/content.
 * Shows each user with their avatar, name, pubky, and a follow/unfollow button.
 * Max height of 300px with scroll for overflow.
 */
export function WhoTaggedExpandedList({
  taggers,
  className,
  'data-testid': dataTestId,
}: WhoTaggedExpandedListProps) {
  const router = useRouter();
  const { toggleFollow, isUserLoading } = Hooks.useFollowUser();
  const { requireAuth } = Hooks.useRequireAuth();
  const { currentUserPubky } = Core.useAuthStore();

  const handleFollowClick = async (userId: string, isFollowing: boolean) => {
    requireAuth(() => toggleFollow(userId, isFollowing));
  };

  const handleUserClick = (userId: string) => {
    router.push(`${APP_ROUTES.PROFILE}/${userId}`);
  };

  if (taggers.length === 0) {
    return null;
  }

  return (
    <Atoms.Container
      overrideDefaults
      className={Libs.cn(
        'flex max-h-[300px] w-[320px] flex-col gap-2 overflow-y-auto',
        'rounded-md border border-border bg-popover p-4 shadow-2xl',
        className,
      )}
      data-testid={dataTestId || 'who-tagged-expanded-list'}
    >
      {taggers.map((tagger) => (
        <TaggerUserRow
          key={tagger.id}
          tagger={tagger}
          isLoading={isUserLoading(tagger.id)}
          isCurrentUser={tagger.id === currentUserPubky}
          onUserClick={handleUserClick}
          onFollowClick={handleFollowClick}
        />
      ))}
    </Atoms.Container>
  );
}
