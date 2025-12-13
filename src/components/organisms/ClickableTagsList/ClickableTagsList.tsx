'use client';

import * as React from 'react';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Libs from '@/libs';
import * as Hooks from '@/hooks';
import type { ClickableTagsListProps } from './ClickableTagsList.types';
import { TAG_MAX_LENGTH, TAGS_MAX_TOTAL_CHARS, DEFAULT_MAX_TAGS } from './ClickableTagsList.constants';

/**
 * ClickableTagsList
 *
 * A unified component for displaying clickable tags that can be toggled (add/remove tagger).
 * Works for both USER and POST tags.
 *
 * Features:
 * - Shows outline when current user is a tagger
 * - Click to toggle (add/remove) tag
 * - Smart limiting based on character budget
 * - Automatic fetching from IndexedDB if tags not provided
 * - Optional input for adding new tags
 * - Optional add button
 * - Optional close button on tags
 */
export function ClickableTagsList({
  taggedId,
  taggedKind,
  tags: providedTags,
  maxTags = DEFAULT_MAX_TAGS,
  maxTagLength = TAG_MAX_LENGTH,
  maxTotalChars = TAGS_MAX_TOTAL_CHARS,
  showCount = true,
  showInput = false,
  showAddButton = false,
  addMode = false,
  showEmojiPicker = false,
  showTagClose = false,
  className,
  onTagClick,
  onTagClose,
  onTagAdd,
  onAddButtonClick,
  onEmojiClick,
}: ClickableTagsListProps) {
  // State for add mode input visibility
  const [isAdding, setIsAdding] = React.useState(addMode ? false : showInput);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Use unified entity tags hook
  const {
    tags: fetchedTags,
    isViewerTagger,
    handleTagToggle,
    handleTagAdd,
  } = Hooks.useEntityTags(taggedId, taggedKind, { providedTags });

  // Use tag input hook for input state management
  const tagInput = Hooks.useTagInput({
    onTagAdd: async (label) => {
      if (onTagAdd) {
        onTagAdd(label);
      } else {
        await handleTagAdd(label);
      }
      if (!addMode) {
        setIsAdding(false);
      }
    },
    existingTags: fetchedTags.map((t) => t.label),
  });

  // Refocus input after clearing value in addMode
  React.useEffect(() => {
    if (addMode && isAdding && tagInput.inputValue === '' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [addMode, isAdding, tagInput.inputValue]);

  // Handle tag click (toggle or custom handler)
  const handleTagClick = React.useCallback(
    (tag: (typeof fetchedTags)[number], index: number, e: React.MouseEvent) => {
      if (onTagClick) {
        onTagClick(tag, index, e);
      } else {
        handleTagToggle(tag);
      }
    },
    [onTagClick, handleTagToggle],
  );

  // Apply smart limiting based on character budget (memoized for performance)
  const visibleTags = React.useMemo(() => {
    const tagLabels = fetchedTags.map((tag) => tag.label);
    const displayLabels = Libs.getDisplayTags(tagLabels, {
      maxTagLength,
      maxTotalChars,
      maxCount: maxTags,
    });
    return fetchedTags.filter((tag) => displayLabels.includes(tag.label));
  }, [fetchedTags, maxTagLength, maxTotalChars, maxTags]);

  // Check if we should render anything
  const hasVisibleTags = visibleTags.length > 0;
  const hasInput = showInput || isAdding;
  const hasAddButton = showAddButton && !showInput && !isAdding;

  if (!hasVisibleTags && !hasInput && !hasAddButton) return null;

  return (
    <Atoms.Container overrideDefaults className={Libs.cn('flex flex-wrap items-center gap-2', className)}>
      {/* Render existing tags */}
      {visibleTags.map((tag, index) => (
        <Molecules.PostTag
          key={`${taggedId}-${tag.label}`}
          label={Libs.truncateString(tag.label, maxTagLength)}
          count={showCount ? tag.taggers_count : undefined}
          color={Libs.generateRandomColor(tag.label)}
          selected={isViewerTagger(tag)}
          showClose={showTagClose}
          onClick={(e) => handleTagClick(tag, index, e)}
          onClose={(e) => onTagClose?.(tag, index, e)}
        />
      ))}

      {/* Add tag input */}
      {hasInput && (
        <Molecules.PostTagInput
          ref={inputRef}
          value={tagInput.inputValue}
          onChange={tagInput.setInputValue}
          onSubmit={tagInput.handleTagSubmit}
          onBlur={() => {
            if (addMode && !tagInput.inputValue) setIsAdding(false);
          }}
          showEmojiPicker={showEmojiPicker}
          onEmojiClick={onEmojiClick}
          className="w-32 shrink-0"
          autoFocus={isAdding}
        />
      )}

      {/* Add button (alternative to input) */}
      {hasAddButton && (
        <Molecules.PostTagAddButton
          onClick={() => {
            onAddButtonClick?.();
            if (addMode) setIsAdding(true);
          }}
        />
      )}
    </Atoms.Container>
  );
}
