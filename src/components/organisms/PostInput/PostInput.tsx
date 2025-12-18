'use client';

import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';
import { POST_MAX_CHARACTER_LENGTH } from '@/config';
import { POST_THREAD_CONNECTOR_VARIANTS } from '@/atoms';
import { usePostInput } from '@/hooks';
import { PostInputTags } from '../PostInputTags';
import { PostInputActionBar } from '../PostInputActionBar';
import type { PostInputProps } from './PostInput.types';

export function PostInput({
  variant,
  postId,
  onSuccess,
  placeholder,
  showThreadConnector = false,
  expanded = false,
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
    onSuccess,
    placeholder,
    expanded,
    onContentChange,
  });

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
            characterLimit={{ count: content.length, max: POST_MAX_CHARACTER_LENGTH }}
            showPopover={false}
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
                  isPostDisabled={!content.trim() || isSubmitting}
                  isSubmitting={isSubmitting}
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
