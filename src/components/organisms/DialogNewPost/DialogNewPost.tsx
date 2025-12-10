'use client';

import * as Atoms from '@/atoms';
import * as Organisms from '@/organisms';
import { POST_INPUT_VARIANT } from '@/organisms/PostInput/PostInput.constants';
import type { DialogNewPostProps } from './DialogNewPost.types';

export function DialogNewPost({ open, onOpenChangeAction }: DialogNewPostProps) {
  return (
    <Atoms.Dialog open={open} onOpenChange={onOpenChangeAction}>
      <Atoms.DialogContent className="w-3xl" hiddenTitle="New post">
        <Atoms.DialogHeader>
          <Atoms.DialogTitle>New Post</Atoms.DialogTitle>
          <Atoms.DialogDescription className="sr-only">New post dialog</Atoms.DialogDescription>
        </Atoms.DialogHeader>
        <Atoms.Container className="gap-3">
          <Organisms.PostInput
            variant={POST_INPUT_VARIANT.POST}
            onSuccess={() => {
              onOpenChangeAction(false);
            }}
            expanded={true}
          />
        </Atoms.Container>
      </Atoms.DialogContent>
    </Atoms.Dialog>
  );
}
