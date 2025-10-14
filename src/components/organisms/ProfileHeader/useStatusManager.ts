'use client';

import { useState, useCallback } from 'react';
import { DEFAULT_STATUS, DEFAULT_EMOJI, STATUS_OPTIONS } from './index';

interface UseStatusManagerProps {
  initialStatus?: string;
  showEmojiPicker?: boolean;
}

interface UseStatusManagerReturn {
  currentStatus: string;
  customStatus: string;
  selectedEmoji: string;
  showStatusMenu: boolean;
  showEmojiPicker: boolean;
  setCurrentStatus: (status: string) => void;
  setCustomStatus: (status: string) => void;
  setSelectedEmoji: (emoji: string) => void;
  setShowStatusMenu: (show: boolean) => void;
  setShowEmojiPicker: (show: boolean) => void;
  handleStatusSelect: (status: string) => void;
  handleCustomStatusSave: () => void;
  handleEmojiSelect: (emojiObject: {
    native: string;
    shortcodes?: string;
    unified?: string;
    keywords?: string[];
    name?: string;
  }) => void;
  handleStatusMenuChange: (open: boolean) => void;
}

export function useStatusManager({
  initialStatus = DEFAULT_STATUS,
  showEmojiPicker = false,
}: UseStatusManagerProps = {}): UseStatusManagerReturn {
  const [currentStatus, setCurrentStatus] = useState(initialStatus);
  const [customStatus, setCustomStatus] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState(DEFAULT_EMOJI);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const handleStatusSelect = useCallback((status: string) => {
    setCurrentStatus(status);
    const option = STATUS_OPTIONS.find((opt) => opt.label === status);
    if (option?.emoji) setSelectedEmoji(option.emoji);
    setShowStatusMenu(false);
  }, []);

  const handleCustomStatusSave = useCallback(() => {
    setCurrentStatus(customStatus);
    setShowStatusMenu(false);
  }, [customStatus]);

  const handleEmojiSelect = useCallback((emojiObject: { native: string }) => {
    setSelectedEmoji(emojiObject.native);
  }, []);

  const handleStatusMenuChange = useCallback(
    (open: boolean) => {
      if (!open && showEmojiPicker) return;
      setShowStatusMenu(open);
    },
    [showEmojiPicker],
  );

  return {
    currentStatus,
    customStatus,
    selectedEmoji,
    showStatusMenu,
    showEmojiPicker: false,
    setCurrentStatus,
    setCustomStatus,
    setSelectedEmoji,
    setShowStatusMenu,
    setShowEmojiPicker: () => {},
    handleStatusSelect,
    handleCustomStatusSave,
    handleEmojiSelect,
    handleStatusMenuChange,
  };
}
