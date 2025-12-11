'use client';

import { useState } from 'react';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Libs from '@/libs';
import { POST_MAX_TAGS } from '@/config';
import type { PostInputTagsProps } from './PostInputTags.types';

export function PostInputTags({
  tags,
  onTagsChange,
  maxTags = POST_MAX_TAGS,
  disabled = false,
}: PostInputTagsProps): React.ReactElement {
  const [isAddingTag, setIsAddingTag] = useState(false);

  const isAtLimit = tags.length >= maxTags;
  const isDisabled = disabled || isAtLimit;

  const handleTagAdd = (tag: string): void => {
    // Duplicate check is handled by useTagInput internally
    onTagsChange([...tags, tag]);
  };

  const handleInputBlur = (): void => {
    // Will be called by TagInput when input loses focus and is empty
    setIsAddingTag(false);
  };

  const handleCloseInput = (): void => {
    setIsAddingTag(false);
  };

  return (
    <>
      <Atoms.Container overrideDefaults className="flex flex-col gap-1">
        <Atoms.Container overrideDefaults className="flex flex-wrap items-center gap-2">
          {/* Add tag input - keep visible but disabled during loading */}
          {isAddingTag && (
            <Molecules.TagInput
              onTagAdd={handleTagAdd}
              placeholder="add tag"
              existingTags={tags.map((tag) => ({ label: tag }))}
              showCloseButton={!disabled}
              onClose={handleCloseInput}
              hideSuggestions
              disabled={disabled}
              maxTags={maxTags}
              currentTagsCount={tags.length}
              limitReachedPlaceholder="limit reached"
              onBlur={disabled ? undefined : handleInputBlur}
            />
          )}

          {/* Add button - disabled when at limit or disabled */}
          {!isAddingTag && (
            <Molecules.PostTagAddButton
              onClick={() => {
                setIsAddingTag(true);
              }}
              disabled={isDisabled}
            />
          )}

          {/* Tag count indicator */}
          {tags.length > 0 && (
            <Atoms.Typography
              as="span"
              size="sm"
              className={Libs.cn('text-muted-foreground', isAtLimit && 'text-destructive')}
            >
              {tags.length}/{maxTags}
            </Atoms.Typography>
          )}
        </Atoms.Container>
      </Atoms.Container>
    </>
  );
}
