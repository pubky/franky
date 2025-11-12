'use client';

import { useState } from 'react';
import * as Atoms from '@/atoms';
import * as Core from '@/core';
import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';
import * as Hooks from '@/hooks';

interface DialogReplyInputProps {
  postId: string;
  onSuccessAction: () => void;
}

const MAX_CHARACTER_LENGTH = 2000;

export function DialogReplyInput({ postId, onSuccessAction }: DialogReplyInputProps) {
  const [tags, setTags] = useState<Array<{ id: string; label: string }>>([]);
  const { replyContent, setReplyContent, handleReplySubmit } = Hooks.usePostReply({
    postId,
    onSuccess: onSuccessAction,
  });
  const currentUserId = Core.useAuthStore((state) => state.selectCurrentUserPubky());

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleReplySubmit();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_CHARACTER_LENGTH) {
      setReplyContent(value);
    }
  };

  const handleTagAdd = (tag: string) => {
    const normalizedTag = tag.trim().toLowerCase();
    setTags((prevTags) => {
      const isDuplicate = prevTags.some((existingTag) => existingTag.label.toLowerCase() === normalizedTag);
      if (!isDuplicate) {
        return [...prevTags, { id: `${Date.now()}`, label: tag.trim() }];
      }
      return prevTags;
    });
  };

  const handleTagClose = (_tag: unknown, index: number) => {
    setTags((prevTags) => prevTags.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col p-6 border border-dashed border-input rounded-md relative">
      <Atoms.PostReplyConnector />
      <div className="flex flex-col gap-4">
        <Organisms.PostHeader
          postId={currentUserId}
          hideTime={true}
          characterCount={replyContent.length}
          maxLength={MAX_CHARACTER_LENGTH}
        />

        {/* Input field */}
        <div>
          <Atoms.Textarea
            placeholder="Write a reply..."
            className="min-h-6 border-none bg-transparent p-0 text-base font-medium text-secondary-foreground focus-visible:ring-0 focus-visible:ring-offset-0 resize-none shadow-none break-all"
            value={replyContent}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            maxLength={MAX_CHARACTER_LENGTH}
            rows={1}
          />
        </div>

        <div className="flex justify-between md:flex-row flex-col md:gap-0 gap-4">
          <Molecules.PostTagsList
            tags={tags.map((tag) => ({ label: tag.label }))}
            showInput={false}
            showAddButton={true}
            addMode={true}
            showEmojiPicker={false}
            showTagClose={true}
            onTagAdd={handleTagAdd}
            onTagClose={handleTagClose}
          />

          <Organisms.DialogReplyActionBar onPostClick={handleReplySubmit} isPostDisabled={!replyContent.trim()} />
        </div>
      </div>
    </div>
  );
}
