'use client';

import { useState } from 'react';

import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';
import * as Libs from '@/libs';
import * as Hooks from '@/hooks';

export function FeedbackCard(): React.ReactElement {
  const { userDetails } = Hooks.useCurrentUserProfile();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const name = userDetails?.name || 'Your Name';
  const avatarUrl = Hooks.useAvatarUrl(userDetails);

  return (
    <>
      <Atoms.Container overrideDefaults={true} data-testid="feedback-card" className="flex flex-col gap-2">
        <Atoms.Heading level={2} size="lg" className="font-light text-muted-foreground">
          Feedback
        </Atoms.Heading>

        <Atoms.Container
          overrideDefaults={true}
          className="flex cursor-pointer flex-col gap-4 rounded-lg border border-dashed border-input p-6"
          onClick={() => setIsDialogOpen(true)}
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
            className="cursor-pointer text-left text-base leading-normal font-medium break-all text-muted-foreground"
          >
            What do you think about Pubky?
          </Atoms.Button>
        </Atoms.Container>
      </Atoms.Container>

      <Organisms.DialogFeedback open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </>
  );
}
