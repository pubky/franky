'use client';

import * as Atoms from '@/atoms';
import * as Organisms from '@/organisms';

interface DialogRepostProps {
  postId: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function DialogRepost({ postId, open, onOpenChange }: DialogRepostProps) {
  return (
    <Atoms.Dialog open={open} onOpenChange={onOpenChange}>
      <Atoms.DialogContent className="w-3xl" hiddenTitle="Repost">
        <Atoms.DialogHeader>
          <Atoms.DialogTitle>Repost</Atoms.DialogTitle>
        </Atoms.DialogHeader>
        <Atoms.Container className="flex flex-col gap-3">
          <Organisms.DialogPostInput
            variant="repost"
            postId={postId}
            onSuccess={() => {
              onOpenChange?.(false);
            }}
          />
        </Atoms.Container>
      </Atoms.DialogContent>
    </Atoms.Dialog>
  );
}
