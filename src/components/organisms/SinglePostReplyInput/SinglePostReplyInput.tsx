'use client';

import * as Atoms from '@/atoms';
import * as Hooks from '@/hooks';
import type { SinglePostReplyInputProps } from './SinglePostReplyInput.types';

export function SinglePostReplyInput({ postId, onSuccess }: SinglePostReplyInputProps) {
  const { content, setContent, reply, isSubmitting } = Hooks.usePost();
  const { ref: containerRef, height: containerHeight } = Hooks.useElementHeight();

  const handleReplySubmit = () => reply({ postId, onSuccess });

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
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSubmitting}
        />
      </div>
    </div>
  );
}
