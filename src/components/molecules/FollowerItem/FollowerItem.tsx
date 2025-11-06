'use client';

import * as React from 'react';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Libs from '@/libs';

export interface FollowerData {
  id: string;
  name: string;
  pubky: string;
  avatar?: string;
  tags: Array<{ label: string; color?: string }>;
  tagsCount: number;
  postsCount: number;
  isFollowing: boolean;
}

export interface FollowerItemProps {
  follower: FollowerData;
  onFollow?: (userId: string) => void;
  className?: string;
}

export function FollowerItem({ follower, onFollow, className }: FollowerItemProps) {
  const handleFollow = () => {
    onFollow?.(follower.id);
  };

  return (
    <div
      className={Libs.cn(
        // Mobile: flex-col with gap-3 (two rows)
        'flex flex-col gap-3',
        // Desktop: single row layout
        'lg:flex-row lg:items-center lg:justify-between lg:gap-0',
        className,
      )}
    >
      {/* Mobile: First row | Desktop: Left side */}
      <div className="flex gap-2 items-start w-full lg:w-auto">
        {/* Left: Avatar + Username + Pubky */}
        <div className="flex flex-1 gap-2 items-center min-w-0 lg:flex-initial">
          <Atoms.Avatar className="size-8 shrink-0">
            <Atoms.AvatarImage src={follower.avatar} alt={follower.name} />
            <Atoms.AvatarFallback>{Libs.extractInitials({ name: follower.name, maxLength: 2 })}</Atoms.AvatarFallback>
          </Atoms.Avatar>
          <div className="flex flex-col items-start min-w-0 flex-1 lg:flex-initial lg:w-[132px]">
            <Atoms.Typography
              size="sm"
              className="font-bold leading-5 text-foreground overflow-hidden text-ellipsis whitespace-nowrap w-[85px]"
            >
              {follower.name}
            </Atoms.Typography>
            <Atoms.Typography
              size="xs"
              className="text-muted-foreground font-medium uppercase tracking-[1.2px] leading-4 whitespace-pre-wrap"
            >
              {follower.pubky}
            </Atoms.Typography>
          </div>
        </div>

        {/* Mobile: Stats on right | Desktop: hidden (will be in right section) */}
        <Molecules.UserStats
          tagsCount={follower.tagsCount}
          postsCount={follower.postsCount}
          className="flex-1 justify-end shrink-0 lg:hidden"
        />
      </div>

      {/* Mobile: Second row | Desktop: Right side */}
      <div className="flex flex-wrap gap-3 items-center w-full lg:flex-nowrap lg:gap-6 lg:w-auto">
        {/* Tags */}
        {follower.tags.length > 0 && (
          <div className="flex flex-1 gap-2 items-center min-w-0 lg:flex-initial lg:flex-1">
            {follower.tags.slice(0, 3).map((tag, index) => (
              <Molecules.PostTag
                key={`${follower.id}-tag-${index}`}
                label={tag.label}
                color={tag.color}
                className="h-8 shrink-0"
              />
            ))}
          </div>
        )}

        {/* Desktop: Stats */}
        <Molecules.UserStats
          tagsCount={follower.tagsCount}
          postsCount={follower.postsCount}
          className="hidden lg:flex shrink-0"
        />

        {/* Follow button */}
        <Atoms.Button
          onClick={handleFollow}
          variant={Atoms.ButtonVariant.SECONDARY}
          size="sm"
          className="size-8 rounded-full shadow-xs-dark p-1 shrink-0"
        >
          {follower.isFollowing ? <Libs.Check className="size-5" /> : <Libs.UserRoundPlus className="size-5" />}
        </Atoms.Button>
      </div>
    </div>
  );
}
