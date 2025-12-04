'use client';

import { useEffect } from 'react';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Hooks from '@/hooks';
import type { SinglePostReplyInputProps } from './SinglePostReplyInput.types';

export function SinglePostReplyInput({ postId, onSuccess }: SinglePostReplyInputProps) {
  const { replyContent, setReplyContent, handleReplySubmit, isSubmitting, error } = Hooks.usePostReply({
    postId,
    onSuccess,
  });
  const { ref: containerRef, height: containerHeight } = Hooks.useElementHeight();
  const { toast } = Molecules.useToast();

  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: error,
        className: 'destructive border-destructive bg-destructive text-destructive-foreground',
      });
    }
  }, [error, toast]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isSubmitting) {
      e.preventDefault();
      void handleReplySubmit();
    }
  };

  return (
    <div className="flex gap-4">
      <div className="w-8 shrink-0">
        <Atoms.ReplyLine height={containerHeight} isLast={true} />
      </div>
      <div ref={containerRef} className="flex-1">
        <Atoms.Textarea
          placeholder="Write a reply..."
          className="min-h-20"
          value={replyContent}
          onChange={(e) => setReplyContent(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSubmitting}
        />
      </div>
    </div>
  );
}
