'use client';

import React, { useState, useRef, useCallback } from 'react';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';
import * as Hooks from '@/hooks';
import { POST_MAX_CHARACTER_LENGTH } from '@/config';
import { PostInputTags } from '../PostInputTags';
import { PostInputActionBar } from '../PostInputActionBar';
import { POST_INPUT_VARIANT } from './PostInput.constants';
import type { PostInputProps } from './PostInput.types';

export function PostInput({ variant, postId, onSuccess, placeholder, showThreadConnector = false }: PostInputProps) {
  const [tags, setTags] = useState<string[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { currentUserPubky } = Hooks.useCurrentUserProfile();
  const { content, setContent, reply, post, isSubmitting } = Hooks.usePost();

  // Handle submit using reply or post method from hook
  const handleSubmit = useCallback(async () => {
    if (!content.trim() || isSubmitting) return;

    const onSuccessHandler = () => {
      setTags([]);
      onSuccess?.();
    };

    const submitHandlers = {
      [POST_INPUT_VARIANT.REPLY]: () =>
        reply({
          postId: postId!,
          tags,
          onSuccess: onSuccessHandler,
        }),
      [POST_INPUT_VARIANT.POST]: () =>
        post({
          tags,
          onSuccess: onSuccessHandler,
        }),
    };

    const submitHandler = submitHandlers[variant]();
    await submitHandler();
  }, [content, tags, variant, postId, reply, post, isSubmitting, onSuccess]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= POST_MAX_CHARACTER_LENGTH) {
      setContent(value);
    }
  };

  // Wrapper to apply validation when emoji is inserted
  const handleEmojiChange = useCallback(
    (newValue: string) => {
      if (newValue.length <= POST_MAX_CHARACTER_LENGTH) {
        setContent(newValue);
      }
    },
    [setContent],
  );

  const handleEmojiSelect = Hooks.useEmojiInsert({
    inputRef: textareaRef,
    value: content,
    onChange: handleEmojiChange,
  });

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  // Check if content has non-whitespace characters
  const hasContent = content.trim().length > 0;

  // Show bottom bar when focused OR has content OR has tags
  // For reply variant, always show bottom bar (dialog context - shouldn't hide on blur)
  const showBottomBar = variant === POST_INPUT_VARIANT.REPLY || isFocused || hasContent || tags.length > 0;

  // Determine placeholder text
  const placeholderMap = {
    [POST_INPUT_VARIANT.REPLY]: 'Write a reply...',
    [POST_INPUT_VARIANT.POST]: "What's on your mind?",
  } as const;
  const defaultPlaceholder = placeholderMap[variant];
  const displayPlaceholder = placeholder ?? defaultPlaceholder;

  return (
    <Atoms.Container className="relative rounded-md border border-dashed border-input p-6">
      {showThreadConnector && <Atoms.DialogPostReplyThreadConnector />}
      <Atoms.Container className="gap-4">
        {currentUserPubky && (
          <Organisms.PostHeader
            postId={currentUserPubky}
            isReplyInput={true}
            characterCount={content.length}
            maxLength={POST_MAX_CHARACTER_LENGTH}
          />
        )}

        <Atoms.Textarea
          ref={textareaRef}
          placeholder={displayPlaceholder}
          className="min-h-6 resize-none border-none bg-transparent p-0 text-base font-medium break-all text-secondary-foreground shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
          value={content}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          maxLength={POST_MAX_CHARACTER_LENGTH}
          rows={1}
          disabled={isSubmitting}
        />

        {/* Link preview - show when content has URLs */}
        {hasContent && <Molecules.PostLinkEmbeds content={content} />}

        {/* Tags row */}
        {tags.length > 0 && (
          <Atoms.Container className="flex flex-wrap items-center gap-2" overrideDefaults>
            {tags.map((tag, index) => (
              <Molecules.PostTag
                key={`${tag}-${index}`}
                label={tag}
                showClose={!isSubmitting}
                onClose={() => setTags(tags.filter((_, i) => i !== index))}
              />
            ))}
          </Atoms.Container>
        )}

        {/* Tag input and action buttons row - only show when focused or has content/tags */}
        {showBottomBar && (
          <Atoms.Container className="justify-between gap-4 md:flex-row md:gap-0">
            <PostInputTags tags={tags} onTagsChange={setTags} disabled={isSubmitting} />
            <PostInputActionBar
              onPostClick={handleSubmit}
              onEmojiClick={() => setShowEmojiPicker(true)}
              isPostDisabled={!content.trim() || isSubmitting}
              isSubmitting={isSubmitting}
            />
          </Atoms.Container>
        )}

        <Molecules.EmojiPickerDialog
          open={showEmojiPicker && !isSubmitting}
          onOpenChange={setShowEmojiPicker}
          onEmojiSelect={handleEmojiSelect}
        />
      </Atoms.Container>
    </Atoms.Container>
  );
}
