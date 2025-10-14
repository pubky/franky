'use client';

import { useState, useCallback } from 'react';
import { DEFAULT_STATUS, DEFAULT_EMOJI } from './index';

interface UseStatusManagerProps {
  initialStatus?: string;
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
  handleEmojiSelect: (emojiObject: { native: string }) => void;
  handleStatusMenuChange: (open: boolean) => void;
}

export function useStatusManager({
  initialStatus = DEFAULT_STATUS,
}: UseStatusManagerProps = {}): UseStatusManagerReturn {
  const [currentStatus, setCurrentStatus] = useState(initialStatus);
  const [customStatus, setCustomStatus] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState(DEFAULT_EMOJI);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleStatusSelect = useCallback((status: string) => {
    setCurrentStatus(status);
    setShowStatusMenu(false);
    // TODO: Save status to backend
  }, []);

  const handleCustomStatusSave = useCallback(() => {
    setCurrentStatus(customStatus);
    setShowStatusMenu(false);
    // TODO: Save custom status to backend
  }, [customStatus]);

  const handleEmojiSelect = useCallback((emojiObject: { native: string }) => {
    if (emojiObject?.native) {
      setSelectedEmoji(emojiObject.native);
      setShowEmojiPicker(false);
    }
  }, []);

  const handleStatusMenuChange = useCallback(
    (open: boolean) => {
      // Don't close status menu if emoji picker is open
      if (!open && showEmojiPicker) {
        return;
      }
      setShowStatusMenu(open);
    },
    [showEmojiPicker],
  );

  return {
    currentStatus,
    customStatus,
    selectedEmoji,
    showStatusMenu,
    showEmojiPicker,
    setCurrentStatus,
    setCustomStatus,
    setSelectedEmoji,
    setShowStatusMenu,
    setShowEmojiPicker,
    handleStatusSelect,
    handleCustomStatusSave,
    handleEmojiSelect,
    handleStatusMenuChange,
  };
}
