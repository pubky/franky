'use client';

import * as React from 'react';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Icons from '@/libs/icons';
import * as Libs from '@/libs';
import * as Hooks from '@/hooks';
import { TAG_MAX_LENGTH } from '@/config';
import { BLUR_DELAY_MS, INPUT_BASE_CLASSES } from './TagInput.constants';
import type { TagInputProps } from './TagInput.types';

/**
 * TagInput - A tag input component with emoji picker and autocomplete suggestions.
 *
 * Features:
 * - Emoji picker integration
 * - Global tag search autocomplete (searches all tags in the system)
 * - Character sanitization (removes colons, commas, spaces)
 * - Tag limit support
 * - Auto-focus support
 * - Keyboard navigation for suggestions (Arrow Up/Down, Enter, Escape)
 */
const TagInput = React.forwardRef<HTMLInputElement, TagInputProps>(
  (
    {
      onTagAdd,
      placeholder = 'add tag',
      existingTags = [],
      showCloseButton = false,
      onClose,
      hideSuggestions = false,
      disabled = false,
      maxTags,
      currentTagsCount = 0,
      limitReachedPlaceholder = 'limit reached',
      onBlur,
      onClick,
      autoFocus = false,
      className,
    },
    ref,
  ) => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const isEmojiPickerOpenRef = React.useRef(false);

    // Derived state
    const existingTagLabels = React.useMemo(() => existingTags.map((tag) => tag.label), [existingTags]);
    const isAtLimit = maxTags !== undefined && currentTagsCount >= maxTags;
    const isDisabled = disabled || isAtLimit;
    const displayPlaceholder = isAtLimit ? limitReachedPlaceholder : placeholder;

    // Wrap onTagAdd with error logging
    const handleTagAdd = React.useCallback(
      (tag: string) => {
        const result = onTagAdd(tag);
        if (result instanceof Promise) {
          result.catch((error: unknown) => Libs.Logger.error('Failed to add tag:', error));
        }
      },
      [onTagAdd],
    );

    // Tag input state and handlers
    const {
      inputValue,
      setInputValue,
      inputRef: hookInputRef,
      showEmojiPicker,
      setShowEmojiPicker,
      handleTagSubmit,
      handleEmojiSelect,
      handlePaste,
    } = Hooks.useTagInput({
      onTagAdd: handleTagAdd,
      existingTags: existingTagLabels,
      maxTags,
      disabled,
    });

    // Suggestion selection callback (memoized to avoid hook recreation)
    const handleSuggestionSelect = React.useCallback(
      (tag: string) => {
        setInputValue(tag.toLowerCase());
        hookInputRef.current?.focus();
      },
      [setInputValue, hookInputRef],
    );

    // Global tag search autocomplete
    const {
      suggestedTags,
      selectedIndex,
      handleKeyDown: handleSuggestionKeyDown,
      handleTagClick,
      clearSuggestions,
    } = Hooks.useSuggestedTags({
      tagInput: hideSuggestions ? '' : inputValue,
      onTagSelect: handleSuggestionSelect,
    });

    // Sync emoji picker state to ref (for blur handling)
    React.useEffect(() => {
      isEmojiPickerOpenRef.current = showEmojiPicker;
    }, [showEmojiPicker]);

    // Merge external ref with hook's internal ref
    const mergedInputRef = React.useMemo(() => Libs.mergeRefs(ref, hookInputRef), [ref, hookInputRef]);

    // Keyboard handling: suggestions first, then Enter submit
    const enterSubmitHandler = Hooks.useEnterSubmit(() => Boolean(inputValue.trim()), handleTagSubmit);
    const handleKeyDown = React.useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (handleSuggestionKeyDown(e)) return;
        enterSubmitHandler(e);
      },
      [handleSuggestionKeyDown, enterSubmitHandler],
    );

    // Input change with sanitization
    const handleInputChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const sanitized = Libs.sanitizeTagInput(e.target.value);
        setInputValue(sanitized.toLowerCase());
      },
      [setInputValue],
    );

    // Blur handling with delay for clicking suggestions/emoji
    const handleInputBlur = React.useCallback(() => {
      setTimeout(() => {
        const focusStillInside = containerRef.current?.contains(document.activeElement);
        if (!focusStillInside && !isEmojiPickerOpenRef.current) {
          clearSuggestions();
          if (!inputValue && onBlur) onBlur();
        }
      }, BLUR_DELAY_MS);
    }, [inputValue, onBlur, clearSuggestions]);

    // Auto-focus on mount
    React.useEffect(() => {
      if (autoFocus && !isDisabled && hookInputRef.current) {
        hookInputRef.current.focus();
      }
    }, [autoFocus, isDisabled, hookInputRef]);

    return (
      <>
        <Atoms.Container
          ref={containerRef}
          data-testid="tag-input"
          overrideDefaults
          className={Libs.cn(
            'relative flex h-8 w-48 items-center gap-1 rounded-md border border-dashed border-input pr-1 pl-3 shadow-sm',
            onClick && 'cursor-pointer',
            className,
          )}
          onClick={onClick}
        >
          <Atoms.Input
            data-cy="add-tag-input"
            ref={mergedInputRef}
            type="text"
            value={inputValue}
            placeholder={displayPlaceholder}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onBlur={handleInputBlur}
            onPaste={handlePaste}
            disabled={isDisabled}
            maxLength={TAG_MAX_LENGTH}
            className={Libs.cn(
              INPUT_BASE_CLASSES,
              isAtLimit ? 'placeholder:text-destructive' : 'placeholder:text-input',
              inputValue ? 'text-foreground' : 'text-input',
              isDisabled && onClick && 'pointer-events-none',
            )}
          />

          {/* Emoji picker button */}
          <Atoms.Button
            overrideDefaults
            onClick={() => setShowEmojiPicker(true)}
            className={Libs.cn(
              'inline-flex size-5 cursor-pointer items-center justify-center rounded-full p-1 shadow-xs-dark hover:shadow-xs-dark',
              isDisabled && onClick && 'pointer-events-none',
            )}
            aria-label="Open emoji picker"
            disabled={isDisabled}
          >
            <Icons.Smile className="size-4" strokeWidth={2} />
          </Atoms.Button>

          {/* Close button */}
          {showCloseButton && (
            <Atoms.Button
              overrideDefaults
              onClick={onClose}
              className="inline-flex size-5 cursor-pointer items-center justify-center rounded-full p-1 hover:opacity-80"
              aria-label="Close tag input"
            >
              <Icons.X className="size-3" strokeWidth={2} />
            </Atoms.Button>
          )}

          {/* Tag suggestions dropdown */}
          {!hideSuggestions && suggestedTags.length > 0 && (
            <Atoms.Container
              overrideDefaults
              role="listbox"
              aria-label="Tag suggestions"
              className="absolute top-full left-0 z-50 mt-1 w-full rounded-md border border-border bg-popover"
            >
              {suggestedTags.map((tag, index) => (
                <Atoms.Container
                  key={tag}
                  overrideDefaults
                  role="option"
                  aria-selected={index === selectedIndex}
                  className={Libs.cn(
                    'cursor-pointer px-3 py-2 hover:rounded-md hover:bg-accent',
                    index === selectedIndex && 'rounded-md bg-accent',
                  )}
                  onClick={() => handleTagClick(tag)}
                >
                  <Atoms.Typography as="span" className="text-sm font-medium text-popover-foreground">
                    {tag}
                  </Atoms.Typography>
                </Atoms.Container>
              ))}
            </Atoms.Container>
          )}
        </Atoms.Container>

        <Molecules.EmojiPickerDialog
          open={showEmojiPicker && !disabled}
          onOpenChange={setShowEmojiPicker}
          onEmojiSelect={handleEmojiSelect}
          currentInput={inputValue}
        />
      </>
    );
  },
);

TagInput.displayName = 'TagInput';

export { TagInput };
