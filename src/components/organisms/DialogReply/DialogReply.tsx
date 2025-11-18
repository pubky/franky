'use client';

import * as Atoms from '@/atoms';
import * as Organisms from '@/organisms';

interface DialogReplyProps {
  postId: string;
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
}

export function DialogReply({ postId, open, onOpenChangeAction }: DialogReplyProps) {
  return (
    <Atoms.Dialog open={open} onOpenChange={onOpenChangeAction}>
      <Atoms.DialogContent className="w-3xl" hiddenTitle="Reply to post">
        <Atoms.DialogHeader>
          <Atoms.DialogTitle>Reply</Atoms.DialogTitle>
          <Atoms.DialogDescription className="sr-only">Reply dialog</Atoms.DialogDescription>
        </Atoms.DialogHeader>
        <Atoms.Container className="gap-3">
          <Organisms.DialogReplyPost postId={postId} />
          <Atoms.Container className="relative pl-6" overrideDefaults>
            <Organisms.DialogReplyInput
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
