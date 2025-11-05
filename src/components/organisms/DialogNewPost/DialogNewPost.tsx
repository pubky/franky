'use client';

import * as Atoms from '@/atoms';
import * as Organisms from '@/organisms';

interface DialogNewPostProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function DialogNewPost({ open, onOpenChange }: DialogNewPostProps) {
  return (
    <Atoms.Dialog open={open} onOpenChange={onOpenChange}>
      <Atoms.DialogContent className="w-3xl" hiddenTitle="New Post">
        <Atoms.DialogHeader>
          <Atoms.DialogTitle>New Post</Atoms.DialogTitle>
        </Atoms.DialogHeader>
        <Atoms.Container className="flex flex-col gap-3">
          <Organisms.DialogPostInput
            variant="new"
            onSuccess={() => {
              onOpenChange?.(false);
            }}
          />
        </Atoms.Container>
      </Atoms.DialogContent>
    </Atoms.Dialog>
  );
}
