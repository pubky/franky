'use client';

import { useState, useRef, useCallback } from 'react';
import type { UseConfirmableDialogOptions, UseConfirmableDialogReturn } from './useConfirmableDialog.types';

/**
 * Hook for managing dialog state with "confirm before discard" behavior.
 *
 * Encapsulates the logic for tracking unsaved content in dialogs and showing
 * a confirmation prompt when users try to close with unsaved changes.
 * Extracted to improve code organization and support reuse across similar
 * dialog patterns in the future.
 *
 * @param options - Configuration options
 * @returns Dialog state and handlers
 *
 * @example
 * ```tsx
 * const {
 *   showConfirmDialog,
 *   setShowConfirmDialog,
 *   resetKey,
 *   handleContentChange,
 *   handleOpenChange,
 *   handleDiscard,
 * } = useConfirmableDialog({
 *   onClose: () => setOpen(false),
 * });
 * ```
 */
export function useConfirmableDialog({ onClose }: UseConfirmableDialogOptions): UseConfirmableDialogReturn {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const contentRef = useRef({ content: '', tags: [] as string[] });

  const hasContent = useCallback(() => {
    return contentRef.current.content.trim().length > 0 || contentRef.current.tags.length > 0;
  }, []);

  const handleContentChange = useCallback((content: string, tags: string[]) => {
    contentRef.current = { content, tags };
  }, []);

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (newOpen) {
        setShowConfirmDialog(false);
        contentRef.current = { content: '', tags: [] };
      } else {
        // The !showConfirmDialog guard is defensive: prevents redundant state updates
        // if this fires while confirm dialog is open. In practice unlikely since the
        // modal confirm dialog captures Escape/click-outside before they reach here.
        if (hasContent() && !showConfirmDialog) {
          setShowConfirmDialog(true);
        } else {
          onClose();
        }
      }
    },
    [hasContent, showConfirmDialog, onClose],
  );

  const handleDiscard = useCallback(() => {
    setResetKey((prev) => prev + 1);
    setShowConfirmDialog(false);
    onClose();
  }, [onClose]);

  return {
    showConfirmDialog,
    setShowConfirmDialog,
    resetKey,
    handleContentChange,
    handleOpenChange,
    handleDiscard,
  };
}
