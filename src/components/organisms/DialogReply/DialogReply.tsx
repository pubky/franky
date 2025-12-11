'use client';

import * as Atoms from '@/atoms';
import * as Organisms from '@/organisms';
import { POST_INPUT_VARIANT } from '@/organisms/PostInput/PostInput.constants';
import type { DialogReplyProps } from './DialogReply.types';

export function DialogReply({ postId, open, onOpenChangeAction }: DialogReplyProps): React.ReactElement {
  return (
    <Atoms.Dialog open={open} onOpenChange={onOpenChangeAction}>
      <Atoms.DialogContent className="w-3xl" hiddenTitle="Reply to post">
        <Atoms.DialogHeader>
          <Atoms.DialogTitle>Reply</Atoms.DialogTitle>
          <Atoms.DialogDescription className="sr-only">Reply dialog</Atoms.DialogDescription>
        </Atoms.DialogHeader>
        <Atoms.Container className="gap-3">
          {/* Post being replied to */}
          <Atoms.Card className="rounded-md py-0">
            <Atoms.CardContent className="flex flex-col gap-4 p-6">
              <Organisms.PostHeader postId={postId} />
              <Organisms.PostContent postId={postId} />
            </Atoms.CardContent>
          </Atoms.Card>

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
            />
          </Atoms.Container>
        </Atoms.Container>
      </Atoms.DialogContent>
    </Atoms.Dialog>
  );
}
