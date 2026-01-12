'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import * as Hooks from '@/hooks';
import * as Molecules from '@/molecules';
import {
  POST_MAX_CHARACTER_LENGTH,
  SUPPORTED_ATTACHMENT_MIME_TYPES,
  ATTACHMENT_MAX_IMAGE_SIZE,
  ATTACHMENT_MAX_OTHER_SIZE,
  ATTACHMENT_MAX_FILES,
  SUPPORTED_FILE_EXTENSIONS,
} from '@/config';
import { useTimelineFeedContext } from '@/organisms/TimelineFeed/TimelineFeed';
import { POST_INPUT_VARIANT, POST_INPUT_PLACEHOLDER } from '@/organisms/PostInput/PostInput.constants';
import type { UsePostInputOptions, UsePostInputReturn } from './usePostInput.types';

/**
 * Hook that encapsulates all PostInput logic.
 *
 * Manages:
 * - Content, tags, and attachments state (via usePost)
 * - Expand/collapse behavior
 * - Emoji picker integration
 * - Form submission (post or reply)
 * - Click outside detection for collapse
 * - Content change notifications to parent
 * - File drag and drop handling
 */
export function usePostInput({
  variant,
  postId,
  originalPostId,
  onSuccess,
  placeholder,
  expanded = false,
  onContentChange,
}: UsePostInputOptions): UsePostInputReturn {
  // State
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isExpanded, setIsExpanded] = useState(expanded);
  const [isDragging, setIsDragging] = useState(false);

  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  // Hooks
  const { currentUserPubky } = Hooks.useCurrentUserProfile();
  const { content, setContent, tags, setTags, attachments, setAttachments, reply, post, repost, isSubmitting } =
    Hooks.usePost();
  const timelineFeed = useTimelineFeedContext();
  const { toast } = Molecules.useToast();

  // Notify parent of content changes
  useEffect(() => {
    onContentChange?.(content, tags, attachments);
  }, [content, tags, attachments, onContentChange]);

  // Handle click outside to collapse (only when expanded prop is false)
  useEffect(() => {
    if (expanded) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        if (!content.trim() && tags.length === 0 && attachments.length === 0) {
          setIsExpanded(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [expanded, content, tags, attachments]);

  // Handle expand on interaction
  const handleExpand = useCallback(() => {
    if (!isExpanded) {
      setIsExpanded(true);
    }
  }, [isExpanded]);

  // Handle submit using reply, repost, or post method from hook
  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;

    // For replies and posts, require content or attachments. For reposts, content is optional.
    if (variant !== POST_INPUT_VARIANT.REPOST && !content.trim() && attachments.length === 0) return;

    // Wrapper that prepends to timeline and calls original onSuccess
    const handleSuccess = (createdPostId: string) => {
      // Only prepend to timeline for posts and reposts, not replies
      if (variant !== POST_INPUT_VARIANT.REPLY) {
        timelineFeed?.prependPosts(createdPostId);
      }
      // Call original onSuccess callback if provided
      onSuccess?.(createdPostId);
    };

    switch (variant) {
      case POST_INPUT_VARIANT.REPLY:
        await reply({ postId: postId!, onSuccess: handleSuccess });
        break;
      case POST_INPUT_VARIANT.REPOST:
        await repost({ originalPostId: originalPostId!, onSuccess: handleSuccess });
        break;
      case POST_INPUT_VARIANT.POST:
      default:
        await post({ onSuccess: handleSuccess });
        break;
    }
  }, [
    content,
    attachments,
    variant,
    postId,
    originalPostId,
    reply,
    post,
    repost,
    isSubmitting,
    onSuccess,
    timelineFeed,
  ]);

  // Handle textarea change with validation
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      if (value.length <= POST_MAX_CHARACTER_LENGTH) {
        setContent(value);
      }
    },
    [setContent],
  );

  // Wrapper to apply validation when emoji is inserted
  const handleEmojiChange = useCallback(
    (newValue: string) => {
      if (newValue.length <= POST_MAX_CHARACTER_LENGTH) {
        setContent(newValue);
      }
    },
    [setContent],
  );

  // Emoji insert handler
  const handleEmojiSelect = Hooks.useEmojiInsert({
    inputRef: textareaRef,
    value: content,
    onChange: handleEmojiChange,
  });

  // File handling - shared logic for both file input and drag/drop
  const handleFilesAdded = useCallback(
    (files: File[]) => {
      if (isSubmitting || files.length === 0) return;

      const currentCount = attachments.length;
      const availableSlots = ATTACHMENT_MAX_FILES - currentCount;

      if (availableSlots <= 0) {
        toast({
          title: 'Error',
          description: `Maximum of ${ATTACHMENT_MAX_FILES} files allowed`,
        });
        return;
      }

      const validFiles: File[] = [];
      const errors: string[] = [];

      for (const file of files) {
        if (validFiles.length >= availableSlots) {
          errors.push(`Maximum of ${ATTACHMENT_MAX_FILES} files allowed. Some files were not added.`);
          break;
        }

        // Check against specific supported MIME types from pubky-app-specs
        const isAcceptedType = (SUPPORTED_ATTACHMENT_MIME_TYPES as readonly string[]).includes(file.type);
        if (!isAcceptedType) {
          errors.push(
            `"${file.name}" has unsupported type "${file.type}". Supported formats: ${SUPPORTED_FILE_EXTENSIONS}.`,
          );
          continue;
        }

        const isImage = file.type.startsWith('image/');
        const maxSize = isImage ? ATTACHMENT_MAX_IMAGE_SIZE : ATTACHMENT_MAX_OTHER_SIZE;
        const maxSizeLabel = isImage ? '5MB' : '20MB';

        if (file.size > maxSize) {
          errors.push(`"${file.name}" exceeds the maximum size of ${maxSizeLabel}.`);
          continue;
        }

        validFiles.push(file);
      }

      if (errors.length > 0) {
        toast({
          title: errors.length > 1 ? 'Errors' : 'Error',
          description: errors.join('\n'),
        });
      }

      if (validFiles.length > 0) {
        setAttachments((prev) => [...prev, ...validFiles]);
      }
    },
    [isSubmitting, attachments.length, setAttachments, toast],
  );

  // Drag and drop handlers
  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounterRef.current += 1;

      // Only set dragging if there are files being dragged
      if (e.dataTransfer.types.includes('Files')) {
        setIsDragging(true);
        // Auto-expand when dragging files over
        if (!isExpanded) {
          setIsExpanded(true);
        }
      }
    },
    [isExpanded],
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current -= 1;

    // Only set isDragging to false when we've left all nested elements
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounterRef.current = 0;
      setIsDragging(false);

      const dataTransfer = e.dataTransfer;
      if (!dataTransfer) return;

      // Extract files from drag event
      const files: File[] = [];

      for (const item of dataTransfer.items) {
        if (item.kind === 'file') {
          const file = item.getAsFile();

          if (file) {
            files.push(file);
          }
        }
      }

      handleFilesAdded(files);
    },
    [handleFilesAdded],
  );

  // Trigger file input click
  const handleFileClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Derived values
  const hasContent = content.trim().length > 0;
  const displayPlaceholder = placeholder ?? POST_INPUT_PLACEHOLDER[variant];

  return {
    // Refs
    textareaRef,
    containerRef,
    fileInputRef,

    // State
    content,
    tags,
    setTags,
    attachments,
    setAttachments,
    isDragging,
    isExpanded,
    isSubmitting,
    showEmojiPicker,
    setShowEmojiPicker,

    // Derived values
    hasContent,
    displayPlaceholder,
    currentUserPubky,

    // Handlers
    handleExpand,
    handleSubmit,
    handleChange,
    handleEmojiSelect,
    handleFilesAdded,
    handleFileClick,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
  };
}
