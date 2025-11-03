'use client';

import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import * as Atoms from '@/atoms';
import * as Core from '@/core';
import * as Libs from '@/libs';
import * as Molecules from '@/molecules';
import * as Hooks from '@/hooks';

interface DialogReplyInputProps {
  postId: string;
  onSuccess?: () => void;
}

export function DialogReplyInput({ postId, onSuccess }: DialogReplyInputProps) {
  const [replyContent, setReplyContent] = useState('');
  const [tags, setTags] = useState<Array<{ id: string; label: string }>>([]);
  const currentUserId = Core.useAuthStore((state) => state.selectCurrentUserPubky());
  const { ref: containerRef } = Hooks.useElementHeight();

  const [userId] = (currentUserId || '').split(':');

  // Fetch user details for avatar and name
  const userDetails = useLiveQuery(async () => {
    if (!userId) return null;
    try {
      return await Core.ProfileController.read({ userId: userId as Core.Pubky });
    } catch (error) {
      console.error('Error fetching user details:', error);
      return null;
    }
  }, [userId]);

  const handleReplySubmit = async () => {
    if (!replyContent.trim() || !postId || !currentUserId) return;

    try {
      await Core.PostController.create({
        parentPostId: postId,
        content: replyContent.trim(),
        authorId: currentUserId,
      });
      setReplyContent('');
      onSuccess?.();
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
    <div className="relative">
      {/* Reply input card */}
      <div className="border border-dashed border-input rounded-md relative">
        <div className="flex flex-col gap-4 p-6">
          {/* PostHeader without time */}
          <div className="flex items-start justify-between w-full">
            <div className="flex items-center gap-3">
              <Atoms.Avatar size="default">
                <Atoms.AvatarImage src={userDetails ? Core.filesApi.getAvatar(userId) : ''} />
                <Atoms.AvatarFallback>
                  {userDetails ? Libs.extractInitials({ name: userDetails.name, maxLength: 2 }) : ''}
                </Atoms.AvatarFallback>
              </Atoms.Avatar>
              <div className="flex flex-col">
                <span className="text-base leading-6 font-bold text-foreground">{userDetails?.name || 'User'}</span>
                <span className="text-xs leading-4 font-medium tracking-[0.075em] uppercase text-muted-foreground">
                  {userId ? `@${Libs.formatPublicKey({ key: userId, length: 8 })}` : ''}
                </span>
              </div>
            </div>
          </div>

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

          {/* Post/Interact section */}
          <div className="flex flex-wrap items-center justify-between gap-4 w-full">
            {/* Tags */}
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

            {/* Action buttons */}
            <div className="flex gap-2 items-center justify-end">
              {/* Emoji button */}
              <Atoms.Button
                variant="secondary"
                size="sm"
                className="h-8 px-3 py-2 rounded-full border-none"
                style={{ boxShadow: '0px 1px 2px 0px rgba(5, 5, 10, 0.2)' }}
                aria-label="Add emoji"
              >
                <Libs.Smile className="size-4 text-secondary-foreground" strokeWidth={2} />
              </Atoms.Button>

              {/* Image button */}
              <Atoms.Button
                variant="secondary"
                size="sm"
                className="h-8 px-3 py-2 rounded-full border-none"
                style={{ boxShadow: '0px 1px 2px 0px rgba(5, 5, 10, 0.2)' }}
                aria-label="Add image"
              >
                <Libs.Image className="size-4 text-secondary-foreground" strokeWidth={2} />
              </Atoms.Button>

              {/* File button */}
              <Atoms.Button
                variant="secondary"
                size="sm"
                className="h-8 px-3 py-2 rounded-full border-none"
                style={{ boxShadow: '0px 1px 2px 0px rgba(5, 5, 10, 0.2)' }}
                aria-label="Add file"
              >
                <Libs.Paperclip className="size-4 text-secondary-foreground" strokeWidth={2} />
              </Atoms.Button>

              {/* Article button */}
              <Atoms.Button
                variant="secondary"
                size="sm"
                className="h-8 px-3 py-2 rounded-full border-none"
                style={{ boxShadow: '0px 1px 2px 0px rgba(5, 5, 10, 0.2)' }}
                aria-label="Add article"
              >
                <Libs.Newspaper className="size-4 text-secondary-foreground" strokeWidth={2} />
              </Atoms.Button>

              {/* Post button */}
              <Atoms.Button
                variant="secondary"
                size="sm"
                onClick={handleReplySubmit}
                disabled={!replyContent.trim()}
                className={Libs.cn('h-8 px-3 py-2 rounded-full border-none', !replyContent.trim() && 'opacity-40')}
                style={{ boxShadow: '0px 1px 2px 0px rgba(5, 5, 10, 0.2)' }}
                aria-label="Post reply"
              >
                <Libs.Send className="size-4 text-secondary-foreground mr-1.5" strokeWidth={2} />
                <span className="text-xs font-bold leading-4 text-secondary-foreground">Post</span>
              </Atoms.Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
