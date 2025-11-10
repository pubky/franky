'use client';

import { useState } from 'react';
import * as Atoms from '@/atoms';
import * as Core from '@/core';
import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';
import * as Hooks from '@/hooks';
import * as Shared from '@/shared/postActionVariants';

export type DialogPostInputVariant = Shared.PostActionVariant;

export interface DialogPostInputProps {
  variant: DialogPostInputVariant;
  postId?: string; // postId is optional for 'new' variant
  onSuccess?: () => void;
}

export function DialogPostInput({ variant, postId, onSuccess }: DialogPostInputProps) {
  const [tags, setTags] = useState<Array<{ id: string; label: string }>>([]);

  const { content, setContent, handleSubmit } = Hooks.usePostAction({
    variant,
    postId,
    onSuccess,
  });

  const { ref: containerRef } = Hooks.useElementHeight();
  const currentUserId = Core.useAuthStore((state) => state.selectCurrentUserPubky());

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit();
    }
  };

  const placeholder = Shared.POST_ACTION_PLACEHOLDERS[variant];
  const isActionDisabled = Shared.requiresContent(variant) ? !content.trim() : false;
  const showReplyConnector = variant === Shared.POST_ACTION_VARIANT.REPLY;
  const showPreviewInside = variant === Shared.POST_ACTION_VARIANT.REPOST;

  const handleTagAdd = (tag: string) => {
    setTags([...tags, { id: `${Date.now()}`, label: tag }]);
  };

  const handleTagClose = (tag: Molecules.PostTagsListTag, index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-4 p-6 border border-dashed border-input rounded-md relative">
      {showReplyConnector && <Atoms.PostReplyConnector />}
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
      {showPreviewInside && postId && <Organisms.DialogPostPreview postId={postId} variant="repost" />}

      <div className="flex justify-between md:flex-row flex-col md:gap-0 gap-2">
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

        <Organisms.DialogActionBar variant={variant} onActionClick={handleSubmit} isActionDisabled={isActionDisabled} />
      </div>
    </div>
  );
}
