'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import * as Hooks from '@/hooks';
import * as Core from '@/core';
import * as Templates from '@/templates';
import { useRouter } from 'next/navigation';

export const ProfileHeader = ({ pubkySlug }: Templates.TProfilePageProps) => {
  const { copyToClipboard } = Hooks.useCopyToClipboard();
  const { currentUserPubky } = Core.useProfileStore();
  const isOwnProfile = currentUserPubky === pubkySlug;
  const router = useRouter();

  const userDetails = useLiveQuery(() => Core.db.user_details.get(pubkySlug).then((user) => user), [pubkySlug]);

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
      onClick={() => copyToClipboard(pubkySlug)}
    >
      <Libs.Key className="w-4 h-4" />
      {Libs.formatPublicKey({ key: pubkySlug, length: 10 })}
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
          router.push('/logout');
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

  const getCurrentStatusOption = (status: string) => {
    return (
      Core.USER_STATUS_LIST.find((option) => option.label.toLowerCase() === status.toLowerCase()) ||
      Core.USER_STATUS_LIST[0]
    );
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      // Update the local database immediately for optimistic UI updates
      await Core.db.user_details.update(pubkySlug, { status: newStatus });
      console.log('Status updated to:', newStatus);

      // TODO: Sync status change to homeserver
      // This should be implemented as part of the UserController or a new method
      // that handles partial profile updates
    } catch (error) {
      console.error('Failed to update status:', error);
      // TODO: Show error toast to user
    }
  };

  const renderStatusDropdown = (status: string) => {
    const currentStatus = getCurrentStatusOption(status);

    return (
      <Atoms.Container className="flex items-center gap-2 w-auto m-0">
        <Atoms.Popover>
          <Atoms.PopoverTrigger asChild>
            <Atoms.Button
              variant="secondary"
              className={Libs.cn(
                'rounded-full gap-2 px-3 py-1 hover:bg-muted/80 transition-colors',
                status.toLowerCase() === Core.UserStatus.AWAY &&
                  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
              )}
            >
              <span className="text-lg">{currentStatus.emoji}</span>
              {currentStatus.label}
              <Libs.ChevronDown className="w-3 h-3 ml-1" />
            </Atoms.Button>
          </Atoms.PopoverTrigger>
          <Atoms.PopoverContent className="w-64 p-2" align="start">
            <div className="space-y-1">
              {Core.USER_STATUS_LIST.map((option) => (
                <Atoms.Button
                  key={option.id}
                  variant="ghost"
                  className="w-full justify-start gap-3 px-3 py-2 h-auto text-left hover:bg-muted/50"
                  onClick={() => handleStatusChange(option.label)}
                >
                  <span className="text-lg">{option.emoji}</span>
                  <span className="flex-1">{option.label}</span>
                  {currentStatus.id === option.id && <Libs.Check className="w-4 h-4 text-primary" />}
                </Atoms.Button>
              ))}

              <div className="border-t pt-2 mt-2">
                <div className="text-sm text-muted-foreground px-3 py-1 uppercase tracking-wide font-medium">
                  Custom Status
                </div>
                <Atoms.Button
                  variant="ghost"
                  className="w-full justify-start gap-3 px-3 py-2 h-auto text-left hover:bg-muted/50 border-2 border-dashed border-muted-foreground/20"
                  onClick={() => {
                    // TODO: Implement custom status functionality
                    console.log('Add custom status clicked');
                  }}
                >
                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                    <Libs.Smile className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <span className="flex-1 text-muted-foreground">Add status</span>
                </Atoms.Button>
              </div>
            </div>
          </Atoms.PopoverContent>
        </Atoms.Popover>
      </Atoms.Container>
    );
  };

  return (
    <Atoms.Container className={Libs.cn('flex flex-row gap-6 p-6 bg-background')}>
      {/* Avatar */}
      <Atoms.Container className="flex flex-row items-center gap-4 w-auto m-0">
        <Atoms.Avatar className="w-40 h-40 md:w-40 md:h-40">
          <Atoms.AvatarImage
            src={Libs.buildNexusStaticUrl(Core.FILES_API.GET_AVATAR(pubkySlug))}
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
          {pubkySlug && renderUserPublicKey()}
          {isOwnProfile && renderActionButtons()}
          {status && renderStatusDropdown(status)}
        </Atoms.Container>
      </Atoms.Container>
    </Atoms.Container>
  );
};
