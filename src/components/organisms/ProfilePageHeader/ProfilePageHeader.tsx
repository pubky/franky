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
  onLinkClick,
  onSignOut,
  onStatusClick,
}: ProfilePageHeaderProps) {
  const formattedPublicKey = Libs.formatPublicKey({ key: publicKey, length: 12 });

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-center lg:items-start p-6 lg:p-0 bg-card lg:bg-transparent rounded-lg lg:rounded-none">
      <div className="relative lg:px-4">
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
      </div>

      <div className="flex flex-col gap-5 flex-1">
        <div className={Libs.cn('flex flex-col text-center lg:text-left', bio && 'gap-2')}>
          <Atoms.Typography as="h1" size="lg" className="text-white lg:text-6xl">
            {name}
          </Atoms.Typography>
          {bio && (
            <Atoms.Typography as="p" size="sm" className="font-medium text-secondary-foreground lg:text-base">
              {bio}
            </Atoms.Typography>
          )}
        </div>

        <div className="flex flex-wrap gap-3 items-center justify-center lg:justify-start">
          <Atoms.Button variant="secondary" size="sm" onClick={onEdit}>
            <Icons.Pencil className="size-4" />
            Edit
          </Atoms.Button>
          <Atoms.Button variant="secondary" size="sm" onClick={onCopyPublicKey}>
            <Icons.KeyRound className="size-4" />
            {formattedPublicKey}
          </Atoms.Button>
          {link && onLinkClick && (
            <Atoms.Button variant="secondary" size="sm" onClick={onLinkClick} asChild>
              <a href={link} target="_blank" rel="noopener noreferrer">
                <Icons.Link className="size-4" />
                Link
              </a>
            </Atoms.Button>
          )}
          <Atoms.Button variant="secondary" size="sm" onClick={onSignOut} asChild>
            <a role="button">
              <Icons.LogOut className="size-4" />
              Sign out
            </a>
          </Atoms.Button>
          <Molecules.StatusPicker emoji={emoji} status={status} onClick={onStatusClick} />
        </div>
      </div>
    </div>
  );
}
