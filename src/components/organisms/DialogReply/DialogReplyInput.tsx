'use client';

import { useState } from 'react';

import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Hooks from '@/hooks';
import { DialogReplyActionBar } from './DialogReplyActionBar';

const MAX_CHARACTER_LENGTH = 2000;

export interface DialogReplyInputProps {
  replyContent: string;
  onReplyContentChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  tags: string[];
  onTagAdd: (tag: string) => Promise<void>;
  onTagRemove: (tag: string) => void;
  onReplySubmit: () => void;
  isPostDisabled: boolean;
  onEmojiClick: () => void;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
}

export function DialogReplyInput({
  replyContent,
  onReplyContentChange,
  onKeyDown,
  tags,
  onTagAdd,
  onTagRemove,
  onReplySubmit,
  isPostDisabled,
  onEmojiClick,
  textareaRef,
}: DialogReplyInputProps) {
  const [showTagInput, setShowTagInput] = useState(false);
  const { ref: replyInputRef, height: replyInputHeight } = Hooks.useElementHeight();

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_CHARACTER_LENGTH) {
      onReplyContentChange(value);
    }
  };

  return (
    <Atoms.Container className="flex gap-4" overrideDefaults>
      {/* Thread Connector */}
      <Atoms.Container className="relative w-3 shrink-0" overrideDefaults>
        <Atoms.PostThreadConnector height={replyInputHeight} variant="last" />
      </Atoms.Container>

      {/* Reply Input */}
      <Atoms.Container
        ref={replyInputRef}
        className="flex min-h-0 flex-1 flex-col gap-4 rounded-md border border-dashed border-input p-6"
        overrideDefaults
      >
        {/* Textarea */}
        <Atoms.Textarea
          ref={textareaRef}
          placeholder="Write a reply..."
          className="min-h-6 resize-none border-none bg-transparent p-0 text-base font-medium break-all text-secondary-foreground shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
          value={replyContent}
          onChange={handleChange}
          onKeyDown={onKeyDown}
          maxLength={MAX_CHARACTER_LENGTH}
          rows={1}
        />

        {/* Tags - on their own line above */}
        {tags.length > 0 && (
          <Atoms.Container key={`tags-${tags.length}`} className="flex flex-wrap items-center gap-2" overrideDefaults>
            {tags.map((tag) => (
              <Molecules.PostTag key={tag} label={tag} showClose={true} onClose={() => onTagRemove(tag)} />
            ))}
          </Atoms.Container>
        )}

        {/* Tag Input and Action Bar - on the same line */}
        <Atoms.Container className="flex items-center justify-between gap-2" overrideDefaults>
          {showTagInput ? (
            <Molecules.PostTagInput
              placeholder="add tag"
              showEmojiPicker={true}
              onSubmit={async (tag) => {
                await onTagAdd(tag);
                // Input stays open - PostTagInput clears itself but remains visible
              }}
              onClose={() => setShowTagInput(false)}
              autoFocus={true}
            />
          ) : (
            <Molecules.PostTagAddButton onClick={() => setShowTagInput(true)} />
          )}
          <DialogReplyActionBar
            onEmojiClick={onEmojiClick}
            onImageClick={() => {
              // TODO: Implement image upload
            }}
            onFileClick={() => {
              // TODO: Implement file upload
            }}
            onArticleClick={() => {
              // TODO: Implement article link
            }}
            onPostClick={onReplySubmit}
            isPostDisabled={isPostDisabled}
          />
        </Atoms.Container>
      </Atoms.Container>
    </Atoms.Container>
  );
}
