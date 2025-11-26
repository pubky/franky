'use client';

import { useState, useRef, useMemo } from 'react';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Icons from '@/libs/icons';
import * as Libs from '@/libs';
import * as Hooks from '@/hooks';

export interface TagInputProps {
  /** Callback when tag is added */
  onTagAdd: (tag: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Existing tags for autocomplete and duplicate checking */
  existingTags?: Array<{ label: string }>;
}

export function TagInput({ onTagAdd, placeholder = 'add tag', existingTags = [] }: TagInputProps) {
  const [tagText, setTagText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Extract text without emoji for comparison
  const getTextWithoutEmoji = (tagLabel: string) => {
    return tagLabel.replace(/^\p{Emoji}+/u, '').trim();
  };

  // Filter existing tags based on input
  const filteredSuggestions = useMemo(() => {
    if (!tagText.trim()) return [];
    const inputText = tagText.toLowerCase();
    return existingTags
      .filter((tag) => {
        const tagText = getTextWithoutEmoji(tag.label).toLowerCase();
        return tagText.includes(inputText) && tagText !== inputText;
      })
      .slice(0, 5); // Limit to 5 suggestions
  }, [tagText, existingTags]);

  const isValidTag = () => {
    // Tag is valid if there's text (with or without emoji)
    return Boolean(tagText.trim());
  };

  const handleTagAdd = () => {
    if (isValidTag()) {
      const trimmedTag = tagText.trim();
      const tagTextWithoutEmoji = getTextWithoutEmoji(trimmedTag);

      // Check if tag already exists (compare by text without emoji)
      const tagExists = existingTags.some((tag) => {
        const existingText = getTextWithoutEmoji(tag.label);
        return existingText.toLowerCase() === tagTextWithoutEmoji.toLowerCase();
      });

      if (tagExists) {
        // Clear tag text if duplicate
        setTagText('');
        setShowSuggestions(false);
        return;
      }

      onTagAdd(trimmedTag);
      setTagText('');
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (tagLabel: string) => {
    setTagText(tagLabel);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleEmojiSelect = (emoji: { native: string }) => {
    const emojiString = emoji.native;
    const input = inputRef.current;

    if (input) {
      const start = input.selectionStart ?? 0;
      const end = input.selectionEnd ?? 0;
      const currentValue = tagText;

      // Insert emoji at cursor position (like WhatsApp)
      const newValue = currentValue.slice(0, start) + emojiString + currentValue.slice(end);
      setTagText(newValue);

      // Keep picker open so user can add more emojis
      // Don't close the picker - let user close it manually or it closes on blur

      // Refocus and set cursor position after emoji
      setTimeout(() => {
        input.focus();
        const newCursorPos = start + emojiString.length;
        input.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    }
  };

  const handleKeyDown = Hooks.useEnterSubmit(isValidTag, handleTagAdd);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagText(e.target.value);
    setShowSuggestions(e.target.value.trim().length > 0);
  };

  const handleInputFocus = () => {
    if (tagText.trim()) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => {
      if (!containerRef.current?.contains(document.activeElement)) {
        setShowSuggestions(false);
      }
    }, 200);
  };

  return (
    <>
      <Atoms.Container
        ref={containerRef}
        overrideDefaults={true}
        className="relative flex h-8 w-48 items-center gap-1 rounded-md border border-dashed border-input bg-background/10 px-3 shadow-sm focus-within:border-white/80"
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
            'min-h-0 flex-1 bg-transparent p-0 text-sm leading-5 font-bold caret-white',
            'border-none shadow-none ring-0 outline-none hover:outline-none focus:ring-0 focus:ring-offset-0 focus:outline-none',
            'placeholder:font-bold placeholder:text-input',
            tagText ? 'text-foreground' : 'text-input',
          )}
        />
        <Atoms.Button
          overrideDefaults={true}
          onClick={() => setShowEmojiPicker(true)}
          className={Libs.cn(
            'inline-flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-full p-1 shadow-xs-dark hover:shadow-xs-dark',
          )}
          aria-label="Open emoji picker"
        >
          <Icons.Smile className="size-4" strokeWidth={2} />
        </Atoms.Button>

        {/* Suggestions Dropdown */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <Atoms.Container
            overrideDefaults={true}
            className="absolute top-full left-0 z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-border bg-popover shadow-lg"
          >
            {filteredSuggestions.map((tag, index) => (
              <Atoms.Container
                key={`${tag.label}-${index}`}
                overrideDefaults={true}
                className="cursor-pointer px-3 py-2 hover:bg-accent"
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
