'use client';

import * as React from 'react';

import * as Atoms from '@/atoms';
import * as Hooks from '@/hooks';
import * as Molecules from '@/molecules';
import { POST_INPUT_VARIANT } from '@/organisms/PostInput/PostInput.constants';
import { POST_INPUT_ACTION_SUBMIT_MODE } from '@/organisms/PostInputActionBar';
import { POST_THREAD_CONNECTOR_VARIANTS } from '@/atoms';
import { PostInputExpandableSection } from '@/organisms/PostInputExpandableSection';

import { pickRandomQuickReplyPrompt } from './QuickReply.utils';
import type { QuickReplyProps } from './QuickReply.types';

export function QuickReply({ parentPostId }: QuickReplyProps) {
  const [prompt] = React.useState(() => pickRandomQuickReplyPrompt());

  const { userDetails } = Hooks.useCurrentUserProfile();
  const avatarUrl = Hooks.useAvatarUrl(userDetails);

  const {
    textareaRef,
    containerRef,
    content,
    tags,
    isExpanded,
    isSubmitting,
    showEmojiPicker,
    setShowEmojiPicker,
    displayPlaceholder,
    handleExpand,
    handleSubmit,
    handleChange,
    handleEmojiSelect,
    setTags,
  } = Hooks.usePostInput({
    variant: POST_INPUT_VARIANT.REPLY,
    postId: parentPostId,
    placeholder: prompt,
    expanded: false,
  });

  const { ref: cardRef, height: cardHeight } = Hooks.useElementHeight();

  const isValid = React.useCallback(() => {
    return Boolean(content.trim()) && !isSubmitting;
  }, [content, isSubmitting]);

  const handleKeyDown = Hooks.useEnterSubmit(isValid, handleSubmit, {
    ignoreShiftEnter: true,
  });

  return (
    <Atoms.Container overrideDefaults className="relative flex" data-testid="quick-reply" aria-busy={isSubmitting}>
      <Atoms.Container overrideDefaults className="w-3 shrink-0">
        <Atoms.PostThreadConnector
          height={cardHeight}
          variant={POST_THREAD_CONNECTOR_VARIANTS.LAST}
          data-testid="quick-reply-connector"
        />
      </Atoms.Container>

      <Atoms.Container
        ref={containerRef}
        className="relative w-full cursor-pointer rounded-md border border-dashed border-input p-6"
        onClick={handleExpand}
        overrideDefaults
      >
        <Atoms.Container ref={cardRef} className="gap-4" overrideDefaults>
          {/* Collapsed header row (avatar + input) */}
          <Atoms.Container className="flex items-center gap-4" overrideDefaults>
            <Molecules.AvatarWithFallback avatarUrl={avatarUrl} name={userDetails?.name || ''} size="default" />

            <Atoms.Textarea
              ref={textareaRef}
              aria-label="Reply"
              placeholder={displayPlaceholder}
              className="min-h-6 resize-none border-none bg-transparent p-0 text-base font-medium break-all text-secondary-foreground shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
              value={content}
              onChange={handleChange}
              onFocus={handleExpand}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={isSubmitting}
              data-testid="quick-reply-textarea"
            />
          </Atoms.Container>

          {/* Expandable section with animation (same transition as PostInput) */}
          <PostInputExpandableSection
            isExpanded={isExpanded}
            content={content}
            tags={tags}
            isSubmitting={isSubmitting}
            setTags={setTags}
            onSubmit={handleSubmit}
            showEmojiPicker={showEmojiPicker}
            setShowEmojiPicker={setShowEmojiPicker}
            onEmojiSelect={handleEmojiSelect}
            submitMode={POST_INPUT_ACTION_SUBMIT_MODE.REPLY}
            className={isExpanded ? 'mt-4' : ''}
          />
        </Atoms.Container>
      </Atoms.Container>
    </Atoms.Container>
  );
}
