'use client';

import * as Atoms from '@/atoms';
import * as Organisms from '@/organisms';

interface DialogReplyProps {
  postId: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function DialogReply({ postId, open, onOpenChange }: DialogReplyProps) {
  return (
    <Atoms.Dialog open={open} onOpenChange={onOpenChange}>
      <Atoms.DialogContent className="w-3xl" hiddenTitle="Reply to post">
        <Atoms.DialogHeader>
          <Atoms.DialogTitle>Reply</Atoms.DialogTitle>
        </Atoms.DialogHeader>
        <Atoms.Container className="flex flex-col gap-3">
          <Organisms.DialogReplyPost postId={postId} />
          <div className="relative pl-6">
            <Organisms.DialogReplyInput
              postId={postId}
              onSuccess={() => {
                onOpenChange?.(false);
              }}
            />
          </div>
        </Atoms.Container>
      </Atoms.DialogContent>
    </Atoms.Dialog>
  );
}
