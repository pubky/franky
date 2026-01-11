'use client';

import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import type { DialogReportPostSuccessProps } from './DialogReportPostSuccess.types';

export function DialogReportPostSuccess({ onOpenChange }: DialogReportPostSuccessProps) {
  return (
    <>
      <Atoms.DialogHeader>
        <Atoms.DialogTitle>Report Sent</Atoms.DialogTitle>
        <Atoms.DialogDescription>Your report will be reviewed soon. Thank you.</Atoms.DialogDescription>
      </Atoms.DialogHeader>
      <Atoms.DialogFooter>
        <Atoms.DialogClose asChild>
          <Atoms.Button variant="dark-outline" size="lg" onClick={() => onOpenChange(false)} aria-label="Close dialog">
            <Libs.Check className="size-4" aria-hidden="true" />
            You&apos;re welcome!
          </Atoms.Button>
        </Atoms.DialogClose>
      </Atoms.DialogFooter>
    </>
  );
}
