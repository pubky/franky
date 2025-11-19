'use client';

import * as Atoms from '@/atoms';
import * as Libs from '@/libs';

export function FeedbackCard() {
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
            <Atoms.Avatar className="h-12 w-12">
              <Atoms.AvatarImage src="https://i.pravatar.cc/150?img=68" alt="User" />
              <Atoms.AvatarFallback>
                <Libs.User className="h-5 w-5" />
              </Atoms.AvatarFallback>
            </Atoms.Avatar>
          </Atoms.Container>
          <Atoms.Container overrideDefaults={true} className="text-base font-bold text-foreground">
            Your Name
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
