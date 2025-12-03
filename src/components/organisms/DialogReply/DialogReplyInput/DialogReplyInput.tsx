'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';
import * as Hooks from '@/hooks';
import { POST_MAX_CHARACTER_LENGTH } from '@/config';
import { DialogReplyTags } from '../DialogReplyTags';
import { DialogReplyActionBar } from '../DialogReplyActionBar';
import type { DialogReplyInputProps } from './DialogReplyInput.types';

export function DialogReplyInput({ postId, onSuccessAction }: DialogReplyInputProps) {
  const [tags, setTags] = useState<string[]>([]);
  const [showReplyEmojiPicker, setShowReplyEmojiPicker] = useState(false);
  const replyTextareaRef = useRef<HTMLTextAreaElement>(null);
  const { currentUserPubky } = Hooks.useCurrentUserProfile();
  const { toast } = Molecules.useToast();

  const { replyContent, setReplyContent, handleReplySubmit, isSubmitting, error } = Hooks.usePostReply({
    postId,
    tags,
    onSuccess: () => {
      setTags([]);
      onSuccessAction();
    },
  });

  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: error,
        className: 'destructive border-destructive bg-destructive text-destructive-foreground',
      });
    }
  }, [error, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= POST_MAX_CHARACTER_LENGTH) {
      setReplyContent(value);
    }
  };

  // Wrapper to apply validation when emoji is inserted
  const handleEmojiChange = useCallback(
    (newValue: string) => {
      if (newValue.length <= POST_MAX_CHARACTER_LENGTH) {
        setReplyContent(newValue);
      }
    },
    [setReplyContent],
  );

  const handleReplyEmojiSelect = Hooks.useEmojiInsert({
    inputRef: replyTextareaRef,
    value: replyContent,
    onChange: handleEmojiChange,
  });

  return (
    <Atoms.Container className="relative rounded-md border border-dashed border-input p-6">
      <Atoms.DialogPostReplyThreadConnector />
      <Atoms.Container className="gap-4">
        {currentUserPubky && (
          <Organisms.PostHeader
            postId={currentUserPubky}
            isReplyInput={true}
            characterCount={replyContent.length}
            maxLength={POST_MAX_CHARACTER_LENGTH}
          />
        )}

        <Atoms.Textarea
          ref={replyTextareaRef}
          placeholder="Write a reply..."
          className="min-h-6 resize-none border-none bg-transparent p-0 text-base font-medium break-all text-secondary-foreground shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
          value={replyContent}
          onChange={handleChange}
          maxLength={POST_MAX_CHARACTER_LENGTH}
          rows={1}
          disabled={isSubmitting}
        />

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

        {/* Tag input and action buttons row */}
        <Atoms.Container className="justify-between gap-4 md:flex-row md:gap-0">
          <DialogReplyTags tags={tags} onTagsChange={setTags} disabled={isSubmitting} />
          <DialogReplyActionBar
            onPostClick={handleReplySubmit}
            onEmojiClick={() => setShowReplyEmojiPicker(true)}
            isPostDisabled={!replyContent.trim() || isSubmitting}
            isSubmitting={isSubmitting}
          />
        </Atoms.Container>

        <Molecules.EmojiPickerDialog
          open={showReplyEmojiPicker && !isSubmitting}
          onOpenChange={setShowReplyEmojiPicker}
          onEmojiSelect={handleReplyEmojiSelect}
        />
      </Atoms.Container>
    </Atoms.Container>
  );
}
