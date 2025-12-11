'use client';

import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Libs from '@/libs';
import type {
  UserListItemProps,
  FollowButtonProps,
  StatsSubtitleProps,
  UserStatsProps,
  VariantProps,
} from './UserListItem.types';
import { TAG_MAX_LENGTH, TAGS_MAX_TOTAL_CHARS, TAGS_MAX_COUNT } from './UserListItem.constants';

// =============================================================================
// Internal Components
// =============================================================================

/**
 * FollowButton
 * Renders follow/unfollow button in icon or text variant
 */
function FollowButton({
  isFollowing,
  isLoading,
  isStatusLoading,
  displayName,
  variant,
  onClick,
}: FollowButtonProps): React.ReactElement {
  // Show loading if action is in progress OR if status is still being loaded
  const showLoading = isLoading || isStatusLoading;

  if (variant === 'icon') {
    return (
      <Atoms.Button
        variant="secondary"
        size="icon"
        onClick={onClick}
        disabled={showLoading}
        className="size-10 shrink-0 rounded-full"
        aria-label={isFollowing ? `Unfollow ${displayName}` : `Follow ${displayName}`}
      >
        {showLoading ? (
          <Libs.Loader2 className="size-5 animate-spin" />
        ) : isFollowing ? (
          <Libs.Check className="size-5" />
        ) : (
          <Libs.UserPlus className="size-5" />
        )}
      </Atoms.Button>
    );
  }

  // Text variant with hover states
  return (
    <Atoms.Button
      variant="secondary"
      size="sm"
      className="group w-[110px] justify-center"
      onClick={onClick}
      disabled={showLoading}
      aria-label={isFollowing ? 'Unfollow' : 'Follow'}
    >
      {showLoading ? (
        <Libs.Loader2 className="size-4 animate-spin" />
      ) : isFollowing ? (
        <>
          <Atoms.Container overrideDefaults className="flex items-center gap-1.5 group-hover:hidden">
            <Libs.Check className="size-4" />
            <span>Following</span>
          </Atoms.Container>
          <Atoms.Container overrideDefaults className="hidden items-center gap-1.5 group-hover:flex">
            <Libs.UserMinus className="size-4" />
            <span>Unfollow</span>
          </Atoms.Container>
        </>
      ) : (
        <>
          <Atoms.Container overrideDefaults className="flex items-center gap-1.5 group-hover:hidden">
            <Libs.UserRoundPlus className="size-4" />
            <span>Follow</span>
          </Atoms.Container>
          <Atoms.Container overrideDefaults className="hidden items-center gap-1.5 group-hover:flex">
            <Libs.Check className="size-4" />
            <span>Follow</span>
          </Atoms.Container>
        </>
      )}
    </Atoms.Button>
  );
}

/**
 * MeButton
 * Disabled button shown when viewing own profile
 */
function MeButton({ className }: { className?: string }): React.ReactElement {
  return (
    <Atoms.Button
      variant="secondary"
      size="sm"
      className={Libs.cn('w-[110px] justify-center', className)}
      disabled
      aria-label="This is you"
    >
      <span>Me</span>
    </Atoms.Button>
  );
}

/**
 * StatsSubtitle
 * Compact stats display with icons (for sidebar)
 */
function StatsSubtitle({ tags, posts }: StatsSubtitleProps): React.ReactElement {
  return (
    <Atoms.Container overrideDefaults className="flex items-center gap-2 text-sm text-muted-foreground/50">
      <Atoms.Container overrideDefaults className="flex items-center gap-1">
        <Libs.Tag className="size-3.5" />
        <Atoms.Typography as="span" overrideDefaults>
          {tags}
        </Atoms.Typography>
      </Atoms.Container>
      <Atoms.Container overrideDefaults className="flex items-center gap-1">
        <Libs.StickyNote className="size-3.5" />
        <Atoms.Typography as="span" overrideDefaults>
          {posts}
        </Atoms.Typography>
      </Atoms.Container>
    </Atoms.Container>
  );
}

/**
 * UserStats
 * Full stats display with labels (for profile pages)
 */
