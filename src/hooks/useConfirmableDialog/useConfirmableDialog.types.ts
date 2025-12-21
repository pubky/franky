export interface UseConfirmableDialogOptions {
  /** Callback to close the main dialog */
  onClose: () => void;
}

export interface UseConfirmableDialogReturn {
  /** Whether the confirm discard dialog is visible */
  showConfirmDialog: boolean;
  /** Setter for confirm dialog visibility */
  setShowConfirmDialog: (show: boolean) => void;
  /** Key for resetting child components (e.g., PostInput) */
  resetKey: number;
  /** Handler for content changes - tracks content, tags, and attachments */
  handleContentChange: (content: string, tags: string[], attachments: File[]) => void;
  /** Handler for dialog open/close - shows confirm dialog if there's unsaved content */
  handleOpenChange: (newOpen: boolean) => void;
  /** Handler for confirming discard - resets state and closes dialog */
  handleDiscard: () => void;
}
