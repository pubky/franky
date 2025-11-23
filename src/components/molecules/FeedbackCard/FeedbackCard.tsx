'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Libs from '@/libs';
import * as Core from '@/core';

export function FeedbackCard() {
  const { currentUserPubky } = Core.useAuthStore();

  const userDetails = useLiveQuery(async () => {
    if (!currentUserPubky) return null;
    return await Core.ProfileController.read({ userId: currentUserPubky });
  }, [currentUserPubky]);

  const name = userDetails?.name || 'Your Name';
  const avatarUrl =
    userDetails?.image && currentUserPubky ? Core.FileController.getAvatarUrl(currentUserPubky) : undefined;

  return (
    <Atoms.Container overrideDefaults={true} data-testid="feedback-card" className="flex flex-col gap-2">
      <Atoms.Heading level={2} size="lg" className="font-light text-muted-foreground">
        Feedback
      </Atoms.Heading>

      <Atoms.Container
        overrideDefaults={true}
        className="flex flex-col gap-4 rounded-lg border border-dashed border-input p-6"
      >
        <Atoms.Container overrideDefaults={true} className="flex items-center gap-2">
          <Atoms.Container
            overrideDefaults={true}
            className="flex size-12 items-center justify-center rounded-md p-2 shadow-xs"
          >
            <Molecules.AvatarWithFallback
              avatarUrl={avatarUrl}
              name={name}
              className="h-12 w-12"
              fallbackClassName="text-sm"
            />
          </Atoms.Container>
          <Atoms.Container overrideDefaults={true} className="text-base font-bold text-foreground">
            {Libs.truncateString(name, 10)}
          </Atoms.Container>
        </Atoms.Container>

        <Atoms.Button
          overrideDefaults
          className="cursor-pointer text-left text-base leading-normal font-medium break-all text-muted-foreground hover:text-foreground"
        >
          What do you think about Pubky?
        </Atoms.Button>
      </Atoms.Container>
    </Atoms.Container>
  );
}
