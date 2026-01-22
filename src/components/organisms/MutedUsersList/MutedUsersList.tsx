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
      // Use Promise.allSettled for parallel execution with graceful error handling
      const results = await Promise.allSettled(idsToUnmute.map((userId) => toggleMute(userId, true)));

      const failedCount = results.filter((r) => r.status === 'rejected').length;
      if (failedCount > 0) {
        Molecules.toast({
          title: 'Partial success',
          description: `${idsToUnmute.length - failedCount} users unmuted, ${failedCount} failed.`,
        });
      } else {
        Molecules.toast({
          title: 'All users unmuted',
          description: 'All muted users have been unmuted.',
        });
      }
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
    <Atoms.Container overrideDefaults className="inline-flex w-full flex-col gap-6">
      {isLoading ? (
        <Atoms.Container overrideDefaults className="w-full">
          <Atoms.Typography size="md" className="font-medium text-muted-foreground">
            Loading...
          </Atoms.Typography>
        </Atoms.Container>
      ) : mutedUsers && mutedUsers.length > 0 ? (
        <>
          {mutedUsers.map((mutedUser) => (
            <Atoms.Container
              overrideDefaults
              key={mutedUser?.id}
              className="flex w-full items-center justify-between gap-4"
            >
              <Atoms.Link
                href={`/profile/${mutedUser.id}`}
                overrideDefaults
                className="flex flex-1 items-center gap-3 hover:opacity-80"
              >
                <Atoms.Avatar className="h-10 w-10">
                  {mutedUser?.avatar && <Atoms.AvatarImage src={mutedUser.avatar} alt={mutedUser?.name ?? 'User'} />}
                  <Atoms.AvatarFallback>{mutedUser?.name?.[0] || 'U'}</Atoms.AvatarFallback>
                </Atoms.Avatar>
                <Atoms.Container overrideDefaults className="inline-flex flex-col items-start justify-center">
                  <span className="text-base font-bold">{mutedUser?.name || 'Unknown User'}</span>
                  <span className="text-xs tracking-widest text-muted-foreground uppercase">
                    {Libs.truncateString(mutedUser?.id || '', 12)}
                  </span>
                </Atoms.Container>
              </Atoms.Link>
              <Atoms.Button
                id="unmute-btn"
                variant="secondary"
                size="sm"
                className="rounded-full"
                onClick={() => handleUnmute(mutedUser.id, mutedUser?.name)}
                disabled={isMuteLoading || isMuteUserLoading(mutedUser.id)}
              >
                <Libs.Megaphone size={16} />
                Unmute
              </Atoms.Button>
            </Atoms.Container>
          ))}
          {mutedUsers.length > 1 && (
            <Atoms.Button
              variant="secondary"
              size="lg"
              className="rounded-full"
              onClick={handleUnmuteAll}
              disabled={isLoadingUnmuteAll}
            >
              <Libs.Megaphone size={16} />
              Unmute all users
            </Atoms.Button>
          )}
        </>
      ) : (
        <Atoms.Typography as="p" size="lg" overrideDefaults className="w-full py-4 text-center text-muted-foreground">
          No muted users yet
        </Atoms.Typography>
      )}
    </Atoms.Container>
  );
}
