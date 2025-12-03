'use client';

import React, { useState, useRef } from 'react';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';
import * as Hooks from '@/hooks';
import { DialogReplyTags } from '../DialogReplyTags';
import { DialogReplyActionBar } from '../DialogReplyActionBar';
import type { DialogReplyInputProps } from './DialogReplyInput.types';

const MAX_CHARACTER_LENGTH = 2000;

export function DialogReplyInput({ postId, onSuccessAction }: DialogReplyInputProps) {
  const [tags, setTags] = useState<string[]>([]);
  const [showReplyEmojiPicker, setShowReplyEmojiPicker] = useState(false);
  const replyTextareaRef = useRef<HTMLTextAreaElement>(null);
  const { currentUserPubky } = Hooks.useCurrentUserProfile();

  const { replyContent, setReplyContent, handleReplySubmit } = Hooks.usePostReply({
    postId,
    tags,
    onSuccess: () => {
      setTags([]);
      onSuccessAction();
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_CHARACTER_LENGTH) {
      setReplyContent(value);
    }
  };

  const handleReplyEmojiSelect = (emoji: { native: string }) => {
    const textarea = replyTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    const newValue = replyContent.slice(0, start) + emoji.native + replyContent.slice(end);

    // Use handleChange to ensure validation is applied
    handleChange({ target: { value: newValue } } as React.ChangeEvent<HTMLTextAreaElement>);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + emoji.native.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  return (
    <Atoms.Container className="relative rounded-md border border-dashed border-input p-6">
      <Atoms.DialogPostReplyThreadConnector />
      <Atoms.Container className="gap-4">
        {currentUserPubky && (
          <Organisms.PostHeader
            postId={currentUserPubky}
            isReplyInput={true}
            characterCount={replyContent.length}
            maxLength={MAX_CHARACTER_LENGTH}
          />
        )}

        <Atoms.Textarea
          ref={replyTextareaRef}
          placeholder="Write a reply..."
          className="min-h-6 resize-none border-none bg-transparent p-0 text-base font-medium break-all text-secondary-foreground shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
          value={replyContent}
          onChange={handleChange}
          maxLength={MAX_CHARACTER_LENGTH}
          rows={1}
        />

        {/* Tags row */}
        {tags.length > 0 && (
          <Atoms.Container className="flex flex-wrap items-center gap-2" overrideDefaults>
            {tags.map((tag, index) => (
              <Molecules.PostTag
                key={`${tag}-${index}`}
                label={tag}
                showClose={true}
                onClose={() => setTags(tags.filter((_, i) => i !== index))}
              />
            ))}
          </Atoms.Container>
        )}

        {/* Tag input and action buttons row */}
        <Atoms.Container className="justify-between gap-4 md:flex-row md:gap-0">
          <DialogReplyTags tags={tags} onTagsChange={setTags} />
          <DialogReplyActionBar
            onPostClick={handleReplySubmit}
            onEmojiClick={() => setShowReplyEmojiPicker(true)}
            isPostDisabled={!replyContent.trim()}
          />
        </Atoms.Container>

        <Molecules.EmojiPickerDialog
          open={showReplyEmojiPicker}
          onOpenChange={setShowReplyEmojiPicker}
          onEmojiSelect={handleReplyEmojiSelect}
        />
      </Atoms.Container>
    </Atoms.Container>
  );
}
