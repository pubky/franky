'use client';

import { useState, useRef, useCallback } from 'react';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Libs from '@/libs';
import * as Hooks from '@/hooks';
import { POST_MAX_TAGS } from '@/config';
import type { DialogReplyTagsProps } from './DialogReplyTags.types';

export function DialogReplyTags({
  tags,
  onTagsChange,
  maxTags = POST_MAX_TAGS,
  disabled = false,
}: DialogReplyTagsProps) {
  const [tagInputValue, setTagInputValue] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const tagInputRef = useRef<HTMLInputElement>(null);

  const isAtLimit = tags.length >= maxTags;
  const isDisabled = disabled || isAtLimit;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInputValue(e.target.value);
    // Clear limit reached message when user starts typing again
    if (limitReached) {
      setLimitReached(false);
    }
  };

  const handleTagAdd = (tag: string) => {
    // Validate tag count limit
    if (isAtLimit) {
      setLimitReached(true);
      return;
    }

    const trimmedTag = tag.trim();
    if (!trimmedTag) {
      return;
    }

    // Normalize for duplicate check (case-insensitive)
    const normalizedTag = trimmedTag.toLowerCase();
    const isDuplicate = tags.some((existingTag) => existingTag.toLowerCase() === normalizedTag);

    if (!isDuplicate) {
      // Store tag with original case (trimmed)
      onTagsChange([...tags, trimmedTag]);
      setTagInputValue('');
      setLimitReached(false);
    }
  };

  const handleTagInputSubmit = (value: string) => {
    if (value.trim()) {
      handleTagAdd(value);
    }
  };

  const handleTagInputBlur = () => {
    if (!tagInputValue) {
      setIsAddingTag(false);
    }
  };

  // Wrapper to clear limit reached message when emoji is inserted
  const handleEmojiChange = useCallback(
    (newValue: string) => {
      setTagInputValue(newValue);
      if (limitReached) {
        setLimitReached(false);
      }
    },
    [limitReached],
  );

  const handleEmojiSelect = Hooks.useEmojiInsert({
    inputRef: tagInputRef,
    value: tagInputValue,
    onChange: handleEmojiChange,
  });

  const handleCloseInput = () => {
    setTagInputValue('');
    setIsAddingTag(false);
  };

  return (
    <>
      <Atoms.Container overrideDefaults className="flex flex-col gap-1">
        <Atoms.Container overrideDefaults className="flex flex-wrap items-center gap-2">
          {/* Add tag input */}
          {isAddingTag && !disabled && (
            <Atoms.Container
              overrideDefaults={true}
              className={Libs.cn(
                'relative flex h-8 w-48 items-center gap-1 rounded-md border border-dashed pr-1 pl-3 shadow-sm',
                limitReached ? 'border-destructive' : 'border-input',
              )}
            >
              <Atoms.Input
                ref={tagInputRef}
                type="text"
                value={tagInputValue}
                placeholder={isAtLimit ? 'limit reached' : 'add tag'}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && tagInputValue.trim()) {
                    e.preventDefault();
                    handleTagInputSubmit(tagInputValue);
                  }
                }}
                onBlur={handleTagInputBlur}
                disabled={isDisabled}
                className={Libs.cn(
                  'flex-1 bg-transparent p-0 text-sm leading-5 font-bold caret-white',
                  'border-none shadow-none ring-0 outline-none hover:outline-none focus:ring-0 focus:ring-offset-0 focus:outline-none',
                  'placeholder:font-bold',
                  isAtLimit ? 'placeholder:text-destructive' : 'placeholder:text-input',
                  tagInputValue ? 'text-foreground' : 'text-input',
                )}
              />
              <Atoms.Button
                overrideDefaults={true}
                onClick={() => setShowEmojiPicker(true)}
                className="inline-flex size-5 cursor-pointer items-center justify-center rounded-full p-1 shadow-xs-dark hover:shadow-xs-dark"
                aria-label="Open emoji picker"
                disabled={isDisabled}
              >
                <Libs.Smile className="size-4" strokeWidth={2} />
              </Atoms.Button>
              <Atoms.Button
                overrideDefaults={true}
                onClick={handleCloseInput}
                className="inline-flex size-5 cursor-pointer items-center justify-center rounded-full p-1 hover:opacity-80"
                aria-label="Close tag input"
              >
                <Libs.X className="size-3" strokeWidth={2} />
              </Atoms.Button>
            </Atoms.Container>
          )}

          {/* Add button - disabled when at limit or disabled */}
          {!isAddingTag && (
            <Molecules.PostTagAddButton
              onClick={() => {
                setIsAddingTag(true);
              }}
              disabled={isDisabled}
            />
          )}

          {/* Tag count indicator */}
          {tags.length > 0 && (
            <Atoms.Typography
              as="span"
              size="sm"
              className={Libs.cn('text-muted-foreground', isAtLimit && 'text-destructive')}
            >
              {tags.length}/{maxTags}
            </Atoms.Typography>
          )}
        </Atoms.Container>

        {/* Limit reached message */}
        {limitReached && (
          <Atoms.Typography as="span" size="sm" className="text-destructive">
            Maximum of {maxTags} tags allowed
          </Atoms.Typography>
        )}
      </Atoms.Container>

      {/* Emoji Picker Dialog */}
      <Molecules.EmojiPickerDialog
        open={showEmojiPicker && !disabled}
        onOpenChange={setShowEmojiPicker}
        onEmojiSelect={handleEmojiSelect}
      />
    </>
  );
}
