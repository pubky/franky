'use client';

import * as Atoms from '@/atoms';
import * as Hooks from '@/hooks';
import * as Organisms from '@/organisms';
import { POST_INPUT_VARIANT } from '@/organisms/PostInput/PostInput.constants';
import type { DialogNewPostProps } from './DialogNewPost.types';

export function DialogNewPost({ open, onOpenChangeAction }: DialogNewPostProps) {
  const { showConfirmDialog, setShowConfirmDialog, resetKey, handleContentChange, handleOpenChange, handleDiscard } =
    Hooks.useConfirmableDialog({
      onClose: () => onOpenChangeAction(false),
    });

  return (
    <>
      <Organisms.DialogConfirmDiscard
        open={showConfirmDialog}
        onOpenChange={() => setShowConfirmDialog(false)}
        onConfirm={handleDiscard}
      />
      <Atoms.Dialog open={open} onOpenChange={handleOpenChange}>
        <Atoms.DialogContent className="w-3xl" hiddenTitle="New post">
          <Atoms.DialogHeader>
            <Atoms.DialogTitle>New Post</Atoms.DialogTitle>
            <Atoms.DialogDescription className="sr-only">New post dialog</Atoms.DialogDescription>
          </Atoms.DialogHeader>
          <Atoms.Container className="gap-3">
            <Organisms.PostInput
              key={resetKey}
              variant={POST_INPUT_VARIANT.POST}
              onSuccess={() => onOpenChangeAction(false)}
              expanded={true}
              onContentChange={handleContentChange}
            />
          </Atoms.Container>
        </Atoms.DialogContent>
      </Atoms.Dialog>
    </>
  );
}
