'use client';

import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Libs from '@/libs';
import type { SidebarUserItemProps } from './SidebarUserItem.types';

/**
 * SidebarUserItem
 *
 * Compact user item for sidebars (WhoToFollow, ActiveUsers).
 * Shows avatar, name, subtitle, and follow button.
 */
export function SidebarUserItem({
  id,
  name,
  image,
  subtitle,
  isFollowing = false,
  isLoading = false,
  onUserClick,
  onFollowClick,
  className,
  'data-testid': dataTestId,
}: SidebarUserItemProps) {
  const displayName = (name || 'Unknown').slice(0, 10);

  const handleUserClick = () => {
    onUserClick?.(id);
  };

  const handleFollowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFollowClick?.(id, isFollowing);
  };

  return (
    <Atoms.Container
      overrideDefaults
      className={Libs.cn('flex w-full items-center gap-3', className)}
      data-testid={dataTestId || `sidebar-user-item-${id}`}
    >
      {/* Clickable user area */}
      <Atoms.Button
        overrideDefaults
        onClick={handleUserClick}
        className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left transition-opacity hover:opacity-80"
        aria-label={`View ${name}'s profile`}
      >
        <Molecules.AvatarWithFallback avatarUrl={image ?? undefined} name={name} size="lg" className="shrink-0" />

        <Atoms.Container overrideDefaults className="flex min-w-0 flex-1 flex-col">
          <Atoms.Typography as="span" overrideDefaults className="truncate text-base font-bold text-foreground">
            {displayName}
          </Atoms.Typography>
          {subtitle && (
            <Atoms.Typography as="span" overrideDefaults className="truncate text-sm text-muted-foreground/50">
              {subtitle}
            </Atoms.Typography>
          )}
        </Atoms.Container>
      </Atoms.Button>

      {/* Follow button */}
      <Atoms.Button
        variant="secondary"
        size="icon"
        onClick={handleFollowClick}
        disabled={isLoading}
        className="size-10 shrink-0 rounded-full"
        aria-label={isFollowing ? `Unfollow ${name}` : `Follow ${name}`}
      >
        {isLoading ? (
          <Libs.Loader2 className="size-5 animate-spin" />
        ) : isFollowing ? (
          <Libs.Check className="size-5" />
        ) : (
          <Libs.UserPlus className="size-5" />
        )}
      </Atoms.Button>
    </Atoms.Container>
  );
}
