'use client';

import { useState } from 'react';
import * as Atoms from '@/atoms';
import * as Core from '@/core';
import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';
import * as Hooks from '@/hooks';

export type DialogPostInputVariant = 'reply' | 'repost';

export interface DialogPostInputProps {
  variant: DialogPostInputVariant;
  postId: string;
  onSuccess?: () => void;
}

export function DialogPostInput({ variant, postId, onSuccess }: DialogPostInputProps) {
  const [tags, setTags] = useState<Array<{ id: string; label: string }>>([]);

  // Hooks must be called unconditionally - we'll use the appropriate one based on variant
  const replyHook = Hooks.usePostReply({ postId, onSuccess: variant === 'reply' ? onSuccess : undefined });
  const repostHook = Hooks.usePostRepost({ postId, onSuccess: variant === 'repost' ? onSuccess : undefined });

  const content = variant === 'reply' ? replyHook.replyContent : repostHook.repostContent;
  const setContent = variant === 'reply' ? replyHook.setReplyContent : repostHook.setRepostContent;
  const handleSubmit = variant === 'reply' ? replyHook.handleReplySubmit : repostHook.handleRepostSubmit;

  const { ref: containerRef } = Hooks.useElementHeight();
  const currentUserId = Core.useAuthStore((state) => state.selectCurrentUserPubky());

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit();
    }
  };

  const placeholder = variant === 'reply' ? 'Write a reply...' : 'Optional comment';
  const isActionDisabled = variant === 'reply' ? !content.trim() : false;
  const showPreviewInside = variant === 'repost';

  return (
    <div className="flex flex-col gap-4 p-6 border border-dashed border-input rounded-md relative">
      {variant === 'reply' && <Atoms.PostReplyConnector />}
      <Organisms.PostHeader postId={currentUserId} hideTime={true} />

      {/* Input field */}
      <div ref={containerRef}>
        <Atoms.Textarea
          placeholder={placeholder}
          className="min-h-6 border-none bg-transparent p-0 text-base font-medium text-secondary-foreground focus-visible:ring-0 focus-visible:ring-offset-0 resize-none shadow-none"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
        />
      </div>

      {/* Preview card - only shown inside for repost */}
      {showPreviewInside && <Organisms.DialogPostPreview postId={postId} variant="repost" />}

      <div className="flex justify-between md:flex-row flex-col md:gap-0 gap-2">
        <Molecules.PostTagsList
          tags={tags.map((tag) => ({ label: tag.label }))}
          showInput={false}
          showAddButton={true}
          addMode={true}
          showEmojiPicker={false}
          showTagClose={true}
          onTagAdd={(tag) => {
            setTags([...tags, { id: `${Date.now()}`, label: tag }]);
          }}
          onTagClose={(tag, index) => {
            setTags(tags.filter((_, i) => i !== index));
          }}
        />

        <Organisms.DialogActionBar variant={variant} onActionClick={handleSubmit} isActionDisabled={isActionDisabled} />
      </div>
    </div>
  );
}
