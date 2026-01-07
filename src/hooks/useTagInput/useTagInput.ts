'use client';

import { useState, useRef, useCallback } from 'react';
import { useEmojiInsert } from '../useEmojiInsert';
import * as Libs from '@/libs';
import { TAG_MAX_LENGTH } from '@/config';
import type { UseTagInputOptions, UseTagInputReturn } from './useTagInput.types';

/**
 * Hook for managing tag input state and logic.
 * Consolidates shared logic between TagInput and DialogReplyTags components.
 *
 * @param options - Configuration options
 * @returns Tag input state and handlers
 *
 * @example
 * ```tsx
 * const {
 *   inputValue,
 *   inputRef,
 *   handleInputChange,
 *   handleTagSubmit,
 *   handleEmojiSelect,
 *   showEmojiPicker,
 *   setShowEmojiPicker,
 * } = useTagInput({
 *   onTagAdd: (tag) => setTags([...tags, tag]),
 *   existingTags: tags,
 *   maxTags: 5,
 * });
 * ```
 */
export function useTagInput({
  onTagAdd,
  existingTags = [],
  maxTags,
  disabled = false,
}: UseTagInputOptions): UseTagInputReturn {
  const [inputValue, setInputValue] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isAtLimit = maxTags !== undefined && existingTags.length >= maxTags;
  const isDisabled = disabled || isAtLimit;

  const clearInput = useCallback(() => {
    setInputValue('');
    setLimitReached(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      // Sanitize input: remove banned characters (colons, commas, spaces)
      const sanitized = Libs.sanitizeTagInput(e.target.value);
      const value = sanitized.toLowerCase();

      // Check character count using grapheme-aware counting
      const charCount = Libs.getCharacterCount(value);
      if (charCount <= TAG_MAX_LENGTH) {
        setInputValue(value);
      }

      // Clear limit reached message when user starts typing
      if (limitReached) {
        setLimitReached(false);
      }
    },
    [limitReached],
  );

  const handleTagSubmit = useCallback(() => {
    // Check limit first
    if (isAtLimit) {
      setLimitReached(true);
      return;
    }

    const trimmedTag = inputValue.trim();
    if (!trimmedTag) return;

    // Check for duplicates (case-insensitive)
    const normalizedTag = trimmedTag.toLowerCase();
    const isDuplicate = existingTags.some((tag) => tag.toLowerCase() === normalizedTag);

    if (isDuplicate) {
      // Clear input on duplicate
      clearInput();
      return;
    }

    // Add tag and clear input
    onTagAdd(trimmedTag);
    clearInput();
  }, [inputValue, existingTags, isAtLimit, onTagAdd, clearInput]);

  // Handle paste events: sanitize and validate pasted content
  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData('text');
      const sanitized = Libs.sanitizeTagInput(pasted).toLowerCase();

      // Combine with existing value and check total length
      const newValue = inputValue + sanitized;
      const charCount = Libs.getCharacterCount(newValue);

      if (charCount <= TAG_MAX_LENGTH) {
        setInputValue(newValue);
      } else {
        // Truncate to max length using grapheme-aware slicing
        const chars = Array.from(newValue);
        setInputValue(chars.slice(0, TAG_MAX_LENGTH).join(''));
      }

      if (limitReached) {
        setLimitReached(false);
      }
    },
    [inputValue, limitReached],
  );

  // Wrapper to handle emoji insertion with limit check
  const handleEmojiChange = useCallback(
    (newValue: string) => {
      // Sanitize and validate emoji insertion
      const sanitized = Libs.sanitizeTagInput(newValue);
      const value = sanitized.toLowerCase();
      const charCount = Libs.getCharacterCount(value);

      if (charCount <= TAG_MAX_LENGTH) {
        setInputValue(value);
      }

      if (limitReached) {
        setLimitReached(false);
      }
    },
    [limitReached],
  );

  const handleEmojiSelect = useEmojiInsert({
    inputRef,
    value: inputValue,
    onChange: handleEmojiChange,
  });

  return {
    inputValue,
    setInputValue,
    showEmojiPicker,
    setShowEmojiPicker,
    isAtLimit,
    limitReached,
    inputRef,
    handleInputChange,
    handleTagSubmit,
    handleEmojiSelect,
    handlePaste,
    clearInput,
    isDisabled,
  };
}
