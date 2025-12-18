'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import * as Hooks from '@/hooks';
import { POST_MAX_CHARACTER_LENGTH } from '@/config';
import { useTimelineFeedContext } from '@/organisms/TimelineFeed/TimelineFeed';
import { POST_INPUT_VARIANT, POST_INPUT_PLACEHOLDER } from '@/organisms/PostInput/PostInput.constants';
import type { UsePostInputOptions, UsePostInputReturn } from './usePostInput.types';

/**
 * Hook that encapsulates all PostInput logic.
 *
 * Manages:
 * - Content and tags state (via usePost)
 * - Expand/collapse behavior
 * - Emoji picker integration
 * - Form submission (post or reply)
 * - Click outside detection for collapse
 * - Content change notifications to parent
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

  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Hooks
  const { currentUserPubky } = Hooks.useCurrentUserProfile();
  const { content, setContent, tags, setTags, reply, post, repost, isSubmitting } = Hooks.usePost();
  const timelineFeed = useTimelineFeedContext();

  // Notify parent of content changes
  useEffect(() => {
    onContentChange?.(content, tags);
  }, [content, tags, onContentChange]);

  // Handle click outside to collapse (only when expanded prop is false)
  useEffect(() => {
    if (expanded) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        if (!content.trim() && tags.length === 0) {
          setIsExpanded(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [expanded, content, tags]);

  // Handle expand on interaction
  const handleExpand = useCallback(() => {
    if (!isExpanded) {
      setIsExpanded(true);
    }
  }, [isExpanded]);

  // Handle submit using reply, repost, or post method from hook
  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;

    // For replies and posts, require content. For reposts, content is optional.
    if (variant !== POST_INPUT_VARIANT.REPOST && !content.trim()) return;

    // Wrapper that prepends to timeline and calls original onSuccess
    const handleSuccess = (createdPostId: string) => {
      // Prepend to timeline
      timelineFeed?.prependPosts(createdPostId);
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
  }, [content, variant, postId, originalPostId, reply, post, repost, isSubmitting, onSuccess, timelineFeed]);

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

  // Derived values
  const hasContent = content.trim().length > 0;
  const displayPlaceholder = placeholder ?? POST_INPUT_PLACEHOLDER[variant];

  return {
    // Refs
    textareaRef,
    containerRef,

    // State
    content,
    tags,
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
    setTags,
  };
}
