'use client';

import { useEffect } from 'react';

import * as Atoms from '@/atoms';
import * as Organisms from '@/organisms';
import * as Libs from '@/libs';
import * as Hooks from '@/hooks';
import { FEEDBACK_MAX_CHARACTER_LENGTH } from '@/config';
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
          <>
            <Atoms.DialogHeader>
              <Atoms.DialogTitle>Feedback Received</Atoms.DialogTitle>
              <Atoms.DialogDescription>Thank you for helping us improve Pubky.</Atoms.DialogDescription>
            </Atoms.DialogHeader>
            <Atoms.DialogFooter className="flex-row justify-end">
              <Atoms.DialogClose asChild>
                <Atoms.Button
                  variant="dark-outline"
                  size="lg"
                  onClick={() => onOpenChange(false)}
                  className="rounded-full"
                >
                  <Libs.Check className="mr-2 h-4 w-4" />
                  You&apos;re welcome!
                </Atoms.Button>
              </Atoms.DialogClose>
            </Atoms.DialogFooter>
          </>
        ) : (
          <>
            <Atoms.DialogHeader>
              <Atoms.DialogTitle>Provide Feedback</Atoms.DialogTitle>
              <Atoms.DialogDescription className="sr-only">Feedback dialog</Atoms.DialogDescription>
            </Atoms.DialogHeader>
            <Atoms.Container className="gap-3">
              <Atoms.Container overrideDefaults className="rounded-md border border-dashed border-input p-6">
                <Atoms.Container className="gap-4" overrideDefaults>
                  <Organisms.PostHeader
                    postId={currentUserPubky}
                    isReplyInput={true}
                    characterCount={feedback.length > 0 ? feedback.length : undefined}
                    maxLength={FEEDBACK_MAX_CHARACTER_LENGTH}
                  />

                  <Atoms.Textarea
                    placeholder="What do you think about Pubky? Any suggestions?"
                    className="min-h-6 resize-none border-none bg-transparent px-0 py-4 text-base font-medium break-all text-secondary-foreground shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    value={feedback}
                    onChange={handleChange}
                    maxLength={FEEDBACK_MAX_CHARACTER_LENGTH}
                    rows={1}
                    disabled={isSubmitting}
                  />

                  <Atoms.Container
                    className={`flex items-center justify-end transition-all duration-300 ease-in-out ${
                      hasContent ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-2 opacity-0'
                    }`}
                    overrideDefaults
                  >
                    <Atoms.Button
                      variant="secondary"
                      size="sm"
                      onClick={submit}
                      disabled={!hasContent || isSubmitting}
                      className="h-8 rounded-full border-none px-3 py-2 shadow-xs-dark"
                    >
                      {isSubmitting ? (
                        <Libs.Loader2 className="size-4 animate-spin text-secondary-foreground" strokeWidth={2} />
                      ) : (
                        <Atoms.Container className="flex items-center gap-2" overrideDefaults>
                          <Libs.Send className="size-4 text-secondary-foreground" strokeWidth={2} />
                          <Atoms.Typography
                            as="span"
                            size="sm"
                            className="text-xs leading-4 font-bold text-secondary-foreground"
                          >
                            Send
                          </Atoms.Typography>
                        </Atoms.Container>
                      )}
                    </Atoms.Button>
                  </Atoms.Container>
                </Atoms.Container>
              </Atoms.Container>
            </Atoms.Container>
          </>
        )}
      </Atoms.DialogContent>
    </Atoms.Dialog>
  );
}
