'use client';

import * as Libs from '@/libs';
import * as Organisms from '@/organisms';
import * as Atoms from '@/atoms';

export interface DialogPostPreviewProps {
  postId: string;
  variant?: 'reply' | 'repost';
  className?: string;
}

export function DialogPostPreview({ postId, variant = 'reply', className }: DialogPostPreviewProps) {
  const cardClassName = variant === 'repost' ? 'bg-card' : '';

  return (
    <Atoms.Card className={Libs.cn('rounded-md py-0', cardClassName, className)}>
      <Atoms.CardContent className="p-6 flex flex-col gap-4">
        <Organisms.PostHeader postId={postId} />
        <Organisms.PostContent postId={postId} />
      </Atoms.CardContent>
    </Atoms.Card>
  );
}
