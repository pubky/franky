'use client';

import { RefObject, MouseEvent } from 'react';
import * as Atoms from '@/atoms';
import { MAX_CUSTOM_STATUS_LENGTH } from './index';

interface EmojiPickerModalProps {
  show: boolean;
  customStatus: string;
  emojiPickerRef: RefObject<HTMLDivElement | null>;
  onEmojiSelect: (emoji: { native: string }) => void;
  onClose: () => void;
  onContentClick: (e: MouseEvent) => void;
}

export function EmojiPickerModal({
  show,
  customStatus,
  emojiPickerRef,
  onEmojiSelect,
  onClose,
  onContentClick,
}: EmojiPickerModalProps) {
  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      ref={emojiPickerRef}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="mx-4 max-w-md overflow-hidden rounded-lg border border-border bg-background shadow-2xl"
        onClick={onContentClick}
      >
        <div className="w-full">
          <Atoms.EmojiPicker
            onEmojiSelect={onEmojiSelect}
            maxLength={MAX_CUSTOM_STATUS_LENGTH}
            currentInput={customStatus}
          />
        </div>
      </div>
    </div>
  );
}
