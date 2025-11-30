'use client';

import { useState, useRef, useMemo, useCallback } from 'react';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Icons from '@/libs/icons';
import * as Libs from '@/libs';
import * as Hooks from '@/hooks';
import type { TagInputProps } from './TagInput.types';

export function TagInput({ onTagAdd, placeholder = 'add tag', existingTags = [] }: TagInputProps) {
  const [tagText, setTagText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter existing tags based on input (match full text+emoji combination)
  const filteredSuggestions = useMemo(() => {
    if (!tagText.trim()) return [];
    const inputText = tagText.toLowerCase();
    return existingTags
      .filter((tag) => {
        const tagLabel = tag.label.toLowerCase();
        return tagLabel.includes(inputText) && tagLabel !== inputText;
      })
      .slice(0, 5);
  }, [tagText, existingTags]);

  const clearInput = useCallback(() => {
    setTagText('');
    setShowSuggestions(false);
  }, []);

  const handleTagAdd = useCallback(() => {
    const trimmedTag = tagText.trim();
    if (!trimmedTag) return;

    // Validate: check for duplicates (compare full text+emoji combination exactly)
    const tagExists = existingTags.some((tag) => {
      return tag.label.toLowerCase() === trimmedTag.toLowerCase();
    });

    if (tagExists) {
      // Tag already exists, clear input
      clearInput();
      return;
    }

    // Clear input immediately for instant feedback
    clearInput();

    // Fire and forget - don't await the promise
    // The hook will handle optimistic updates
    const result = onTagAdd(trimmedTag);

    // Handle promise if it's returned (for async handlers)
    if (result instanceof Promise) {
      result.catch((error: unknown) => {
        // Log errors silently, could show toast here if needed
        Libs.Logger.error('Failed to add tag:', error);
      });
    }
  }, [tagText, existingTags, onTagAdd, clearInput]);

  const handleSuggestionClick = useCallback((tagLabel: string) => {
    setTagText(tagLabel);
    setShowSuggestions(false);
    inputRef.current?.focus();
  }, []);

  const handleEmojiSelect = useCallback(
    (emoji: { native: string }) => {
      const input = inputRef.current;
      if (!input) return;

      const start = input.selectionStart ?? 0;
      const end = input.selectionEnd ?? 0;
      const newValue = tagText.slice(0, start) + emoji.native + tagText.slice(end);

      setTagText(newValue);

      setTimeout(() => {
        input.focus();
        const newCursorPos = start + emoji.native.length;
        input.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    },
    [tagText],
  );

  const handleKeyDown = Hooks.useEnterSubmit(() => Boolean(tagText.trim()), handleTagAdd);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTagText(value);
    setShowSuggestions(value.trim().length > 0);
  }, []);

  const handleInputFocus = useCallback(() => {
    if (tagText.trim()) setShowSuggestions(true);
  }, [tagText]);

  const handleInputBlur = useCallback(() => {
    setTimeout(() => {
      if (!containerRef.current?.contains(document.activeElement)) {
        setShowSuggestions(false);
      }
    }, 200);
  }, []);

  return (
    <>
      <Atoms.Container
        ref={containerRef}
        overrideDefaults={true}
        className="relative flex w-48 items-center gap-1 rounded-md border border-dashed border-input pr-1 pl-3 shadow-sm"
      >
        <Atoms.Input
          ref={inputRef}
          type="text"
          value={tagText}
          placeholder={placeholder}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          className={Libs.cn(
            'flex-1 bg-transparent p-0 text-sm leading-5 font-bold caret-white',
            'border-none shadow-none ring-0 outline-none hover:outline-none focus:ring-0 focus:ring-offset-0 focus:outline-none',
            'placeholder:font-bold placeholder:text-input',
            tagText ? 'text-foreground' : 'text-input',
          )}
        />
        <Atoms.Button
          overrideDefaults={true}
          onClick={() => setShowEmojiPicker(true)}
          className="inline-flex size-5 cursor-pointer items-center justify-center rounded-full p-1 shadow-xs-dark hover:shadow-xs-dark"
          aria-label="Open emoji picker"
        >
          <Icons.Smile className="size-4" strokeWidth={2} />
        </Atoms.Button>

        {/* Suggestions Dropdown */}
        {showSuggestions && filteredSuggestions.length > 0 && (
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
        open={showEmojiPicker}
        onOpenChange={setShowEmojiPicker}
        onEmojiSelect={handleEmojiSelect}
        currentInput={tagText}
      />
    </>
  );
}
