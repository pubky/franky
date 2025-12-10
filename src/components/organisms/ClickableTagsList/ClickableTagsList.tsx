'use client';

import * as React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Libs from '@/libs';
import * as Core from '@/core';
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
  const [inputValue, setInputValue] = React.useState('');
  const [isAdding, setIsAdding] = React.useState(addMode ? false : showInput);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Get current user for relationship check
  const viewerId = Core.useAuthStore((state) => state.selectCurrentUserPubky());

  // Refocus input after clearing value in addMode (for adding multiple tags in a row)
  React.useEffect(() => {
    if (addMode && isAdding && inputValue === '' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [addMode, isAdding, inputValue]);

  // Fetch tags from IndexedDB if not provided
  const fetchedTags = useLiveQuery(
    async () => {
      if (providedTags) return null; // Skip if tags are provided

      if (taggedKind === Core.TagKind.USER) {
        return await Core.UserController.getUserTags(taggedId);
      } else {
        // For POST, use the controller which returns TagCollectionModelSchema
        const tagCollection = await Core.PostController.getPostTags({ compositeId: taggedId });
        return tagCollection?.flatMap((collection) => collection.tags) ?? [];
      }
    },
    [taggedId, taggedKind, providedTags],
    null,
  );

  // Use provided tags or fetched tags
  const allTags = providedTags ?? fetchedTags ?? [];

  // Calculate relationship for each tag
  const getTagRelationship = React.useCallback(
    (tag: Core.NexusTag): boolean => {
      if (!viewerId) return false;
      return tag.relationship ?? tag.taggers?.includes(viewerId) ?? false;
    },
    [viewerId],
  );

  // Handle tag submit from input
  const handleTagSubmit = (value: string) => {
    if (value.trim()) {
      onTagAdd?.(value.trim());
      setInputValue('');
      if (!addMode) {
        setIsAdding(false);
      }
    }
  };

  // Handle tag toggle (add/remove tagger)
  const handleTagToggle = React.useCallback(
    async (tag: Core.NexusTag) => {
      if (!viewerId) return;

      const userIsTagger = getTagRelationship(tag);

      // Default toggle behavior
      try {
        if (userIsTagger) {
          await Core.TagController.delete({
            taggedId: taggedId as Core.Pubky,
            label: tag.label,
            taggerId: viewerId,
            taggedKind,
          });
        } else {
          await Core.TagController.create({
            taggedId: taggedId as Core.Pubky,
            label: tag.label,
            taggerId: viewerId,
            taggedKind,
          });
        }
      } catch {
        // Error is handled silently - UI will update via live query
      }
    },
    [taggedId, taggedKind, viewerId, getTagRelationship],
  );

  // Apply smart limiting based on character budget
  const tagLabels = allTags.map((tag) => tag.label);
  const displayLabels = Libs.getDisplayTags(tagLabels, {
    maxTagLength,
    maxTotalChars,
    maxCount: maxTags,
  });
  const visibleTags = allTags.filter((tag) => displayLabels.includes(tag.label));

  // Helper to truncate label if needed
  const truncateLabel = (label: string): string => {
    if (label.length <= maxTagLength) return label;
    return `${label.slice(0, maxTagLength)}…`;
  };

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
          label={truncateLabel(tag.label)}
          count={showCount ? tag.taggers_count : undefined}
          color={Libs.generateRandomColor(tag.label)}
          selected={getTagRelationship(tag)}
          showClose={showTagClose}
          onClick={(e) => {
            if (onTagClick) {
              onTagClick(tag, index, e);
            } else {
              handleTagToggle(tag);
            }
          }}
          onClose={(e) => {
            onTagClose?.(tag, index, e);
          }}
        />
      ))}

      {/* Add tag input */}
      {hasInput && (
        <Molecules.PostTagInput
          ref={inputRef}
          value={inputValue}
          onChange={setInputValue}
          onSubmit={handleTagSubmit}
          onBlur={() => {
            if (addMode && !inputValue) setIsAdding(false);
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
