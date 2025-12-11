'use client';

import { useEffect } from 'react';

import * as Atoms from '@/atoms';
import * as Hooks from '@/hooks';
import { DialogFeedbackContent } from './DialogFeedbackContent';
import { DialogFeedbackSuccess } from './DialogFeedbackSuccess';
import type { DialogFeedbackProps } from './DialogFeedback.types';

export function DialogFeedback({ open, onOpenChange }: DialogFeedbackProps) {
  const { currentUserPubky } = Hooks.useCurrentUserProfile();
  const { feedback, handleChange, submit, isSubmitting, isSuccess, hasContent, reset } = Hooks.useFeedback();

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  if (!currentUserPubky) {
    return null;
  }

  return (
    <Atoms.Dialog open={open} onOpenChange={onOpenChange}>
      <Atoms.DialogContent className="w-2xl" hiddenTitle="Provide Feedback">
        {isSuccess ? (
          <DialogFeedbackSuccess onOpenChange={onOpenChange} />
        ) : (
          <DialogFeedbackContent
            feedback={feedback}
            handleChange={handleChange}
            submit={submit}
            isSubmitting={isSubmitting}
            hasContent={hasContent}
            currentUserPubky={currentUserPubky}
          />
        )}
      </Atoms.DialogContent>
    </Atoms.Dialog>
  );
}
