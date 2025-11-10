'use client';

import * as Atoms from '@/atoms';
import * as Hooks from '@/hooks';

interface PostReplyInputProps {
  postId: string;
  onSuccess?: () => void;
}

export function SinglePostReplyInput({ postId, onSuccess }: PostReplyInputProps) {
  const { replyContent, setReplyContent, handleReplySubmit } = Hooks.usePostReply({ postId, onSuccess });
  const { ref: containerRef, height: containerHeight } = Hooks.useElementHeight();

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
