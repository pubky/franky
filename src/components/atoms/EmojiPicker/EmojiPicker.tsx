'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { Picker } from 'emoji-mart';
import data from '@emoji-mart/data';

interface EmojiObject {
  native: string;
  shortcodes?: string;
  unified?: string;
  keywords?: string[];
  name?: string;
}

interface EmojiPickerProps {
  onEmojiSelect: (emoji: EmojiObject) => void;
  onClose?: () => void;
  maxLength?: number;
  currentInput?: string;
}

export function EmojiPicker({ onEmojiSelect, onClose, maxLength, currentInput }: EmojiPickerProps) {
  const pickerRef = useRef<HTMLDivElement>(null);
  const pickerInstanceRef = useRef<HTMLElement | null>(null);
  const handleSelectRef = useRef<(emoji: EmojiObject) => void>(() => {});

  const handleEmojiSelect = useCallback(
    (emojiObject: EmojiObject) => {
      if (maxLength && currentInput) {
        const emojiLength = new Blob([emojiObject.native]).size / 2;
        if (currentInput.length + emojiLength <= maxLength) {
          onEmojiSelect(emojiObject);
          onClose?.();
        }
      } else {
        onEmojiSelect(emojiObject);
        onClose?.();
      }
    },
    [onEmojiSelect, onClose, maxLength, currentInput],
  );

  useEffect(() => {
    handleSelectRef.current = handleEmojiSelect;
  }, [handleEmojiSelect]);

  useEffect(() => {
    const container = pickerRef.current;
    if (!container || pickerInstanceRef.current) return;

    container.innerHTML = '';

    const picker = new Picker({
      data,
      theme: 'dark',
      onEmojiSelect: (emoji: unknown) => handleSelectRef.current(emoji as EmojiObject),
    }) as unknown as HTMLElement;

    container.appendChild(picker);
    pickerInstanceRef.current = picker;

    return () => {
      if (pickerInstanceRef.current && container.contains(pickerInstanceRef.current)) {
        container.removeChild(pickerInstanceRef.current);
      }
      pickerInstanceRef.current = null;
    };
  }, []);

  return (
    <div className="w-full">
      <div ref={pickerRef} style={{ width: '100%' }} />
    </div>
  );
}
