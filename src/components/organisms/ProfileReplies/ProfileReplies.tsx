'use client';

import * as React from 'react';
import Link from 'next/link';
import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';
import { APP_ROUTES } from '@/app';

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
      <Molecules.ContentNotFound
        icon={<Libs.UsersRound size={48} className="text-brand" />}
        title="No replies yet"
        description="Find a post in your feed to reply to."
        backgroundImage="/images/background-6.png"
        mobileBackgroundImage="/images/background-6.png"
        className={className}
      >
        <Link href={APP_ROUTES.HOME}>
          <Atoms.Button variant="secondary" size="sm">
            <Libs.Plus className="w-4 h-4" />
            Create a Post
          </Atoms.Button>
        </Link>
      </Molecules.ContentNotFound>
    );
  }

  return (
    <Atoms.Container className={Libs.cn('flex flex-col gap-4', className)}>
      {mockReplies.map((postId) => (
        <Organisms.SinglePost key={postId} postId={postId} isReply clickable />
      ))}
    </Atoms.Container>
  );
}