function UserStats({ tags, posts }: UserStatsProps): React.ReactElement {
  return (
    <Atoms.Container overrideDefaults className="flex shrink-0 items-center gap-3">
      <Atoms.Container className="items-start">
        <Atoms.Typography className="text-xs font-medium tracking-[1.2px] text-muted-foreground uppercase">
          Tags
        </Atoms.Typography>
        <Atoms.Typography size="sm" className="font-bold">
          {tags}
        </Atoms.Typography>
      </Atoms.Container>
      <Atoms.Container className="items-start">
        <Atoms.Typography className="text-xs font-medium tracking-[1.2px] text-muted-foreground uppercase">
          Posts
        </Atoms.Typography>
        <Atoms.Typography size="sm" className="font-bold">
          {posts}
        </Atoms.Typography>
      </Atoms.Container>
    </Atoms.Container>
  );
}

/**
 * Get tags that fit within the character budget
 * Shows fewer tags if they would exceed the total character limit
 */
function getDisplayTags(tags: string[]): string[] {
  if (tags.length === 0) return [];

  const result: string[] = [];
  let totalChars = 0;

  for (const tag of tags) {
    if (result.length >= TAGS_MAX_COUNT) break;

    // Calculate effective length (truncated if needed)
    const effectiveLength = Math.min(tag.length, TAG_MAX_LENGTH);

    // Check if adding this tag would exceed the budget
    if (totalChars + effectiveLength > TAGS_MAX_TOTAL_CHARS && result.length > 0) {
      break;
    }

    result.push(tag);
    totalChars += effectiveLength;
  }

  return result;
}

/**
 * TagsList
 * Renders tags with smart limiting based on character count
 */
function TagsList({ tags, className }: { tags: string[]; className?: string }): React.ReactElement | null {
  if (tags.length === 0) return null;

  const displayTags = getDisplayTags(tags);

  return (
    <Atoms.Container overrideDefaults className={Libs.cn('flex flex-wrap items-center gap-2', className)}>
      {displayTags.map((tag, index) => (
        <Atoms.Tag key={index} name={tag} maxLength={TAG_MAX_LENGTH} />
      ))}
    </Atoms.Container>
  );
}

// =============================================================================
// Variant Components
// =============================================================================

/**
 * CompactVariant
 * For sidebars (WhoToFollow, ActiveUsers)
 */
function CompactVariant({
  user,
  avatarUrl,
  displayName,
  formattedPublicKey,
  stats,
  isFollowing,
  isLoading,
  isStatusLoading,
  isCurrentUser,
  showStats,
  className,
  dataTestId,
  onUserClick,
  onFollowClick,
}: VariantProps): React.ReactElement {
  return (
    <Atoms.Container
      overrideDefaults
      className={Libs.cn('flex w-full items-center gap-3', className)}
      data-testid={dataTestId || `user-list-item-${user.id}`}
    >
      {/* Clickable user area */}
      <Atoms.Button
        overrideDefaults
        onClick={onUserClick}
        className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left transition-opacity hover:opacity-80"
        aria-label={`View ${displayName}'s profile`}
      >
        <Molecules.AvatarWithFallback avatarUrl={avatarUrl} name={displayName} size="lg" className="shrink-0" />

        <Atoms.Container overrideDefaults className="flex min-w-0 flex-1 flex-col">
          <Atoms.Typography as="span" overrideDefaults className="truncate text-base font-bold text-foreground">
            {displayName.slice(0, 10)}
          </Atoms.Typography>
          {showStats ? (
            <StatsSubtitle tags={stats.tags} posts={stats.posts} />
          ) : (
            <Atoms.Typography as="span" overrideDefaults className="truncate text-sm text-muted-foreground/50">
              {formattedPublicKey}
            </Atoms.Typography>
          )}
        </Atoms.Container>
      </Atoms.Button>

      {/* Follow button */}
      {!isCurrentUser && (
        <FollowButton
          isFollowing={isFollowing}
          isLoading={isLoading}
          isStatusLoading={isStatusLoading}
          displayName={displayName}
          variant="icon"
          onClick={onFollowClick}
        />
      )}
    </Atoms.Container>
  );
}

/**
 * FullVariant
 * For profile pages (Followers, Following)
 */
