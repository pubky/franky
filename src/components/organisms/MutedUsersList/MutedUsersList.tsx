'use client';

import * as React from 'react';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Libs from '@/libs';
import * as Core from '@/core';
import * as Hooks from '@/hooks';

export function MutedUsersList() {
  const { muted } = Core.useSettingsStore();
  const { unmuteUser, isLoading: isUnmuting, isUserLoading } = Hooks.useMuteUser();
  const { mutedUsers, isLoading } = Hooks.useMutedUsers();

  const handleUnmute = React.useCallback(
    async (userId: Core.Pubky) => {
      await unmuteUser(userId);
    },
    [unmuteUser],
  );

  const handleUnmuteAll = React.useCallback(async () => {
    try {
      // Unmute all users one by one (silent to avoid multiple toasts)
      for (const userId of muted) {
        await unmuteUser(userId, { silent: true });
      }
      Molecules.toast({
        title: 'All users unmuted',
        description: "You'll see posts from all users again",
      });
    } catch (error) {
      Molecules.toast({
        title: 'Error',
        description: Libs.isAppError(error) ? error.message : 'Failed to unmute all users',
      });
    }
  }, [muted, unmuteUser]);

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
                    {mutedUser.avatarUrl && (
                      <Atoms.AvatarImage src={mutedUser.avatarUrl} alt={mutedUser.name || 'User'} />
                    )}
                    <Atoms.AvatarFallback>{mutedUser.name?.[0] || 'U'}</Atoms.AvatarFallback>
                  </Atoms.Avatar>
                  <Atoms.Container overrideDefaults className="inline-flex flex-col items-start justify-center">
                    <span className="text-base font-semibold">{mutedUser.name || 'Unknown User'}</span>
                    <span className="text-sm text-muted-foreground">{mutedUser.id}</span>
                  </Atoms.Container>
                </Atoms.Container>
                <Atoms.Container overrideDefaults className="flex gap-4">
                  <Atoms.Button
                    id="unmute-btn"
                    variant="secondary"
                    size="default"
                    onClick={() => handleUnmute(mutedUser.id)}
                    disabled={isUnmuting || isUserLoading(mutedUser.id)}
                  >
                    {isUnmuting || isUserLoading(mutedUser.id) ? (
                      <Libs.Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Libs.VolumeX size={16} />
                    )}
                    Unmute
                  </Atoms.Button>
                </Atoms.Container>
              </Atoms.Container>
            </Atoms.Container>
          ))}
          {mutedUsers.length > 1 && (
            <>
              <Molecules.SettingsDivider className="my-6 h-px w-full bg-white/10" />
              <Atoms.Button
                variant="secondary"
                size="default"
                onClick={handleUnmuteAll}
                disabled={isUnmuting}
                className="w-(--filter-bar-width)"
              >
                {isUnmuting ? <Libs.Loader2 className="size-4 animate-spin" /> : <Libs.VolumeX size={16} />}
                Unmute all users
              </Atoms.Button>
            </>
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
