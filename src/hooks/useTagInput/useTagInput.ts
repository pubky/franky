'use client';

import { useState, useRef, useCallback } from 'react';
import { useEmojiInsert } from '../useEmojiInsert';
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
      setInputValue(e.target.value.toLowerCase());
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

  // Wrapper to handle emoji insertion with limit check
  const handleEmojiChange = useCallback(
    (newValue: string) => {
      setInputValue(newValue.toLowerCase());
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
    clearInput,
    isDisabled,
  };
}