function FullVariant({
  user,
  avatarUrl,
  displayName,
  formattedPublicKey,
  tags,
  stats,
  isFollowing,
  isLoading,
  isStatusLoading,
  isCurrentUser,
  className,
  dataTestId,
  onFollowClick,
}: VariantProps): React.ReactElement {
  return (
    <Atoms.Container
      className={Libs.cn('gap-3 rounded-md bg-card p-6 lg:bg-transparent lg:p-0', className)}
      data-testid={dataTestId || `user-list-item-${user.id}`}
    >
      {/* Main row */}
      <Atoms.Container overrideDefaults className="flex flex-wrap items-center justify-between gap-6 lg:flex-nowrap">
        {/* User info */}
        <Atoms.Link href={`/profile/${user.id}`} className="flex min-w-0 flex-1 items-center gap-2">
          <Molecules.AvatarWithFallback avatarUrl={avatarUrl} name={displayName} size="md" />
          <Atoms.Container overrideDefaults>
            <Atoms.Typography size="sm" className="truncate font-bold">
              {displayName}
            </Atoms.Typography>
            <Atoms.Typography className="truncate text-xs font-medium tracking-[1.2px] text-muted-foreground uppercase">
              {formattedPublicKey}
            </Atoms.Typography>
          </Atoms.Container>
        </Atoms.Link>

        {/* Desktop: Tags - hidden between lg (1024px) and xl (1280px) */}
        <TagsList tags={tags} className="hidden xl:flex" />

        {/* Stats */}
        <UserStats tags={stats.tags} posts={stats.posts} />

        {/* Desktop: Follow Button */}
        {isCurrentUser ? (
          <MeButton className="hidden lg:flex" />
        ) : (
          <Atoms.Container overrideDefaults className="hidden lg:flex">
            <FollowButton
              isFollowing={isFollowing}
              isLoading={isLoading}
              isStatusLoading={isStatusLoading}
              displayName={displayName}
              variant="text"
              onClick={onFollowClick}
            />
          </Atoms.Container>
        )}
      </Atoms.Container>

      {/* Mobile: Bottom row */}
      <Atoms.Container overrideDefaults className="flex flex-wrap items-center justify-between gap-3 lg:hidden">
        <TagsList tags={tags} className="flex-1" />
        {isCurrentUser ? (
          <MeButton />
        ) : (
          <FollowButton
            isFollowing={isFollowing}
            isLoading={isLoading}
            isStatusLoading={isStatusLoading}
            displayName={displayName}
            variant="text"
            onClick={onFollowClick}
          />
        )}
      </Atoms.Container>
    </Atoms.Container>
  );
}

// =============================================================================
// Main Component
// =============================================================================

/**
 * UserListItem
 *
 * Unified component for displaying user items in lists.
 * Supports two variants:
 * - `compact`: For sidebars (WhoToFollow, ActiveUsers) - avatar, name, subtitle, icon button
 * - `full`: For profile pages (Followers, Following) - avatar, name, pubky, tags, stats, text button
 */
export function UserListItem({
  user,
  variant = 'compact',
  isFollowing: isFollowingProp,
  isLoading = false,
  isStatusLoading = false,
  isCurrentUser = false,
  showStats = false,
  onUserClick,
  onFollowClick,
  className,
  'data-testid': dataTestId,
}: UserListItemProps): React.ReactElement {
  // Normalize user data
  const avatarUrl = user.avatarUrl || user.image || undefined;
  const displayName = user.name || Libs.formatPublicKey({ key: user.id, length: 10 });
  const formattedPublicKey = Libs.truncateMiddle(user.id, variant === 'compact' ? 10 : 12);
  const tags = user.tags || [];
  const stats = user.stats || user.counts || { tags: 0, posts: 0 };
  const isFollowing = isFollowingProp ?? user.isFollowing ?? false;

  const handleUserClick = (): void => {
    onUserClick?.(user.id);
  };

  const handleFollowClick = (e: React.MouseEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    onFollowClick?.(user.id, isFollowing);
  };

  const commonProps: VariantProps = {
    user,
    avatarUrl,
    displayName,
    formattedPublicKey,
    tags,
    stats,
    isFollowing,
    isLoading,
    isStatusLoading,
    isCurrentUser,
    showStats,
    className,
    dataTestId,
    onUserClick: handleUserClick,
    onFollowClick: handleFollowClick,
  };

  if (variant === 'compact') {
    return <CompactVariant {...commonProps} />;
  }

  return <FullVariant {...commonProps} />;
}
