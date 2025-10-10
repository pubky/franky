'use client';

import * as React from 'react';
import * as Molecules from '@/molecules';
import * as Libs from '@/libs';

export function ProfilePostsPage() {
  const handleCreatePost = () => {
    // TODO: Open create post modal
  };

  return (
    <Molecules.EmptyState
      icon={Libs.StickyNote}
      title="No posts yet"
      description="Share your thoughts and ideas with the community."
      action={{
        label: 'Create your first post',
        onClick: handleCreatePost,
      }}
    />
  );
}
