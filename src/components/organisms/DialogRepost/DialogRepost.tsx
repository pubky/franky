'use client';

import * as Atoms from '@/atoms';
import * as Organisms from '@/organisms';
import { POST_INPUT_VARIANT } from '@/organisms/PostInput/PostInput.constants';
import type { DialogRepostProps } from './DialogRepost.types';

export function DialogRepost({ postId, open, onOpenChangeAction }: DialogRepostProps) {
  return (
    <Atoms.Dialog open={open} onOpenChange={onOpenChangeAction}>
      <Atoms.DialogContent className="w-3xl" hiddenTitle="Repost">
        <Atoms.DialogHeader>
          <Atoms.DialogTitle>Repost</Atoms.DialogTitle>
          <Atoms.DialogDescription className="sr-only">Repost dialog</Atoms.DialogDescription>
        </Atoms.DialogHeader>
        <Atoms.Container className="gap-3">
          {/* Repost input - repost preview is rendered inside PostInput */}
          <Organisms.PostInput
            dataCy="repost-post-input"
            variant={POST_INPUT_VARIANT.REPOST}
            originalPostId={postId}
            onSuccess={() => {
              onOpenChangeAction(false);
            }}
            showThreadConnector={false}
            expanded={true}
          />
        </Atoms.Container>
      </Atoms.DialogContent>
    </Atoms.Dialog>
  );
}
