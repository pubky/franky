'use client';

import { useState } from 'react';

import * as Atoms from '@/atoms';
import * as Libs from '@/libs';

export function DialogFeedback() {
  const [sent, setSent] = useState(false);
  const name = 'John Doe';
  const avatar = '';

  const renderFeedbackContent = () => {
    if (sent) {
      return (
        <>
          <Atoms.Typography size="sm" className="text-muted-foreground font-normal">
            Thank you for helping us improve Pubky.
          </Atoms.Typography>
          <Atoms.Button size="lg" variant="outline" onClick={() => setSent(false)}>
            <Libs.Check className="mr-2 h-4 w-4" />
            You&apos;re welcome!
          </Atoms.Button>
        </>
      );
    }

    return (
      <Atoms.Typography onClick={() => setSent(true)} size="sm" className="text-muted-foreground font-normal">
        Input Feedback
      </Atoms.Typography>
    );
  };

  return (
    <Atoms.Dialog>
      <Atoms.DialogTrigger asChild>
        <Atoms.Container className="cursor-pointer flex flex-col gap-4 p-6 rounded-lg border border-dashed">
          <Atoms.Avatar className="size-12">
            <Atoms.AvatarImage src={avatar} alt={name} />
            <Atoms.AvatarFallback>
              {name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()}
            </Atoms.AvatarFallback>
          </Atoms.Avatar>
          <Atoms.Typography size="sm" className="text-base text-muted-foreground font-medium">
            What do you think about Pubky?
          </Atoms.Typography>
        </Atoms.Container>
      </Atoms.DialogTrigger>
      <Atoms.DialogContent className="sm:max-w-xl gap-0">
        <Atoms.DialogHeader className="pr-6">
          <Atoms.DialogTitle>Provide Feedback</Atoms.DialogTitle>
        </Atoms.DialogHeader>
        <Atoms.Container className="h-full pr-4 overflow-y-auto">
          <Atoms.Container className="gap-6">{renderFeedbackContent()}</Atoms.Container>
        </Atoms.Container>
      </Atoms.DialogContent>
    </Atoms.Dialog>
  );
}
