'use client';

import { useEffect } from 'react';

import * as Atoms from '@/atoms';
import * as Hooks from '@/hooks';
import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';
import type { DialogFeedbackProps } from './DialogFeedback.types';
import { FEEDBACK_MAX_CHARACTER_LENGTH } from '@/config';

export function DialogFeedback({ open, onOpenChange }: DialogFeedbackProps) {
  const { currentUserPubky } = Hooks.useCurrentUserProfile();
  const { feedback, handleChange, submit, isSubmitting, isSuccess, hasContent, reset } = Hooks.useFeedback();

  // Reset state when the dialog closes
  // We can also add - "Are you sure you want to close?" prompt if we want to be extra careful about this, e.g. "You have unsaved changes. Are you sure you want to close?"
  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  // This may take some time to load, so we don't want to show the dialog until it's ready, cause we need this variable down the line.
  if (!currentUserPubky) {
    return null;
  }

  return (
    <Atoms.Dialog open={open} onOpenChange={onOpenChange}>
      <Atoms.DialogContent className="w-2xl" hiddenTitle="Provide Feedback">
        {isSuccess ? (
          <Molecules.DialogFeedbackSuccess onOpenChange={onOpenChange} />
        ) : (
          <Molecules.DialogFeedbackContent
            feedback={feedback}
            handleChange={handleChange}
            submit={submit}
            isSubmitting={isSubmitting}
            hasContent={hasContent}
            currentUserPubky={currentUserPubky}
          >
            <Organisms.PostHeader
              postId={currentUserPubky}
              isReplyInput={true}
              characterCount={feedback.length > 0 ? feedback.length : undefined}
              maxLength={FEEDBACK_MAX_CHARACTER_LENGTH}
            />
          </Molecules.DialogFeedbackContent>
        )}
      </Atoms.DialogContent>
    </Atoms.Dialog>
  );
}
