'use client';

import { useState } from 'react';
import * as Atoms from '@/atoms';
import * as Core from '@/core';
import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';
import * as Hooks from '@/hooks';

interface DialogReplyInputProps {
  postId: string;
  onSuccess?: () => void;
}

export function DialogReplyInput({ postId, onSuccess }: DialogReplyInputProps) {
  const [tags, setTags] = useState<Array<{ id: string; label: string }>>([]);
  const { replyContent, setReplyContent, handleReplySubmit } = Hooks.usePostReply({ postId, onSuccess });
  const { ref: containerRef } = Hooks.useElementHeight();
  const currentUserId = Core.useAuthStore((state) => state.selectCurrentUserPubky());

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleReplySubmit();
    }
  };

  return (
    <div className="flex flex-col gap-4 p-6 border border-dashed border-input rounded-md relative">
      <Organisms.PostHeader postId={currentUserId} hideTime={true} />

      {/* Input field */}
      <div className="flex gap-1 items-start w-full">
        <div ref={containerRef} className="flex-1">
          <Atoms.Textarea
            placeholder="Write a reply..."
            className="min-h-6 border-none bg-transparent p-0 text-base leading-6 font-medium text-secondary-foreground focus-visible:ring-0 focus-visible:ring-offset-0 resize-none shadow-none"
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
          />
        </div>
      </div>

      <div className="flex justify-between items-center md:flex-row flex-col md:gap-0 gap-2">
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

        <Organisms.DialogReplyActionBar onPostClick={handleReplySubmit} isPostDisabled={!replyContent.trim()} />
      </div>
    </div>
  );
}
