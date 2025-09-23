'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import * as Hooks from '@/hooks';
import * as Core from '@/core';
import { type TProfilePageProps } from '@/templates';

export const ProfileHeader = ({ pubkyParam }: TProfilePageProps) => {
  const { copyToClipboard } = Hooks.useCopyToClipboard();
  const { currentUserPubky } = Core.useProfileStore();
  const isOwnProfile = currentUserPubky === pubkyParam;

  const userDetails = useLiveQuery(() => Core.db.users.get(pubkyParam).then((user) => user?.details), [pubkyParam]);

  if (userDetails === undefined) {
    return (
      <Atoms.Container className="flex flex-col gap-6 p-6 bg-background border border-border rounded-lg">
        <div className="animate-pulse">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-muted rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-8 bg-muted rounded w-48" />
              <div className="h-4 bg-muted rounded w-32" />
            </div>
          </div>
        </div>
      </Atoms.Container>
    );
  }

  const name = userDetails.name;
  const bio = userDetails.bio;
  const status = userDetails.status;

  const renderUserPublicKey = () => (
    <Atoms.Button
      variant="secondary"
      className="rounded-full gap-2 px-4 py-2 text-sm"
      onClick={() => copyToClipboard(pubkyParam)}
    >
      <Libs.Key className="w-4 h-4" />
      {Libs.formatPublicKey({ key: pubkyParam, length: 10 })}
    </Atoms.Button>
  );

  const renderBio = () => <Atoms.Typography className="text-muted-foreground leading-relaxed">{bio}</Atoms.Typography>;

  const renderName = () => (
    <Atoms.Container className="flex flex-col md:flex-row md:items-center gap-2 w-auto m-0">
      <Atoms.Heading level={1} size="xl" className="font-bold">
        {name}
      </Atoms.Heading>
    </Atoms.Container>
  );

  const renderActionButtons = () => (
    <Atoms.Container className="flex flex-row items-center gap-3 w-auto m-0">
      <Atoms.Button
        variant="outline"
        className="rounded-full gap-2 px-4 py-2"
        onClick={() => {
          // TODO: Implement sign out functionality
          console.log('Sign out clicked');
        }}
      >
        <Libs.LogOut className="w-4 h-4" />
        Sign out
      </Atoms.Button>

      <Atoms.Button
        variant="outline"
        className="rounded-full gap-2 px-4 py-2"
        onClick={() => {
          // TODO: Implement edit functionality
          console.log('Edit clicked');
        }}
      >
        <Libs.Edit className="w-4 h-4" />
        Edit
      </Atoms.Button>

      <Atoms.Button
        variant="outline"
        className="rounded-full gap-2 px-4 py-2"
        onClick={() => {
          // TODO: Implement link functionality
          console.log('Link clicked');
        }}
      >
        <Libs.Link className="w-4 h-4" />
        Link
      </Atoms.Button>
    </Atoms.Container>
  );

  const renderStatusBadge = (status: string) => (
    <Atoms.Container className="flex items-center gap-2 w-auto m-0">
      <Atoms.Badge
        variant="secondary"
        className={Libs.cn(
          'rounded-full gap-2 px-3 py-1',
          status.toLowerCase() === 'away' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        )}
      >
        <div
          className={Libs.cn(
            'w-2 h-2 rounded-full',
            status.toLowerCase() === 'away' ? 'bg-yellow-500' : 'bg-green-500',
          )}
        />
        {status}
      </Atoms.Badge>
    </Atoms.Container>
  );

  return (
    <Atoms.Container className={Libs.cn('flex flex-row gap-6 p-6 bg-background')}>
      {/* Avatar */}
      <Atoms.Container className="flex flex-row items-center gap-4 w-auto m-0">
        <Atoms.Avatar className="w-40 h-40 md:w-40 md:h-40">
          <Atoms.AvatarImage
            src={Libs.buildNexusStaticUrl(Core.FILES_API.GET_AVATAR(pubkyParam))}
            alt={`${name}'s avatar`}
            loading="lazy"
          />
          <Atoms.AvatarFallback className="text-lg md:text-xl">{name.charAt(0).toUpperCase()}</Atoms.AvatarFallback>
        </Atoms.Avatar>
      </Atoms.Container>
      <Atoms.Container className="flex flex-col items-start gap-4 w-auto m-0">
        <Atoms.Container className="flex flex-row items-start gap-4 w-auto m-0">
          <Atoms.Container className="flex flex-col gap-2 flex-1 w-auto m-0">
            {name && renderName()}
            {bio && renderBio()}
          </Atoms.Container>
        </Atoms.Container>

        {/* Action Buttons Section */}
        <Atoms.Container className="flex flex-row items-center justify-between gap-4 w-auto m-0">
          {pubkyParam && renderUserPublicKey()}
          {isOwnProfile && renderActionButtons()}
          {status && renderStatusBadge(status)}
        </Atoms.Container>
      </Atoms.Container>
    </Atoms.Container>
  );
};
