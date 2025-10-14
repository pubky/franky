'use client';

import { useState, useEffect, useRef, MouseEvent, RefObject } from 'react';

interface UseEmojiPickerReturn {
  showEmojiPicker: boolean;
  emojiPickerRef: RefObject<HTMLDivElement | null>;
  openEmojiPicker: () => void;
  closeEmojiPicker: () => void;
  handleEmojiPickerClick: (e: MouseEvent) => void;
  handleEmojiPickerContentClick: (e: MouseEvent) => void;
}

export function useEmojiPicker(): UseEmojiPickerReturn {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // Close emoji picker on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showEmojiPicker) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [showEmojiPicker]);

  const openEmojiPicker = () => setShowEmojiPicker(true);
  const closeEmojiPicker = () => setShowEmojiPicker(false);

  const handleEmojiPickerClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openEmojiPicker();
  };

  const handleEmojiPickerContentClick = (e: MouseEvent) => {
    e.stopPropagation();
  };

  return {
    showEmojiPicker,
    emojiPickerRef,
    openEmojiPicker,
    closeEmojiPicker,
    handleEmojiPickerClick,
    handleEmojiPickerContentClick,
  };
}
