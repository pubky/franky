'use client';

import { useState } from 'react';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Libs from '@/libs';
import { Check, UserMinus, UserRoundPlus } from 'lucide-react';
import type { FollowerItemProps } from './FollowerItem.types';

export function FollowerItem({ follower, isFollowing: initialIsFollowing = true, onFollow }: FollowerItemProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const avatarUrl = follower.avatarUrl || follower.image || undefined;
  const formattedPublicKey = Libs.formatPublicKey({ key: follower.id, length: 10 });
  const tags = follower.tags || [];
  const stats = follower.stats || { tags: 0, posts: 0 };

  const handleFollowClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFollowing(!isFollowing);
    onFollow?.(follower.id);
  };

  return (
    <Atoms.Container className="gap-3 rounded-md bg-card p-6 lg:bg-transparent lg:p-0">
      <Atoms.Container
        overrideDefaults={true}
        className="flex flex-wrap items-center justify-between gap-6 lg:flex-nowrap"
      >
        <Atoms.Link href={`/profile/${follower.id}`} className="flex min-w-0 flex-1 items-center gap-2">
          <Molecules.AvatarWithFallback avatarUrl={avatarUrl} name={follower.name} size="md" />

          <Atoms.Container overrideDefaults={true}>
            <Atoms.Typography size="sm" className="truncate font-bold">
              {follower.name}
            </Atoms.Typography>
            <Atoms.Typography className="truncate text-xs font-medium tracking-[1.2px] text-muted-foreground uppercase">
              {formattedPublicKey}
            </Atoms.Typography>
          </Atoms.Container>
        </Atoms.Link>

        {/* Desktop: Tags (inline) */}
        {tags.length > 0 && (
          <Atoms.Container overrideDefaults={true} className="hidden flex-wrap items-center gap-2 lg:flex">
            {tags.slice(0, 3).map((tag, index) => (
              <Atoms.Tag key={index} name={tag} />
            ))}
          </Atoms.Container>
        )}

        {/* Stats */}
        <Atoms.Container overrideDefaults={true} className="flex shrink-0 items-center gap-3">
          <Atoms.Container className="items-start">
            <Atoms.Typography className="text-xs font-medium tracking-[1.2px] text-muted-foreground uppercase">
              Tags
            </Atoms.Typography>
            <Atoms.Typography size="sm" className="font-bold">
              {stats.tags}
            </Atoms.Typography>
          </Atoms.Container>
          <Atoms.Container className="items-start">
            <Atoms.Typography className="text-xs font-medium tracking-[1.2px] text-muted-foreground uppercase">
              Posts
            </Atoms.Typography>
            <Atoms.Typography size="sm" className="font-bold">
              {stats.posts}
            </Atoms.Typography>
          </Atoms.Container>
        </Atoms.Container>

        {/* Desktop: Follow Button */}
        <Atoms.Button
          variant="secondary"
          size="sm"
          className="group hidden w-8 lg:flex"
          onClick={handleFollowClick}
          aria-label={isFollowing ? 'Unfollow' : 'Follow'}
        >
          {isFollowing ? (
            <>
              <Check className="size-5 group-hover:hidden" />
              <UserMinus className="hidden size-5 group-hover:block" />
            </>
          ) : (
            <>
              <UserRoundPlus className="size-5 group-hover:hidden" />
              <Check className="hidden size-5 group-hover:block" />
            </>
          )}
        </Atoms.Button>
      </Atoms.Container>

      {/* Mobile: Bottom row - Tags and Follow Button */}
      <Atoms.Container overrideDefaults={true} className="flex flex-wrap items-center justify-between gap-3 lg:hidden">
        {/* Left: Tags */}
        {tags.length > 0 && (
          <Atoms.Container overrideDefaults={true} className="flex flex-1 flex-wrap items-center gap-2">
            {tags.slice(0, 3).map((tag, index) => (
              <Atoms.Tag key={index} name={tag} />
            ))}
          </Atoms.Container>
        )}
        {/* Right: Follow Button */}
        <Atoms.Button
          variant="secondary"
          size="sm"
          className="group w-8"
          onClick={handleFollowClick}
          aria-label={isFollowing ? 'Unfollow' : 'Follow'}
        >
          {isFollowing ? (
            <>
              <Check className="size-5 group-hover:hidden" />
              <UserMinus className="hidden size-5 group-hover:block" />
            </>
          ) : (
            <>
              <UserRoundPlus className="size-5 group-hover:hidden" />
              <Check className="hidden size-5 group-hover:block" />
            </>
          )}
        </Atoms.Button>
      </Atoms.Container>
    </Atoms.Container>
  );
}
