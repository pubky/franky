'use client';

import * as React from 'react';
import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import * as Hooks from '@/hooks';
import * as Molecules from '@/molecules';
import type { MutedUser } from './MutedUsersList.types';

export function MutedUsersList() {
  const { mutedUserIds, isLoading: isMutedLoading } = Hooks.useMutedUsers();
  const { usersMap, isLoading: isUsersLoading } = Hooks.useBulkUserAvatars(mutedUserIds);
  const { toggleMute, isLoading: isMuteLoading, isUserLoading: isMuteUserLoading } = Hooks.useMuteUser();
  const [isLoadingUnmuteAll, setIsLoadingUnmuteAll] = React.useState(false);

  // Convert muted user IDs to MutedUser objects
  const mutedUsers: MutedUser[] = mutedUserIds.map((id) => {
    const user = usersMap.get(id);
    return {
      id,
      name: user?.name,
      avatar: user?.avatarUrl ?? undefined,
    };
  });

  const isLoading = isMutedLoading || isUsersLoading;

  const handleUnmute = async (userId: string, userName?: string) => {
    try {
      await toggleMute(userId, true);
      Molecules.toast({
        title: 'User unmuted',
        description: `${userName || userId} has been unmuted.`,
      });
    } catch (error) {
      Molecules.toast({
        title: 'Error',
        description: Libs.isAppError(error) ? error.message : 'Failed to update mute status',
      });
    }
  };

  const handleUnmuteAll = async () => {
    if (mutedUserIds.length === 0) return;

    // Capture the current list to avoid issues with reactive updates during iteration
    const idsToUnmute = [...mutedUserIds];

    setIsLoadingUnmuteAll(true);
    try {
      for (const userId of idsToUnmute) {
        await toggleMute(userId, true);
      }
      Molecules.toast({
        title: 'All users unmuted',
        description: 'All muted users have been unmuted.',
      });
    } catch (error) {
      Molecules.toast({
        title: 'Error',
        description: Libs.isAppError(error) ? error.message : 'Failed to update mute status',
      });
    } finally {
      setIsLoadingUnmuteAll(false);
    }
  };

  return (
    <Atoms.Container overrideDefaults className="inline-flex w-full flex-col gap-3">
      {isLoading ? (
        <Atoms.Container overrideDefaults className="w-full">
          <Atoms.Typography size="md" className="font-medium text-muted-foreground">
            Loading...
          </Atoms.Typography>
        </Atoms.Container>
      ) : mutedUsers && mutedUsers.length > 0 ? (
        <>
          {mutedUsers.map((mutedUser) => (
            <Atoms.Container overrideDefaults key={mutedUser?.id} className="w-full">
              <Atoms.Container overrideDefaults className="inline-flex w-full flex-col justify-start gap-4 md:flex-row">
                <Atoms.Container overrideDefaults className="flex w-full gap-2">
                  <Atoms.Avatar className="h-12 w-12">
                    {mutedUser?.avatar && <Atoms.AvatarImage src={mutedUser.avatar} alt={mutedUser?.name ?? 'User'} />}
                    <Atoms.AvatarFallback>{mutedUser?.name?.[0] || 'U'}</Atoms.AvatarFallback>
                  </Atoms.Avatar>
                  <Atoms.Container overrideDefaults className="inline-flex flex-col items-start justify-center">
                    <span className="text-base font-semibold">{mutedUser?.name || 'Unknown User'}</span>
                    <span className="text-sm text-muted-foreground">{mutedUser?.id || ''}</span>
                  </Atoms.Container>
                </Atoms.Container>
                <Atoms.Container overrideDefaults className="flex gap-4">
                  <Atoms.Button
                    id="unmute-btn"
                    variant="secondary"
                    size="default"
                    onClick={() => handleUnmute(mutedUser.id, mutedUser?.name)}
                    disabled={isMuteLoading || isMuteUserLoading(mutedUser.id)}
                  >
                    <Libs.VolumeX size={16} />
                    Unmute
                  </Atoms.Button>
                </Atoms.Container>
              </Atoms.Container>
            </Atoms.Container>
          ))}
          {mutedUsers.length > 1 && (
            <Atoms.Container overrideDefaults className="mt-6">
              <Atoms.Button
                variant="secondary"
                size="default"
                onClick={handleUnmuteAll}
                disabled={isLoadingUnmuteAll}
                className="w-(--filter-bar-width)"
              >
                <Libs.VolumeX size={16} />
                Unmute all users
              </Atoms.Button>
            </Atoms.Container>
          )}
        </>
      ) : (
        <h2 className="mt-5 flex self-center text-center text-2xl leading-8 font-normal opacity-20">
          No muted users yet
        </h2>
      )}
    </Atoms.Container>
  );
}
