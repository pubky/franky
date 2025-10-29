'use client';

import { useState } from 'react';
import * as Atoms from '@/atoms';
import * as Core from '@/core';
import * as Hooks from '@/hooks';

interface PostReplyInputProps {
  postId: string;
  onCancel?: () => void;
  onSuccess?: () => void;
}

export function SinglePostReplyInput({ postId }: PostReplyInputProps) {
  const [replyContent, setReplyContent] = useState('');
  const currentUserId = Core.useAuthStore((state) => state.selectCurrentUserPubky());
  const { ref: containerRef, height: containerHeight } = Hooks.useElementHeight();

  const handleReplySubmit = async () => {
    if (!replyContent.trim() || !postId || !currentUserId) return;

    try {
      await Core.PostController.create({
        parentPostId: postId,
        content: replyContent.trim(),
        authorId: currentUserId,
      });
      // useLiveQuery in PostReplies will automatically update the replies list
      setReplyContent('');
    } catch (error) {
      console.error('Failed to submit reply:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleReplySubmit();
    }
  };

  return (
    <div className="flex gap-4">
      <div className="w-8 flex-shrink-0">
        <Atoms.ReplyLine height={containerHeight} isLast={true} />
      </div>
      <div ref={containerRef} className="flex-1">
        <Atoms.Textarea
          placeholder="Write a reply..."
          className="min-h-20"
          value={replyContent}
          onChange={(e) => setReplyContent(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  );
}
