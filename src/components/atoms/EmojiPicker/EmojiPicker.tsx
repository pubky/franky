'use client';

import React from 'react';
import Picker from '@emoji-mart/react';
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
  maxLength?: number;
  currentInput?: string;
}

export function EmojiPicker({ onEmojiSelect, maxLength, currentInput }: EmojiPickerProps) {
  const handleEmojiSelect = (emojiObject: EmojiObject) => {
    if (maxLength && currentInput) {
      const emojiLength = new Blob([emojiObject.native]).size / 2;
      if (currentInput.length + emojiLength <= maxLength) {
        onEmojiSelect(emojiObject);
      }
    } else {
      onEmojiSelect(emojiObject);
    }
  };

  return (
    <div className="w-full">
      <Picker theme="dark" data={data} onEmojiSelect={handleEmojiSelect} style={{ width: '100%' }} />
    </div>
  );
}
