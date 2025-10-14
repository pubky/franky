'use client';

import * as React from 'react';
import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';

export interface ProfileTaggedProps {
  className?: string;
}

export function ProfileTagged({ className }: ProfileTaggedProps) {
  // TODO: Replace with actual data fetching
  const mockTaggedPosts: string[] = [];
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

  if (mockTaggedPosts.length === 0) {
    return (
      <Molecules.ContentNotFound
        icon={<Libs.Tag size={48} className="text-brand" />}
        title="No tagged posts"
        description="Posts where you've been tagged will appear here."
        className={className}
      />
    );
  }

  return (
    <Atoms.Container className={Libs.cn('flex flex-col gap-4', className)}>
      {mockTaggedPosts.map((postId) => (
        <Organisms.Post key={postId} postId={postId} clickable />
      ))}
    </Atoms.Container>
  );
}
