'use client';

import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import * as Core from '@/core';

interface PostTagsProps {
  postId: string;
}

const MAX_VISIBLE_USERS = 5;

export const PostTags = ({ postId }: PostTagsProps) => {
  const currentUserId = Core.useAuthStore((state) => state.selectCurrentUserPubky());
  const [inputValue, setInputValue] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const tags = useLiveQuery(
    () =>
      Core.db.post_tags
        .get(postId)
        .then((tagsData) => (tagsData ? (tagsData.tags as Core.NexusTag[]) : [])),
    [postId],
    [],
  );

  const handleAddTag = async () => {
    try {
      if (!inputValue.trim() || isAdding) return;
      setIsAdding(true);

      await Core.PostController.addTag(postId, inputValue.trim(), currentUserId);
      // useLiveQuery will automatically update tags
      setInputValue('');
    } catch (error) {
      console.error('Failed to add tag:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleTag = async (tagLabel: string) => {
    try {
      const tag = tags?.find((t) => t.label === tagLabel);
      if (!tag) return;

      const isCurrentlyTagged = tag.taggers.includes(currentUserId);
      if (isCurrentlyTagged) {
        await Core.PostController.removeTag(postId, tagLabel, currentUserId);
      } else {
        await Core.PostController.addTag(postId, tagLabel, currentUserId);
      }
      // useLiveQuery will automatically update tags
    } catch (error) {
      console.error('Failed to toggle tagger:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTag();
    }
  };

  return (
    <Atoms.Container className="flex flex-col">
      {/* Desktop input - hidden on mobile */}
      <Atoms.Container className="hidden lg:flex gap-2">
        <Atoms.Input
          placeholder="add tag"
          className="flex-1"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isAdding}
        />
      </Atoms.Container>

      {/* Tags container */}
      <div className="flex flex-row lg:flex-col flex-wrap gap-2 lg:pt-2">
        {tags?.map((tag, tagIndex) => {
          const visibleTaggers = tag.taggers.slice(0, MAX_VISIBLE_USERS);
          const remainingCount = Math.max(0, tag.taggers.length - MAX_VISIBLE_USERS);
          const isCurrentUserTagger = tag.taggers.includes(currentUserId);

          return (
            <div key={`${tag.label}-${tagIndex}`} className="flex flex-row gap-2 items-center">
              <Atoms.Badge
                variant={isCurrentUserTagger ? 'default' : 'secondary'}
                className="flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => handleToggleTag(tag.label)}
              >
                {tag.label}
                <Atoms.Typography size="sm" className="opacity-70">
                  {tag.taggers_count}
                </Atoms.Typography>
              </Atoms.Badge>

              {/* Search button - only show on desktop */}
              <Atoms.Button
                variant="secondary"
                size="sm"
                className="hidden lg:flex rounded-full w-8 h-8 p-0"
                onClick={() => console.log('TODO: perform search with tag', tag.label)}
              >
                <Libs.Search className="h-4 w-4" />
              </Atoms.Button>

              {/* User avatars - only show on desktop */}
              <div className="hidden lg:flex items-center -space-x-2">
                {visibleTaggers.map((taggerId, index) => {
                  // Generate fallback initials from tagger ID
                  const fallbackInitials = taggerId.slice(0, 2).toUpperCase();

                  return (
                    <Atoms.Link
                      key={taggerId}
                      href={`/profile/${taggerId}`}
                      className="relative"
                      style={{ zIndex: 10 + index, filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))' }}
                    >
                      <Atoms.Avatar className="w-8 h-8 cursor-pointer hover:opacity-80 transition-opacity">
                        <Atoms.AvatarImage src="/images/default-avatar.png" />
                        <Atoms.AvatarFallback>{fallbackInitials}</Atoms.AvatarFallback>
                      </Atoms.Avatar>
                    </Atoms.Link>
                  );
                })}
                {remainingCount > 0 && (
                  <div
                    className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity text-xs font-medium"
                    style={{ zIndex: 15 }}
                  >
                    +{remainingCount}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Add tag button - only show on mobile */}
        <Atoms.Badge
          variant="outline"
          className="lg:hidden flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity border-dashed h-6"
          onClick={() => console.log('TODO: show add tag modal')}
        >
          <Libs.Plus className="h-3 w-3" />
        </Atoms.Badge>
      </div>
    </Atoms.Container>
  );
};