'use client';

import { useState } from 'react';
import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import * as Core from '@/core';
import * as Molecules from '@/molecules';

interface PostWideProps {
  post: Core.NexusPost;
  clickable?: boolean;
}

export function PostWide({ post, clickable = false }: PostWideProps) {
  const [currentTags, setCurrentTags] = useState(post.tags);

  const handleTagAdded = (newTags: Core.NexusTag[]) => {
    setCurrentTags(newTags as Core.TagModel[]);
  };

  return (
    <Atoms.Card className={`p-6 rounded-lg ${clickable ? 'cursor-pointer hover:bg-accent/50 transition-colors' : ''}`}>
      {/* Desktop: 3-column grid, Mobile: single column */}
      <Atoms.Container className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Atoms.Container className="flex flex-col lg:col-span-2 gap-4">
          {/* Header */}
          <Atoms.Container className="flex items-center gap-3">
            <Atoms.Container className="flex flex-row gap-4">
              <Atoms.Avatar className="w-12 h-12">
                <Atoms.AvatarImage src="/images/default-avatar.png" />
                <Atoms.AvatarFallback>{post.details.author.charAt(0).toUpperCase()}</Atoms.AvatarFallback>
              </Atoms.Avatar>
              <Atoms.Container className="flex flex-col">
                <Atoms.Typography size="md" className="font-bold">
                  {post.details.author}
                </Atoms.Typography>
                <Atoms.Container className="flex flex-row gap-2">
                  <Atoms.Typography size="sm" className="text-muted-foreground">
                    {shorten(post.details.author).toUpperCase()}
                  </Atoms.Typography>
                  <Atoms.Container className="flex flex-row gap-1 items-center">
                    <Libs.Clock className="h-4 w-4 text-muted-foreground" />
                    <Atoms.Typography size="sm" className="text-muted-foreground">
                      {timeAgo(new Date(post.details.indexed_at))}
                    </Atoms.Typography>
                  </Atoms.Container>
                </Atoms.Container>
              </Atoms.Container>
            </Atoms.Container>
          </Atoms.Container>

          {/* Content */}
          <Atoms.Container className="flex flex-col gap-4">
            <Atoms.Typography className="whitespace-pre-line">{post.details.content}</Atoms.Typography>

            {/* Tags on mobile - between content and buttons */}
            <Atoms.Container className="block lg:hidden">
              <Molecules.Tags
                tags={currentTags as Core.NexusTag[]}
                postId={post.details.id}
                onTagAdded={handleTagAdded}
              />
            </Atoms.Container>

            {/* Action buttons */}
            <Atoms.Container className="flex flex-row gap-2">
              <Atoms.Button variant="secondary" size="sm" className="flex items-center gap-1">
                <Libs.Tag className="h-4 w-4" />
                <Atoms.Typography size="sm">{currentTags.length}</Atoms.Typography>
              </Atoms.Button>
              <Atoms.Button variant="secondary" size="sm" className="flex items-center gap-1">
                <Libs.MessageCircle className="h-4 w-4" />
                <Atoms.Typography size="sm">{post.counts.replies}</Atoms.Typography>
              </Atoms.Button>
              <Atoms.Button
                variant="secondary"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => console.log('TODO: repost', post.details.id)}
              >
                <Libs.RefreshCw className="h-4 w-4" />
                <Atoms.Typography size="sm">{post.counts.reposts}</Atoms.Typography>
              </Atoms.Button>
              <Atoms.Button
                variant="secondary"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => console.log('TODO: add to bookmarks', post.details.id)}
              >
                <Libs.Bookmark className="h-4 w-4" />
              </Atoms.Button>
              <Atoms.Button variant="secondary" size="sm" className="flex items-center gap-1">
                <Libs.MoreHorizontal className="h-4 w-4" />
              </Atoms.Button>
            </Atoms.Container>
          </Atoms.Container>
        </Atoms.Container>

        {/* Tags on desktop - right column */}
        <Atoms.Container className="hidden lg:block">
          <Molecules.Tags tags={currentTags as Core.NexusTag[]} postId={post.details.id} onTagAdded={handleTagAdded} />
        </Atoms.Container>
      </Atoms.Container>
    </Atoms.Card>
  );
}

function shorten(value: string, chars: number = 4) {
  if (value.length <= chars * 2) {
    return value;
  }
  return `${value.slice(0, chars)}...${value.slice(-chars)}`;
}

function timeAgo(date: Date) {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;

  // For older posts, show the date
  return date.toLocaleDateString();
}
