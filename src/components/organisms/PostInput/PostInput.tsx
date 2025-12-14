'use client';

import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';
import * as Libs from '@/libs';
import { POST_MAX_CHARACTER_LENGTH } from '@/config';
import { POST_THREAD_CONNECTOR_VARIANTS } from '@/atoms';
import { usePostInput } from '@/hooks';
import { PostInputTags } from '../PostInputTags';
import { PostInputActionBar } from '../PostInputActionBar';
import { POST_INPUT_VARIANT, POST_INPUT_BUTTON_LABEL, POST_INPUT_BUTTON_ARIA_LABEL } from './PostInput.constants';
import type { PostInputProps } from './PostInput.types';

export function PostInput({
  variant,
  postId,
  originalPostId,
  onSuccess,
  placeholder,
  showThreadConnector = false,
  expanded = false,
  hideArticle = false,
  onContentChange,
}: PostInputProps) {
  const {
    textareaRef,
    containerRef,
    content,
    tags,
    isExpanded,
    isSubmitting,
    showEmojiPicker,
    setShowEmojiPicker,
    hasContent,
    displayPlaceholder,
    currentUserPubky,
    handleExpand,
    handleSubmit,
    handleChange,
    handleEmojiSelect,
    setTags,
  } = usePostInput({
    variant,
    postId,
    originalPostId,
    onSuccess,
    placeholder,
    expanded,
    onContentChange,
  });

  // Determine if post button should be disabled
  // Reposts allow empty content, replies and posts require content
  const requiresContent = variant !== POST_INPUT_VARIANT.REPOST;
  const isPostDisabled = isSubmitting || (requiresContent && !content.trim());
  return (
    <Atoms.Container
      ref={containerRef}
      className="relative cursor-pointer rounded-md border border-dashed border-input p-6"
      onClick={handleExpand}
    >
      {showThreadConnector && <Atoms.PostThreadConnector variant={POST_THREAD_CONNECTOR_VARIANTS.DIALOG_REPLY} />}
      <Atoms.Container className="gap-4">
        {currentUserPubky && (
          <Organisms.PostHeader
            postId={currentUserPubky}
            isReplyInput={true}
            characterCount={content.length}
            maxLength={POST_MAX_CHARACTER_LENGTH}
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

        {/* Repost preview - shown inside the dashed border for repost variant */}
        {variant === POST_INPUT_VARIANT.REPOST && originalPostId && (
          <Molecules.PostPreviewCard postId={originalPostId} />
        )}

        {/* Expandable section with animation */}
        <Atoms.Container
          className={`grid transition-all duration-300 ease-in-out ${
            isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          }`}
          overrideDefaults
        >
          <Atoms.Container className="overflow-hidden" overrideDefaults>
            <Atoms.Container className="gap-4">
              {/* Link preview - show when content has URLs */}
              {hasContent && <Molecules.PostLinkEmbeds content={content} />}

              {/* Tags row */}
              {tags.length > 0 && (
                <Atoms.Container className="flex flex-wrap items-center gap-2" overrideDefaults>
                  {tags.map((tag, index) => (
                    <Molecules.PostTag
                      key={`${tag}-${index}`}
                      label={tag}
                      showClose={!isSubmitting}
                      onClose={() => {
                        setTags((prevTags) => prevTags.filter((_, i) => i !== index));
                      }}
                    />
                  ))}
                </Atoms.Container>
              )}

              <Atoms.Container className="justify-between gap-4 md:flex-row md:gap-0">
                <PostInputTags tags={tags} onTagsChange={setTags} disabled={isSubmitting} />
                <PostInputActionBar
                  onPostClick={handleSubmit}
                  onEmojiClick={() => setShowEmojiPicker(true)}
                  isPostDisabled={isPostDisabled}
                  isSubmitting={isSubmitting}
                  postButtonLabel={POST_INPUT_BUTTON_LABEL[variant]}
                  postButtonAriaLabel={POST_INPUT_BUTTON_ARIA_LABEL[variant]}
                  postButtonIcon={variant === POST_INPUT_VARIANT.REPOST ? Libs.Repeat : undefined}
                  hideArticle={hideArticle}
                />
              </Atoms.Container>
            </Atoms.Container>
          </Atoms.Container>
        </Atoms.Container>

        <Molecules.EmojiPickerDialog
          open={showEmojiPicker && !isSubmitting}
          onOpenChange={setShowEmojiPicker}
          onEmojiSelect={handleEmojiSelect}
        />
      </Atoms.Container>
    </Atoms.Container>
  );
}
