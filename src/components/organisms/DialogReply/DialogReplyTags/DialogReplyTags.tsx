'use client';

import { useState, useRef } from 'react';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Libs from '@/libs';
import type { DialogReplyTagsProps } from './DialogReplyTags.types';

export function DialogReplyTags({ tags, onTagsChange }: DialogReplyTagsProps) {
  const [tagInputValue, setTagInputValue] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const tagInputRef = useRef<HTMLInputElement>(null);

  const handleTagAdd = (tag: string) => {
    const normalizedTag = tag.trim().toLowerCase();
    const isDuplicate = tags.some((existingTag) => existingTag.toLowerCase() === normalizedTag);
    if (!isDuplicate && normalizedTag) {
      onTagsChange([...tags, tag.trim()]);
      setTagInputValue('');
    }
  };

  const handleTagClose = (index: number) => {
    onTagsChange(tags.filter((_, i) => i !== index));
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

  const handleEmojiSelect = (emoji: { native: string }) => {
    const input = tagInputRef.current;
    if (!input) return;

    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? 0;
    const newValue = tagInputValue.slice(0, start) + emoji.native + tagInputValue.slice(end);

    setTagInputValue(newValue);

    setTimeout(() => {
      input.focus();
      const newCursorPos = start + emoji.native.length;
      input.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleCloseInput = () => {
    setTagInputValue('');
    setIsAddingTag(false);
  };

  return (
    <>
      <Atoms.Container overrideDefaults className="flex flex-wrap items-center gap-2">
        {/* Render local tags */}
        {tags.map((tag, index) => (
          <Molecules.PostTag
            key={`${tag}-${index}`}
            label={tag}
            showClose={true}
            onClose={() => handleTagClose(index)}
          />
        ))}

        {/* Add tag input */}
        {isAddingTag && (
          <Atoms.Container
            overrideDefaults={true}
            className="relative flex h-8 w-48 items-center gap-1 rounded-md border border-dashed border-input pr-1 pl-3 shadow-sm"
          >
            <Atoms.Input
              ref={tagInputRef}
              type="text"
              value={tagInputValue}
              placeholder="add tag"
              onChange={(e) => setTagInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && tagInputValue.trim()) {
                  e.preventDefault();
                  handleTagInputSubmit(tagInputValue);
                }
              }}
              onBlur={handleTagInputBlur}
              className={Libs.cn(
                'flex-1 bg-transparent p-0 text-sm leading-5 font-bold caret-white',
                'border-none shadow-none ring-0 outline-none hover:outline-none focus:ring-0 focus:ring-offset-0 focus:outline-none',
                'placeholder:font-bold placeholder:text-input',
                tagInputValue ? 'text-foreground' : 'text-input',
              )}
            />
            <Atoms.Button
              overrideDefaults={true}
              onClick={() => setShowEmojiPicker(true)}
              className="inline-flex size-5 cursor-pointer items-center justify-center rounded-full p-1 shadow-xs-dark hover:shadow-xs-dark"
              aria-label="Open emoji picker"
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

        {/* Add button */}
        {!isAddingTag && (
          <Molecules.PostTagAddButton
            onClick={() => {
              setIsAddingTag(true);
            }}
          />
        )}
      </Atoms.Container>

      {/* Emoji Picker Dialog */}
      <Molecules.EmojiPickerDialog
        open={showEmojiPicker}
        onOpenChange={setShowEmojiPicker}
        onEmojiSelect={handleEmojiSelect}
        currentInput={tagInputValue}
      />
    </>
  );
}
