'use client';

import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Icons from '@/libs/icons';
import * as Libs from '@/libs';
import * as Types from './ProfilePageHeader.types';

export function ProfilePageHeader({ profile, actions }: Types.ProfilePageHeaderProps) {
  const { avatarUrl, emoji = '🌴', name, bio, publicKey, status } = profile;
  const { onEdit, onCopyPublicKey, onCopyLink, onSignOut, onStatusChange, onAvatarClick, isLoggingOut } = actions;

  const formattedPublicKey = Libs.formatPublicKey({ key: publicKey, length: 12 });
  const displayEmoji = Libs.extractEmojiFromStatus(status || '', emoji);

  return (
    <Atoms.Container
      overrideDefaults={true}
      className="flex flex-col items-center gap-6 rounded-lg bg-card p-6 lg:flex-row lg:items-start lg:rounded-none lg:bg-transparent lg:p-0"
      data-testid="profile-page-header"
    >
      <Atoms.Container overrideDefaults={true} className="relative cursor-pointer lg:px-4" onClick={onAvatarClick}>
        <Molecules.AvatarWithFallback
          avatarUrl={avatarUrl}
          name={name}
          className="size-16 lg:size-36"
          fallbackClassName="text-2xl lg:text-4xl"
          alt={name}
        />
        <Atoms.AvatarEmojiBadge emoji={displayEmoji} />
      </Atoms.Container>

      <Atoms.Container overrideDefaults={true} className="flex flex-1 flex-col gap-5">
        <Atoms.Container
          overrideDefaults={true}
          className={Libs.cn('flex flex-col text-center lg:text-left', bio && 'gap-2')}
        >
          <Atoms.Typography as="h1" size="lg" className="text-white lg:text-6xl">
            {name}
          </Atoms.Typography>
          {bio && (
            <Atoms.Typography as="p" size="sm" className="font-medium text-secondary-foreground lg:text-base">
              {bio}
            </Atoms.Typography>
          )}
        </Atoms.Container>

        <Atoms.Container
          overrideDefaults={true}
          className="flex flex-wrap items-center justify-center gap-3 lg:justify-start"
        >
          <Atoms.Button variant="secondary" size="sm" onClick={onEdit}>
            <Icons.Pencil className="size-4" />
            Edit
          </Atoms.Button>
          <Atoms.Button variant="secondary" size="sm" onClick={onCopyPublicKey}>
            <Icons.KeyRound className="size-4" />
            {formattedPublicKey}
          </Atoms.Button>
          <Atoms.Button variant="secondary" size="sm" onClick={onCopyLink}>
            <Icons.Link className="size-4" />
            Link
          </Atoms.Button>
          <Atoms.Button
            variant="secondary"
            size="sm"
            onClick={onSignOut}
            id="profile-logout-btn"
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <>
                <Icons.Loader2 className="size-4 animate-spin" />
                Logging out...
              </>
            ) : (
              <>
                <Icons.LogOut className="size-4" />
                Sign out
              </>
            )}
          </Atoms.Button>
          <Molecules.StatusPickerWrapper emoji={displayEmoji} status={status || ''} onStatusChange={onStatusChange} />
        </Atoms.Container>
      </Atoms.Container>
    </Atoms.Container>
  );
}
