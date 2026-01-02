'use client';

import * as Atoms from '@/atoms';
import * as Organisms from '@/organisms';
import * as Utils from '@/libs/utils';
import { POST_MAX_CHARACTER_LENGTH } from '@/config';
import { POST_THREAD_CONNECTOR_VARIANTS } from '@/atoms';
import { usePostInput } from '@/hooks';
import { POST_INPUT_VARIANT } from './PostInput.constants';
import { POST_INPUT_ACTION_SUBMIT_MODE } from '../PostInputActionBar';
import type { PostInputProps } from './PostInput.types';
import { PostInputExpandableSection } from '../PostInputExpandableSection';
import { PostInputAttachments } from '@/molecules/PostInputAttachments/PostInputAttachments';

export function PostInput({
  dataCy,
  variant,
  postId,
  originalPostId,
  onSuccess,
  placeholder,
  showThreadConnector = false,
  expanded = false,
  onContentChange,
}: PostInputProps) {
  const {
    textareaRef,
    containerRef,
    fileInputRef,
    content,
    tags,
    setTags,
    attachments,
    setAttachments,
    isDragging,
    isExpanded,
    isSubmitting,
    showEmojiPicker,
    setShowEmojiPicker,
    displayPlaceholder,
    currentUserPubky,
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
  } = usePostInput({
    variant,
    postId,
    originalPostId,
    onSuccess,
    placeholder,
    expanded,
    onContentChange,
  });

  return (
    <Atoms.Container
      data-cy={dataCy}
      ref={containerRef}
      className={Utils.cn(
        'relative cursor-pointer rounded-md border border-dashed p-6 transition-colors duration-200',
        isDragging ? 'border-brand' : 'border-input',
      )}
      onClick={handleExpand}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
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

      {showThreadConnector && <Atoms.PostThreadConnector variant={POST_THREAD_CONNECTOR_VARIANTS.DIALOG_REPLY} />}
      <Atoms.Container className="gap-4">
        {currentUserPubky && (
          <Organisms.PostHeader
            postId={currentUserPubky}
            isReplyInput={true}
            characterLimit={{ count: content.length, max: POST_MAX_CHARACTER_LENGTH }}
          />
        )}

        <Atoms.Textarea
          ref={textareaRef}
          placeholder={displayPlaceholder}
          className="min-h-6 resize-none border-none bg-transparent p-0 text-base font-medium break-all text-secondary-foreground shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
          value={content}
          onChange={handleChange}
          onFocus={handleExpand}
          maxLength={POST_MAX_CHARACTER_LENGTH}
          rows={1}
          disabled={isSubmitting}
        />

        <PostInputAttachments
          ref={fileInputRef}
          attachments={attachments}
          setAttachments={setAttachments}
          handleFilesAdded={handleFilesAdded}
          isSubmitting={isSubmitting}
        />

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
          // Reposts allow empty content, posts and replies require content or attachments
          isPostDisabled={
            variant === POST_INPUT_VARIANT.REPOST
              ? isSubmitting
              : (!content.trim() && attachments.length === 0) || isSubmitting
          }
          submitMode={
            variant === POST_INPUT_VARIANT.REPLY
              ? POST_INPUT_ACTION_SUBMIT_MODE.REPLY
              : POST_INPUT_ACTION_SUBMIT_MODE.POST
          }
        />
      </Atoms.Container>
    </Atoms.Container>
  );
}
