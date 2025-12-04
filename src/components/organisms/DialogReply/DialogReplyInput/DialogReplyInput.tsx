'use client';

import * as Organisms from '@/organisms';
import { POST_INPUT_VARIANT } from '@/organisms/PostInput/PostInput.constants';
import type { DialogReplyInputProps } from './DialogReplyInput.types';

export function DialogReplyInput({ postId, onSuccessAction }: DialogReplyInputProps) {
  return (
    <Organisms.PostInput
      variant={POST_INPUT_VARIANT.REPLY}
      postId={postId}
      onSuccess={onSuccessAction}
      showThreadConnector={true}
    />
  );
}
