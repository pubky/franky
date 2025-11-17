'use client';

import * as Atoms from '@/components/atoms';
import * as Molecules from '@/components/molecules';
import * as Icons from '@/libs/icons';
import * as Libs from '@/libs';
import { ProfilePageHeaderProps } from './ProfilePageHeader.types';

export function ProfilePageHeader({
  avatarUrl,
  emoji = '🌴',
  name,
  bio,
  publicKey,
  link,
  status,
  onEdit,
  onCopyPublicKey,
  onSignOut,
  onStatusClick,
}: ProfilePageHeaderProps) {
  const formattedPublicKey = Libs.formatPublicKey({ key: publicKey, length: 12 });

  return (
    <Atoms.Container
      overrideDefaults={true}
      className="flex flex-col items-center gap-6 rounded-lg bg-card p-6 lg:flex-row lg:items-start lg:rounded-none lg:bg-transparent lg:p-0"
    >
      <Atoms.Container overrideDefaults={true} className="relative lg:px-4">
        <Atoms.Avatar className="size-16 lg:size-36">
          {avatarUrl ? (
            <Atoms.AvatarImage src={avatarUrl} alt={name} />
          ) : (
            <Atoms.AvatarFallback className="text-2xl lg:text-4xl">
              {Libs.extractInitials({ name })}
            </Atoms.AvatarFallback>
          )}
        </Atoms.Avatar>
        <Atoms.AvatarEmojiBadge emoji={emoji} />
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
          {link && (
            <Atoms.Button variant="secondary" size="sm" asChild>
              <a href={link} target="_blank" rel="noopener noreferrer">
                <Icons.Link className="size-4" />
                Link
              </a>
            </Atoms.Button>
          )}
          <Atoms.Button variant="secondary" size="sm" onClick={onSignOut}>
            <Icons.LogOut className="size-4" />
            Sign out
          </Atoms.Button>
          <Molecules.StatusPicker emoji={emoji} status={status} onClick={onStatusClick} />
        </Atoms.Container>
      </Atoms.Container>
    </Atoms.Container>
  );
}
