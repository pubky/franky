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

export const SinglePostTags = ({ postId }: PostTagsProps) => {
  const currentUserId = Core.useAuthStore((state) => state.selectCurrentUserPubky());
  const [inputValue, setInputValue] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const tags = useLiveQuery(
    () => Core.db.post_tags.get(postId).then((tagsData) => (tagsData ? (tagsData.tags as Core.NexusTag[]) : [])),
    [postId],
    [],
  );

  const handleAddTag = async () => {
    try {
      if (!inputValue.trim() || isAdding || !currentUserId) return;
      setIsAdding(true);

      await Core.TagController.create({
        taggedId: postId,
        label: inputValue.trim(),
        taggerId: currentUserId,
        taggedKind: Core.TagKind.POST,
      });
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
      if (!currentUserId) return;
      const tag = tags?.find((t) => t.label === tagLabel);
      if (!tag) return;

      const isCurrentlyTagged = tag.relationship;
      if (isCurrentlyTagged) {
        await Core.TagController.delete({
          taggedId: postId,
          label: tagLabel,
          taggerId: currentUserId,
          taggedKind: Core.TagKind.POST,
        });
      } else {
        await Core.TagController.create({
          taggedId: postId,
          label: tagLabel,
          taggerId: currentUserId,
          taggedKind: Core.TagKind.POST,
        });
      }
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
      <Atoms.Container className="hidden gap-2 lg:flex">
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
      <div className="flex flex-row flex-wrap gap-2 lg:flex-col lg:pt-2">
        {tags?.map((tag, tagIndex) => {
          const visibleTaggers = tag.taggers.slice(0, MAX_VISIBLE_USERS);
          const remainingCount = Math.max(0, tag.taggers.length - MAX_VISIBLE_USERS);
          const isCurrentUserTagger = tag.relationship;

          return (
            <div key={`${tag.label}-${tagIndex}`} className="flex flex-row items-center gap-2">
              <Atoms.Badge
                variant={isCurrentUserTagger ? 'default' : 'secondary'}
                className="flex cursor-pointer items-center gap-1 transition-opacity hover:opacity-80"
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
                className="hidden h-8 w-8 rounded-full p-0 lg:flex"
                onClick={() => console.log('TODO: perform search with tag', tag.label)}
              >
                <Libs.Search className="h-4 w-4" />
              </Atoms.Button>

              {/* User avatars - only show on desktop */}
              <div className="hidden items-center -space-x-2 lg:flex">
                {visibleTaggers.map((taggerId, index) => {
                  // Generate fallback initials from tagger ID
                  const fallbackInitials = taggerId.slice(0, 2).toUpperCase();

                  return (
                    <Atoms.Link
                      key={taggerId}
                      href={
                        // TODO: replace with proper link
                        `/profile/${taggerId}`
                      }
                      className="relative"
                      style={{ zIndex: 10 + index, filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))' }}
                    >
                      <Atoms.Avatar className="h-8 w-8 cursor-pointer transition-opacity hover:opacity-80">
                        <Atoms.AvatarImage src={undefined} />
                        <Atoms.AvatarFallback>{fallbackInitials}</Atoms.AvatarFallback>
                      </Atoms.Avatar>
                    </Atoms.Link>
                  );
                })}
                {remainingCount > 0 && (
                  <div
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-black text-xs font-medium text-white transition-opacity hover:opacity-80"
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
          className="flex h-6 cursor-pointer items-center gap-1 border-dashed transition-opacity hover:opacity-80 lg:hidden"
          onClick={() => console.log('TODO: show add tag modal')}
        >
          <Libs.Plus className="h-3 w-3" />
        </Atoms.Badge>
      </div>
    </Atoms.Container>
  );
};
