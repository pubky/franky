'use client';

import * as React from 'react';
import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';

export interface ProfilePostsProps {
  className?: string;
}

export function ProfilePosts({ className }: ProfilePostsProps) {
  // TODO: Replace with actual data fetching
  const mockPosts: string[] = [];
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

  if (mockPosts.length === 0) {
    return (
      <Molecules.ContentNotFound
        icon={<Libs.StickyNote size={48} className="text-brand" />}
        title="No posts yet"
        description="Posts will appear here when you create them."
        className={className}
      />
    );
  }

  return (
    <Atoms.Container className={Libs.cn('flex flex-col gap-4', className)}>
      {mockPosts.map((postId) => (
        <Organisms.Post key={postId} postId={postId} clickable />
      ))}
    </Atoms.Container>
  );
}
