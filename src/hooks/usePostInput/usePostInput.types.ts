import type { RefObject } from 'react';
import type { PostInputVariant } from '@/organisms/PostInput/PostInput.types';

export interface UsePostInputOptions {
  /** Variant determines if this is a reply, repost, or a new post */
  variant: PostInputVariant;
  /** Optional parent post ID (required if variant is 'reply') */
  postId?: string;
  /** Optional original post ID (required if variant is 'repost') */
  originalPostId?: string;
  /** Callback after successful post, receives the created post ID */
  onSuccess?: (createdPostId: string) => void;
  /** Custom placeholder text */
  placeholder?: string;
  /**
   * Controls whether the component starts in expanded mode.
   * @default false
   */
  expanded?: boolean;
  /** Callback when content, tags, or attachments change */
  onContentChange?: (content: string, tags: string[], attachments: File[]) => void;
}

export interface UsePostInputReturn {
  // Refs
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  containerRef: RefObject<HTMLDivElement | null>;
  fileInputRef: RefObject<HTMLInputElement | null>;

  // State
  content: string;
  tags: string[];
  setTags: React.Dispatch<React.SetStateAction<string[]>>;
  attachments: File[];
  setAttachments: React.Dispatch<React.SetStateAction<File[]>>;
  isDragging: boolean;
  isExpanded: boolean;
  isSubmitting: boolean;
  showEmojiPicker: boolean;
  setShowEmojiPicker: (show: boolean) => void;

  // Derived values
  hasContent: boolean;
  displayPlaceholder: string;
  currentUserPubky: string | null;

  // Handlers
  handleExpand: () => void;
  handleSubmit: () => Promise<void>;
  handleChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleEmojiSelect: (emoji: { native: string }) => void;
  handleFilesAdded: (files: File[]) => void;
  handleDragEnter: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
}
