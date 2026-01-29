'use client';

import { useState, useRef, useMemo, useCallback } from 'react';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Icons from '@/libs/icons';
import * as Libs from '@/libs';
import * as Hooks from '@/hooks';
import { TAG_MAX_LENGTH } from '@/config';
import type { TagInputProps } from './TagInput.types';

export function TagInput({
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
  enableApiSuggestions = false,
  excludeFromApiSuggestions = [],
}: TagInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Convert existingTags to string array for the hook
  const existingTagLabels = useMemo(() => existingTags.map((tag) => tag.label), [existingTags]);

  // Combine exclusions for API suggestions: excludeFromApiSuggestions + existingTagLabels
  const apiExcludeTags = useMemo(() => {
    const combined = new Set([...excludeFromApiSuggestions, ...existingTagLabels]);
    return Array.from(combined);
  }, [excludeFromApiSuggestions, existingTagLabels]);

  // Calculate if at limit
  const isAtLimit = maxTags !== undefined && currentTagsCount >= maxTags;
  const isDisabled = disabled || isAtLimit;

  const handleTagAddWrapper = useCallback(
    (tag: string) => {
      // Fire and forget - don't await the promise
      const result = onTagAdd(tag);

      // Handle promise if it's returned (for async handlers)
      if (result instanceof Promise) {
        result.catch((error: unknown) => {
          Libs.Logger.error('Failed to add tag:', error);
        });
      }
    },
    [onTagAdd],
  );

  const {
    inputValue,
    setInputValue,
    inputRef,
    showEmojiPicker,
    setShowEmojiPicker,
    handleTagSubmit,
    handleEmojiSelect,
    handlePaste,
  } = Hooks.useTagInput({
    onTagAdd: handleTagAddWrapper,
    existingTags: existingTagLabels,
    maxTags,
    disabled,
  });

  // Fetch API suggestions when enabled
  const { suggestions: apiSuggestions } = Hooks.useTagSuggestions({
    query: inputValue,
    excludeTags: apiExcludeTags,
    enabled: enableApiSuggestions && !hideSuggestions,
  });

  // Filter existing tags based on input (local suggestions)
  const localFilteredSuggestions = useMemo(() => {
    if (hideSuggestions || !inputValue.trim()) return [];
    const inputText = inputValue.toLowerCase();
    return existingTags
      .filter((tag) => {
        const tagLabel = tag.label.toLowerCase();
        return tagLabel.includes(inputText) && tagLabel !== inputText;
      })
      .slice(0, 5);
  }, [inputValue, existingTags, hideSuggestions]);

  // Merge local and API suggestions (local first, then API, deduplicated)
  const filteredSuggestions = useMemo(() => {
    if (hideSuggestions) return [];

    // Start with local suggestions
    const localLabels = localFilteredSuggestions.map((t) => t.label);
    const localSet = new Set(localLabels.map((l) => l.toLowerCase()));

    // Add API suggestions that aren't already in local
    const apiTagsToAdd = apiSuggestions
      .filter((label) => !localSet.has(label.toLowerCase()))
      .map((label) => ({ label }));

    // Combine and limit to 5 total
    const combined = [...localFilteredSuggestions, ...apiTagsToAdd];
    return combined.slice(0, 5);
  }, [hideSuggestions, localFilteredSuggestions, apiSuggestions]);

  const handleSuggestionClick = useCallback(
    (tagLabel: string) => {
      // Directly add the tag instead of just filling the input
      handleTagAddWrapper(tagLabel.toLowerCase());
      setInputValue('');
      setShowSuggestions(false);
      inputRef.current?.focus();
    },
    [handleTagAddWrapper, setInputValue, inputRef],
  );

  const handleKeyDown = Hooks.useEnterSubmit(() => Boolean(inputValue.trim()), handleTagSubmit);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      // Sanitize input: remove banned characters (colons, commas, spaces)
      const sanitized = Libs.sanitizeTagInput(e.target.value);
      const value = sanitized.toLowerCase();
      setInputValue(value);
      if (!hideSuggestions) {
        setShowSuggestions(value.trim().length > 0);
      }
    },
    [setInputValue, hideSuggestions],
  );

  const handleInputFocus = useCallback(() => {
    if (!hideSuggestions && inputValue.trim()) {
      setShowSuggestions(true);
    }
  }, [inputValue, hideSuggestions]);

  const handleInputBlur = useCallback(() => {
    setTimeout(() => {
      if (!containerRef.current?.contains(document.activeElement)) {
        setShowSuggestions(false);
        // Call external onBlur if input is empty
        if (!inputValue && onBlur) {
          onBlur();
        }
      }
    }, 200);
  }, [inputValue, onBlur]);

  const displayPlaceholder = isAtLimit ? limitReachedPlaceholder : placeholder;

  return (
    <>
      <Atoms.Container
        ref={containerRef}
        overrideDefaults={true}
        className={Libs.cn(
          'relative flex h-8 w-full items-center gap-1 rounded-md border border-dashed border-input pr-1 pl-3 shadow-sm',
          onClick && 'cursor-pointer',
        )}
        onClick={onClick}
      >
        <Atoms.Input
          data-cy="add-tag-input"
          ref={inputRef}
          type="text"
          value={inputValue}
          placeholder={displayPlaceholder}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onPaste={handlePaste}
          disabled={isDisabled}
          maxLength={TAG_MAX_LENGTH}
          className={Libs.cn(
            'flex-1 bg-transparent p-0 text-sm leading-5 font-bold caret-white',
            'border-none shadow-none ring-0 outline-none hover:outline-none focus:ring-0 focus:ring-offset-0 focus:outline-none',
            'placeholder:font-bold',
            isAtLimit ? 'placeholder:text-destructive' : 'placeholder:text-input',
            inputValue ? 'text-foreground' : 'text-input',
            // Allow parent click handler when disabled (for auth prompts)
            isDisabled && onClick && 'pointer-events-none',
          )}
        />
        <Atoms.Button
          overrideDefaults={true}
          onClick={() => setShowEmojiPicker(true)}
          className={Libs.cn(
            'inline-flex size-5 cursor-pointer items-center justify-center rounded-full p-1 shadow-xs-dark hover:shadow-xs-dark',
            // Allow parent click handler when disabled (for auth prompts)
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
            overrideDefaults={true}
            onClick={onClose}
            className="inline-flex size-5 cursor-pointer items-center justify-center rounded-full p-1 hover:opacity-80"
            aria-label="Close tag input"
          >
            <Icons.X className="size-3" strokeWidth={2} />
          </Atoms.Button>
        )}

        {/* Suggestions Dropdown */}
        {!hideSuggestions && showSuggestions && filteredSuggestions.length > 0 && (
          <Atoms.Container
            overrideDefaults={true}
            className="absolute top-full left-0 z-50 mt-1 w-full rounded-md border border-border bg-popover"
          >
            {filteredSuggestions.map((tag, index) => (
              <Atoms.Container
                key={`${tag.label}-${index}`}
                overrideDefaults={true}
                className="cursor-pointer px-3 py-2 hover:rounded-md hover:bg-accent"
                onClick={() => handleSuggestionClick(tag.label)}
              >
                <Atoms.Typography as="span" className="text-sm font-medium text-popover-foreground">
                  {tag.label}
                </Atoms.Typography>
              </Atoms.Container>
            ))}
          </Atoms.Container>
        )}
      </Atoms.Container>

      {/* Emoji Picker Dialog */}
      <Molecules.EmojiPickerDialog
        open={showEmojiPicker && !disabled}
        onOpenChange={setShowEmojiPicker}
        onEmojiSelect={handleEmojiSelect}
        currentInput={inputValue}
      />
    </>
  );
}
