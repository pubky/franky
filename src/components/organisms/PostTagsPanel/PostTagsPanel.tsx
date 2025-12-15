'use client';

import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Hooks from '@/hooks';
import * as Libs from '@/libs';
import type { PostTagsPanelProps } from './PostTagsPanel.types';

/**
 * PostTagsPanel Organism
 *
 * Displays and manages tags for a post.
 * This organism is responsible for:
 * - Fetching and displaying post tags using usePostTags hook
 * - Handling tag add/toggle operations
 * - Managing loading and empty states
 *
 * Uses the same TaggedSection pattern as ProfileTagged but adapted for posts.
 */
export function PostTagsPanel({ postId, className }: PostTagsPanelProps) {
  const { tags, isLoading, handleTagAdd, handleTagToggle, hasMore, isLoadingMore, loadMore } =
    Hooks.usePostTags(postId);

  // Show loading state while fetching initial data
  if (isLoading) {
    return (
      <Atoms.Container className={Libs.cn('flex items-center justify-center gap-3', className)}>
        <Atoms.Spinner size="md" />
        <Atoms.Typography as="p" className="text-muted-foreground">
          Loading tags...
        </Atoms.Typography>
      </Atoms.Container>
    );
  }

  return (
    <Atoms.Container className={Libs.cn('gap-2', className)}>
      <Molecules.TagInput onTagAdd={handleTagAdd} existingTags={tags} placeholder="add tag" />

      {tags.length > 0 && (
        <Atoms.Container overrideDefaults className="max-h-80 overflow-y-auto pr-1">
          <Molecules.TaggedList
            tags={tags}
            hasMore={hasMore}
            isLoadingMore={isLoadingMore}
            onLoadMore={loadMore}
            onTagToggle={handleTagToggle}
          />
        </Atoms.Container>
      )}
    </Atoms.Container>
  );
}
