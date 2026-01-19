'use client';

import * as React from 'react';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Libs from '@/libs';
import * as Hooks from '@/hooks';
import * as Core from '@/core';
import type { ClickableTagsListProps } from './ClickableTagsList.types';
import {
  CLICKABLE_TAGS_DEFAULT_MAX_LENGTH,
  CLICKABLE_TAGS_DEFAULT_MAX_TOTAL_CHARS,
  CLICKABLE_TAGS_DEFAULT_MAX_TAGS,
} from '@/config';

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
 *
 * For unauthenticated users:
 * - All UI elements are visible
 * - Any click opens sign-in dialog (following pubky-app pattern)
 */
export function ClickableTagsList({
  taggedId,
  taggedKind,
  tags: providedTags,
  maxTags = CLICKABLE_TAGS_DEFAULT_MAX_TAGS,
  maxTagLength = CLICKABLE_TAGS_DEFAULT_MAX_LENGTH,
  maxTotalChars = CLICKABLE_TAGS_DEFAULT_MAX_TOTAL_CHARS,
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

  // Auth requirement for tag actions
  const { isAuthenticated, requireAuth } = Hooks.useRequireAuth();
  const setShowSignInDialog = Core.useAuthStore((state) => state.setShowSignInDialog);

  // Use unified entity tags hook
  const {
    tags: fetchedTags,
    isViewerTagger,
    handleTagToggle,
    handleTagAdd,
  } = Hooks.useEntityTags(taggedId, taggedKind, { providedTags });

  // Use tag input hook for input state management
  // Only pass viewer's own tags as existingTags for duplicate checking
  // This allows adding a tag that others have used but the viewer hasn't
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
    existingTags: fetchedTags.filter((t) => isViewerTagger(t)).map((t) => t.label),
  });

  // Refocus input after clearing value in addMode
  React.useEffect(() => {
    if (addMode && isAdding && tagInput.inputValue === '' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [addMode, isAdding, tagInput.inputValue]);

  // Handle tag click with auth requirement (toggle or custom handler)
  const handleTagClick = React.useCallback(
    (tag: (typeof fetchedTags)[number], index: number, e: React.MouseEvent) => {
      requireAuth(() => {
        if (onTagClick) {
          onTagClick(tag, index, e);
        } else {
          void handleTagToggle(tag);
        }
      });
    },
    [onTagClick, handleTagToggle, requireAuth],
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
  // Show input for all users (unauthenticated users see dialog on click)
  const hasInput = showInput || isAdding;
  const hasAddButton = showAddButton && !showInput && !isAdding;

  if (!hasVisibleTags && !hasInput && !hasAddButton) return null;

  // Handle add button click with auth requirement
  const handleAddButtonClick = () => {
    requireAuth(() => {
      onAddButtonClick?.();
      if (addMode) setIsAdding(true);
    });
  };

  // For unauthenticated users, clicking input opens sign-in dialog
  const handleInputClick = !isAuthenticated ? () => setShowSignInDialog(true) : undefined;

  return (
    <Atoms.Container
      overrideDefaults
      data-cy="clickable-tags-list"
      className={Libs.cn('flex flex-wrap items-center gap-2', className)}
    >
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

      {/* Add tag input - visible to all, clicks open dialog for unauthenticated */}
      {hasInput && (
        <Molecules.PostTagInput
          ref={inputRef}
          value={tagInput.inputValue}
          onChange={isAuthenticated ? tagInput.setInputValue : undefined}
          onSubmit={isAuthenticated ? tagInput.handleTagSubmit : undefined}
          onBlur={() => {
            if (addMode && !tagInput.inputValue) setIsAdding(false);
          }}
          showEmojiPicker={showEmojiPicker}
          onEmojiClick={isAuthenticated ? onEmojiClick : () => setShowSignInDialog(true)}
          className="w-32 shrink-0"
          autoFocus={isAuthenticated && isAdding}
          disabled={!isAuthenticated}
          onClick={handleInputClick}
        />
      )}

      {/* Add button (alternative to input) - shows sign-in dialog for unauthenticated */}
      {hasAddButton && <Molecules.PostTagAddButton onClick={handleAddButtonClick} />}
    </Atoms.Container>
  );
}
