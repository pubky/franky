'use client';

import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';
import { POST_INPUT_VARIANT } from '@/organisms/PostInput/PostInput.constants';
import type { DialogReplyProps } from './DialogReply.types';

export function DialogReply({ postId, open, onOpenChangeAction }: DialogReplyProps) {
  return (
    <Atoms.Dialog open={open} onOpenChange={onOpenChangeAction}>
      <Atoms.DialogContent className="w-3xl" hiddenTitle="Reply to post">
        <Atoms.DialogHeader>
          <Atoms.DialogTitle>Reply</Atoms.DialogTitle>
          <Atoms.DialogDescription className="sr-only">Reply dialog</Atoms.DialogDescription>
        </Atoms.DialogHeader>
        <Atoms.Container className="gap-3">
          {/* Post being replied to */}
          <Molecules.PostPreviewCard postId={postId} />

          {/* Reply input */}
          <Atoms.Container className="relative pl-6" overrideDefaults>
            <Organisms.PostInput
              variant={POST_INPUT_VARIANT.REPLY}
              postId={postId}
              onSuccess={() => {
                onOpenChangeAction(false);
              }}
              showThreadConnector={true}
              expanded={true}
              hideArticle={true}
            />
          </Atoms.Container>
        </Atoms.Container>
      </Atoms.DialogContent>
    </Atoms.Dialog>
  );
}
