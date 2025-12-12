'use client';

import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import type { DialogFeedbackSuccessProps } from './DialogFeedbackSuccess.types';

export function DialogFeedbackSuccess({ onOpenChange }: DialogFeedbackSuccessProps) {
  return (
    <>
      <Atoms.DialogHeader>
        <Atoms.DialogTitle>Feedback Received</Atoms.DialogTitle>
        <Atoms.DialogDescription>Thank you for helping us improve Pubky.</Atoms.DialogDescription>
      </Atoms.DialogHeader>
      <Atoms.DialogFooter className="flex-row justify-end">
        <Atoms.DialogClose asChild>
          <Atoms.Button variant="dark-outline" size="lg" onClick={() => onOpenChange(false)} className="rounded-full">
            <Libs.Check className="mr-2 h-4 w-4" />
            You&apos;re welcome!
          </Atoms.Button>
        </Atoms.DialogClose>
      </Atoms.DialogFooter>
    </>
  );
}
