'use client';

import * as React from 'react';
import * as Atoms from '@/atoms';
import * as Organisms from '@/organisms';
import * as Libs from '@/libs';

export interface ProfileRepliesProps {
  className?: string;
}

export function ProfileReplies({ className }: ProfileRepliesProps) {
  // TODO: Replace with actual data fetching
  const mockReplies: string[] = [];
  const isLoading = false;

  if (isLoading) {
    return (
      <Atoms.Container className={Libs.cn('flex flex-col gap-4', className)}>
        <Atoms.Card className="p-6 animate-pulse">
          <div className="h-20 bg-muted rounded" />
        </Atoms.Card>
      </Atoms.Container>
    );
  }

  if (mockReplies.length === 0) {
    return (
      <Atoms.Card className={Libs.cn('p-12 text-center', className)}>
        <Libs.MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <Atoms.Heading level={3} size="lg" className="mb-2">
          No replies yet
        </Atoms.Heading>
        <Atoms.Typography size="md" className="text-muted-foreground">
          Replies to posts will appear here.
        </Atoms.Typography>
      </Atoms.Card>
    );
  }

  return (
    <Atoms.Container className={Libs.cn('flex flex-col gap-4', className)}>
      {mockReplies.map((postId) => (
        <Organisms.Post key={postId} postId={postId} isReply clickable />
      ))}
    </Atoms.Container>
  );
}
