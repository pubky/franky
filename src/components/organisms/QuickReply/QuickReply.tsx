'use client';

import * as React from 'react';

import * as Atoms from '@/atoms';
import * as Hooks from '@/hooks';
import * as Molecules from '@/molecules';
import * as Utils from '@/libs/utils';
import * as Libs from '@/libs';
import { POST_INPUT_VARIANT } from '@/organisms/PostInput/PostInput.constants';
import { POST_THREAD_CONNECTOR_VARIANTS } from '@/atoms';
import { PostInputExpandableSection } from '@/organisms/PostInputExpandableSection';
import { PostInputAttachments } from '@/molecules/PostInputAttachments/PostInputAttachments';

import { pickRandomQuickReplyPrompt } from './QuickReply.utils';
import { QUICK_REPLY_CONNECTOR_SPACER_HEIGHT } from './QuickReply.constants';
import type { QuickReplyProps } from './QuickReply.types';

export function QuickReply({
  parentPostId,
  connectorVariant = POST_THREAD_CONNECTOR_VARIANTS.LAST,
  onReplySubmitted,
}: QuickReplyProps) {
  const [prompt] = React.useState(() => pickRandomQuickReplyPrompt());

  const { userDetails } = Hooks.useCurrentUserProfile();
  const avatarUrl = Hooks.useAvatarUrl(userDetails);

  const {
    textareaRef,
    containerRef,
    fileInputRef,
    content,
    tags,
    attachments,
    setAttachments,
    isDragging,
    isExpanded,
    isSubmitting,
    showEmojiPicker,
    setShowEmojiPicker,
    displayPlaceholder,
    handleExpand,
    handleSubmit,
    handleChange,
    handleEmojiSelect,
    handleFilesAdded,
    handleFileClick,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    setTags,
  } = Hooks.usePostInput({
    variant: POST_INPUT_VARIANT.REPLY,
    postId: parentPostId,
    placeholder: prompt,
    expanded: false,
    onSuccess: onReplySubmitted,
  });

  const { ref: cardRef, height: cardHeight } = Hooks.useElementHeight();

  const isValid = React.useCallback(() => {
    return Libs.canSubmitPost(POST_INPUT_VARIANT.REPLY, content, attachments, isSubmitting);
  }, [content, attachments, isSubmitting]);

  const handleKeyDown = Hooks.useEnterSubmit(isValid, handleSubmit, {
    requireModifier: true,
  });

  // Account for spacing between main post and QuickReply in connector calculation
  const connectorHeight = cardHeight ? cardHeight + QUICK_REPLY_CONNECTOR_SPACER_HEIGHT : undefined;

  return (
    <Atoms.Container overrideDefaults className="relative flex" data-testid="quick-reply" aria-busy={isSubmitting}>
      <Atoms.Container overrideDefaults className="-mt-4 w-3 shrink-0">
        <Atoms.PostThreadConnector
          height={connectorHeight}
          variant={connectorVariant}
          data-testid="quick-reply-connector"
        />
      </Atoms.Container>

      <Atoms.Container
        ref={containerRef}
        className={Utils.cn(
          'relative w-full cursor-pointer rounded-md border border-dashed p-6 transition-colors duration-200',
          isDragging ? 'border-brand' : 'border-input',
        )}
        onClick={handleExpand}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        overrideDefaults
      >
        {/* Drag overlay */}
        {isDragging && (
          <Atoms.Container
            className="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-brand/10"
            overrideDefaults
          >
            <Atoms.Typography className="text-brand">Drop files here</Atoms.Typography>
          </Atoms.Container>
        )}

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

          <PostInputAttachments
            ref={fileInputRef}
            attachments={attachments}
            setAttachments={setAttachments}
            handleFilesAdded={handleFilesAdded}
            isSubmitting={isSubmitting}
          />

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
            onFileClick={handleFileClick}
            onImageClick={handleFileClick}
            isPostDisabled={!Libs.canSubmitPost(POST_INPUT_VARIANT.REPLY, content, attachments, isSubmitting)}
            submitMode={POST_INPUT_VARIANT.REPLY}
            className={isExpanded ? 'mt-4' : ''}
          />
        </Atoms.Container>
      </Atoms.Container>
    </Atoms.Container>
  );
}
