'use client';

import * as React from 'react';
import Link from 'next/link';
import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';
import { APP_ROUTES } from '@/app';

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
        icon={<Libs.File size={48} className="text-brand" />}
        title="No posts yet"
        description="What's on your mind?"
        backgroundImage="/images/background-2.png"
        mobileBackgroundImage="/images/background-2.png"
        className={className}
      >
        <Link href={APP_ROUTES.HOME}>
          <Atoms.Button variant="default" size="sm">
            <Libs.Plus className="w-4 h-4" />
            Create a Post
          </Atoms.Button>
        </Link>
      </Molecules.ContentNotFound>
    );
  }

  return (
    <Atoms.Container className={Libs.cn('flex flex-col gap-4', className)}>
      {mockPosts.map((postId) => (
        <Organisms.SinglePost key={postId} postId={postId} clickable />
      ))}
    </Atoms.Container>
  );
}
