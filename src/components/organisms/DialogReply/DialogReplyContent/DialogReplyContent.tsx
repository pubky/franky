'use client';

import * as Atoms from '@/atoms';
import { DialogReplyInput } from '../DialogReplyInput';
import { DialogReplyPost } from '../DialogReplyPost';
import type { DialogReplyContentProps } from './DialogReplyContent.types';

export function DialogReplyContent({ postId, open, onOpenChangeAction }: DialogReplyContentProps) {
  return (
    <Atoms.Dialog open={open} onOpenChange={onOpenChangeAction}>
      <Atoms.DialogContent className="w-3xl" hiddenTitle="Reply to post">
        <Atoms.DialogHeader>
          <Atoms.DialogTitle>Reply</Atoms.DialogTitle>
          <Atoms.DialogDescription className="sr-only">Reply dialog</Atoms.DialogDescription>
        </Atoms.DialogHeader>
        <Atoms.Container className="gap-3">
          <DialogReplyPost postId={postId} />
          <Atoms.Container className="relative pl-6" overrideDefaults>
            <DialogReplyInput
              postId={postId}
              onSuccessAction={() => {
                onOpenChangeAction(false);
              }}
            />
          </Atoms.Container>
        </Atoms.Container>
      </Atoms.DialogContent>
    </Atoms.Dialog>
  );
}
