'use client';

import { useState } from 'react';

import * as Atoms from '@/atoms';
import * as Libs from '@/libs';

interface DialogFeedbackProps {
  name: string;
  avatar: string;
}

export function DialogFeedback({ name, avatar }: DialogFeedbackProps) {
  const [sent, setSent] = useState(false);

  return (
    <Atoms.Dialog>
      <Atoms.DialogTrigger asChild>
        <Atoms.Container className="flex cursor-pointer flex-col gap-4 rounded-lg border border-dashed p-6">
          <Atoms.Avatar className="size-12">
            <Atoms.AvatarImage src={avatar} alt={name} />
            <Atoms.AvatarFallback>{Libs.extractInitials({ name, maxLength: 2 })}</Atoms.AvatarFallback>
          </Atoms.Avatar>
          <Atoms.Typography size="sm" className="text-base font-medium break-all text-muted-foreground">
            What do you think about Pubky?
          </Atoms.Typography>
        </Atoms.Container>
      </Atoms.DialogTrigger>
      <Atoms.DialogContent className="gap-0 sm:max-w-xl" hiddenTitle="Provide Feedback">
        <Atoms.DialogHeader className="pr-6">
          <Atoms.DialogTitle>Provide Feedback</Atoms.DialogTitle>
        </Atoms.DialogHeader>
        <Atoms.Container className="h-full overflow-y-auto pr-4">
          <Atoms.Container className="gap-6">
            {sent ? (
              <>
                <Atoms.Typography size="sm" className="font-normal text-muted-foreground">
                  Thank you for helping us improve Pubky.
                </Atoms.Typography>
                <Atoms.Button size="lg" variant="outline" onClick={() => setSent(false)}>
                  <Libs.Check className="mr-2 h-4 w-4" />
                  You&apos;re welcome!
                </Atoms.Button>
              </>
            ) : (
              <Atoms.Typography onClick={() => setSent(true)} size="sm" className="font-normal text-muted-foreground">
                Input Feedback
              </Atoms.Typography>
            )}
          </Atoms.Container>
        </Atoms.Container>
      </Atoms.DialogContent>
    </Atoms.Dialog>
  );
}
