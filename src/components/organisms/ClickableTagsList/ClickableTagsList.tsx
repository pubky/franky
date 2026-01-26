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
 * - Optional input for adding new tags (with emoji picker and autocomplete)
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
  showTagClose = false,
  className,
  onTagClick,
  onTagClose,
  onTagAdd,
  onAddButtonClick,
}: ClickableTagsListProps) {
  // State for add mode input visibility
  const [isAdding, setIsAdding] = React.useState(addMode ? false : showInput);

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

  // Handle tag add from TagInput
  const handleTagAddFromInput = React.useCallback(
    async (label: string): Promise<{ success: boolean; error?: string }> => {
      try {
        if (onTagAdd) {
          onTagAdd(label);
        } else {
          await handleTagAdd(label);
        }
        if (!addMode) {
          setIsAdding(false);
        }
        return { success: true };
      } catch {
        return { success: false, error: 'Failed to add tag' };
      }
    },
    [onTagAdd, handleTagAdd, addMode],
  );

  // Apply smart limiting based on character budget (memoized for performance)
  // Prioritize viewer's tags to appear first (FIFO: new tags replace oldest visible tags)
  const visibleTags = React.useMemo(() => {
    // Separate viewer's tags from others
    const viewerTagsList = fetchedTags.filter((t) => isViewerTagger(t));
    const otherTagsList = fetchedTags.filter((t) => !isViewerTagger(t));

    // Reorder: viewer's tags first, then others
    const reorderedTags = [...viewerTagsList, ...otherTagsList];
    const tagLabels = reorderedTags.map((tag) => tag.label);

    const displayLabels = Libs.getDisplayTags(tagLabels, {
      maxTagLength,
      maxTotalChars,
      maxCount: maxTags,
    });

    // Filter and maintain the prioritized order
    return reorderedTags.filter((tag) => displayLabels.includes(tag.label));
  }, [fetchedTags, maxTagLength, maxTotalChars, maxTags, isViewerTagger]);

  // Get viewer's tags for duplicate checking in TagInput
  const viewerTags = React.useMemo(() => fetchedTags.filter((t) => isViewerTagger(t)), [fetchedTags, isViewerTagger]);

  // Handle add button click with auth requirement
  const handleAddButtonClick = React.useCallback(() => {
    requireAuth(() => {
      onAddButtonClick?.();
      if (addMode) setIsAdding(true);
    });
  }, [requireAuth, onAddButtonClick, addMode]);

  // For unauthenticated users, clicking input opens sign-in dialog
  const handleInputClick = React.useCallback(
    (e: React.MouseEvent) => {
      if (!isAuthenticated) {
        e.stopPropagation();
        setShowSignInDialog(true);
      }
    },
    [isAuthenticated, setShowSignInDialog],
  );

  // Handle blur to close input in addMode
  const handleInputBlur = React.useCallback(() => {
    if (addMode) {
      setIsAdding(false);
    }
  }, [addMode]);

  // Check if we should render anything
  const hasVisibleTags = visibleTags.length > 0;
  // Show input for all users (unauthenticated users see dialog on click)
  const hasInput = showInput || isAdding;
  const hasAddButton = showAddButton && !showInput && !isAdding;

  if (!hasVisibleTags && !hasInput && !hasAddButton) return null;

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
          label={tag.label}
          count={showCount ? tag.taggers_count : undefined}
          color={Libs.generateRandomColor(tag.label)}
          selected={isViewerTagger(tag)}
          showClose={showTagClose}
          onClick={(e) => handleTagClick(tag, index, e)}
          onClose={(e) => onTagClose?.(tag, index, e)}
        />
      ))}

      {/* Add tag input - uses TagInput with emoji picker and autocomplete */}
      {hasInput && (
        <Molecules.TagInput
          onTagAdd={handleTagAddFromInput}
          existingTags={viewerTags}
          autoFocus={isAuthenticated && isAdding}
          disabled={!isAuthenticated}
          onClick={!isAuthenticated ? handleInputClick : undefined}
          onBlur={handleInputBlur}
          className="w-32 shrink-0"
        />
      )}

      {/* Add button (alternative to input) - shows sign-in dialog for unauthenticated */}
      {hasAddButton && <Molecules.PostTagAddButton onClick={handleAddButtonClick} />}
    </Atoms.Container>
  );
}
