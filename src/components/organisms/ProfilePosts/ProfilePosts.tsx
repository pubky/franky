'use client';

import * as React from 'react';
import * as Atoms from '@/atoms';
import * as Organisms from '@/organisms';
import * as Libs from '@/libs';

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
      <Atoms.Card className={Libs.cn('p-12 text-center', className)}>
        <Libs.StickyNote className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <Atoms.Heading level={3} size="lg" className="mb-2">
          No posts yet
        </Atoms.Heading>
        <Atoms.Typography size="md" className="text-muted-foreground">
          Posts will appear here when you create them.
        </Atoms.Typography>
      </Atoms.Card>
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

