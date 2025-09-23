'use client';

import * as Atoms from '@/atoms';
import { PostMock } from '@/core';

interface PostProps {
  post: PostMock;
}

export function Post({ post }: PostProps) {
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <Atoms.Card className="p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
      <Atoms.Container className="flex flex-col gap-3">
        {/* Post ID (only show first 8 chars for better readability) */}
        <Atoms.Container className="flex items-center gap-2">
          <Atoms.Typography size="sm" className="text-muted-foreground font-mono">
            ID: {post.id.substring(0, 8)}...
          </Atoms.Typography>
        </Atoms.Container>

        {/* Post Content */}
        <Atoms.Container>
          <Atoms.Typography size="md" className="text-foreground leading-relaxed">
            {post.text}
          </Atoms.Typography>
        </Atoms.Container>

        {/* Timestamp */}
        <Atoms.Container className="flex justify-between items-center pt-2 border-t border-border/30">
          <Atoms.Typography size="sm" className="text-muted-foreground">
            {formatTimestamp(post.createdAt)}
          </Atoms.Typography>
          <Atoms.Typography size="sm" className="text-muted-foreground/70 font-mono hidden sm:block">
            {post.createdAt}
          </Atoms.Typography>
        </Atoms.Container>
      </Atoms.Container>
    </Atoms.Card>
  );
}
