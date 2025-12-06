'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';
import * as Hooks from '@/hooks';
import { POST_MAX_CHARACTER_LENGTH } from '@/config';
import { PostInputTags } from '../PostInputTags';
import { PostInputActionBar } from '../PostInputActionBar';
import { POST_INPUT_VARIANT, POST_INPUT_PLACEHOLDER } from './PostInput.constants';
import type { PostInputProps } from './PostInput.types';

export function PostInput({
  variant,
  postId,
  onSuccess,
  placeholder,
  showThreadConnector = false,
  expanded = false,
}: PostInputProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isExpanded, setIsExpanded] = useState(expanded);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { currentUserPubky } = Hooks.useCurrentUserProfile();
  const { content, setContent, tags, setTags, reply, post, isSubmitting } = Hooks.usePost();

  // Handle expand on interaction
  const handleExpand = useCallback(() => {
    if (!isExpanded) {
      setIsExpanded(true);
    }
  }, [isExpanded]);

  // Handle click outside to collapse (only when expanded prop is false)
  useEffect(() => {
    // Only add listener if component can be collapsed (expanded prop is false)
    if (expanded) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        // Only collapse if there's no content and no tags
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

  // Handle submit using reply or post method from hook
  const handleSubmit = useCallback(async () => {
    if (!content.trim() || isSubmitting) return;

    const submitHandlers = {
      [POST_INPUT_VARIANT.REPLY]: () =>
        reply({
          postId: postId!,
          onSuccess,
        }),
      [POST_INPUT_VARIANT.POST]: () =>
        post({
          onSuccess,
        }),
    };

    const submitHandler = submitHandlers[variant]();
    await submitHandler();
  }, [content, variant, postId, reply, post, isSubmitting, onSuccess]);

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

  // Check if content has non-whitespace characters
  const hasContent = content.trim().length > 0;

  // Determine placeholder text
  const displayPlaceholder = placeholder ?? POST_INPUT_PLACEHOLDER[variant];

  return (
    <Atoms.Container
      ref={containerRef}
      className="relative cursor-pointer rounded-md border border-dashed border-input p-6"
      onClick={handleExpand}
    >
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
          onFocus={handleExpand}
          maxLength={POST_MAX_CHARACTER_LENGTH}
          rows={1}
          disabled={isSubmitting}
        />

        {/* Expandable section with animation */}
        <Atoms.Container
          className={`grid transition-all duration-300 ease-in-out ${
            isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          }`}
          overrideDefaults
        >
          <Atoms.Container className="overflow-hidden" overrideDefaults>
            <Atoms.Container className="gap-4">
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
                      onClose={() => setTags((prevTags) => prevTags.filter((_, i) => i !== index))}
                    />
                  ))}
                </Atoms.Container>
              )}

              <Atoms.Container className="justify-between gap-4 md:flex-row md:gap-0">
                <PostInputTags tags={tags} onTagsChange={setTags} disabled={isSubmitting} />
                <PostInputActionBar
                  onPostClick={handleSubmit}
                  onEmojiClick={() => setShowEmojiPicker(true)}
                  isPostDisabled={!content.trim() || isSubmitting}
                  isSubmitting={isSubmitting}
                />
              </Atoms.Container>
            </Atoms.Container>
          </Atoms.Container>
        </Atoms.Container>

        <Molecules.EmojiPickerDialog
          open={showEmojiPicker && !isSubmitting}
          onOpenChange={setShowEmojiPicker}
          onEmojiSelect={handleEmojiSelect}
        />
      </Atoms.Container>
    </Atoms.Container>
  );
}
