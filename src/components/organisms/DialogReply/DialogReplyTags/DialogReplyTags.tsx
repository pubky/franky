'use client';

import { useState } from 'react';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Libs from '@/libs';
import { POST_MAX_TAGS } from '@/config';
import type { DialogReplyTagsProps } from './DialogReplyTags.types';

export function DialogReplyTags({
  tags,
  onTagsChange,
  maxTags = POST_MAX_TAGS,
  disabled = false,
}: DialogReplyTagsProps) {
  const [isAddingTag, setIsAddingTag] = useState(false);

  const isAtLimit = tags.length >= maxTags;
  const isDisabled = disabled || isAtLimit;

  const handleTagAdd = (tag: string) => {
    // Check for duplicates (case-insensitive)
    const normalizedTag = tag.toLowerCase();
    const isDuplicate = tags.some((t) => t.toLowerCase() === normalizedTag);
    if (!isDuplicate) {
      onTagsChange([...tags, tag]);
    }
  };

  const handleInputBlur = () => {
    // Will be called by TagInput when input loses focus and is empty
    setIsAddingTag(false);
  };

  const handleCloseInput = () => {
    setIsAddingTag(false);
  };

  return (
    <>
      <Atoms.Container overrideDefaults className="flex flex-col gap-1">
        <Atoms.Container overrideDefaults className="flex flex-wrap items-center gap-2">
          {/* Add tag input */}
          {isAddingTag && !disabled && (
            <Molecules.TagInput
              onTagAdd={handleTagAdd}
              placeholder="add tag"
              showCloseButton
              onClose={handleCloseInput}
              hideSuggestions
              disabled={disabled}
              maxTags={maxTags}
              currentTagsCount={tags.length}
              limitReachedPlaceholder="limit reached"
              onBlur={handleInputBlur}
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
