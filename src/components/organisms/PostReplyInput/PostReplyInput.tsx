'use client';

import { useState } from 'react';
import * as Atoms from '@/atoms';
import * as Core from '@/core';

interface PostReplyInputProps {
  postId: string;
}

export function PostReplyInput({ postId }: PostReplyInputProps) {
  const [replyContent, setReplyContent] = useState('');

  const handleReplySubmit = async () => {
    if (!replyContent.trim() || !postId) return;

    try {
      const currentUserId = Core.useAuthStore.getState().selectCurrentUserPubky();
      await Core.PostController.addReply({
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
        <Atoms.ReplyLine path="M 16 0 v 42 a 8 8 0 0 0 8 8 h 24" />
      </div>
      <div className="flex-1">
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
