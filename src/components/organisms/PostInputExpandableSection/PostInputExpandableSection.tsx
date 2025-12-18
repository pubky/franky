'use client';

import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import { PostInputActionBar } from '../PostInputActionBar';
import { POST_INPUT_ACTION_SUBMIT_MODE } from '../PostInputActionBar/PostInputActionBar.constants';
import { PostInputTags } from '../PostInputTags';
import type { PostInputExpandableSectionProps } from './PostInputExpandableSection.types';

export function PostInputExpandableSection({
  isExpanded,
  content,
  tags,
  isSubmitting,
  isDisabled = false,
  isPostDisabled: isPostDisabledProp,
  submitMode,
  setTags,
  onSubmit,
  showEmojiPicker,
  setShowEmojiPicker,
  onEmojiSelect,
  className,
}: PostInputExpandableSectionProps) {
  const hasContent = content.trim().length > 0;
  const isUiDisabled = isSubmitting || isDisabled;
  // Use provided isPostDisabled or default to requiring content
  const isPostDisabled = isPostDisabledProp ?? (!hasContent || isUiDisabled);
  const isReplyMode = submitMode === POST_INPUT_ACTION_SUBMIT_MODE.REPLY;
  const postButtonLabel = isReplyMode ? 'Reply' : 'Post';
  const postButtonAriaLabel = isReplyMode ? 'Post reply' : 'Create post';

  return (
    <>
      <Atoms.Container
        className={`grid transition-all duration-300 ease-in-out ${
          isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        } ${className || ''}`}
        overrideDefaults
      >
        <Atoms.Container className="overflow-hidden" overrideDefaults>
          <Atoms.Container className="gap-6">
            {hasContent && <Molecules.PostLinkEmbeds content={content} />}

            {tags.length > 0 && (
              <Atoms.Container className="flex flex-wrap items-center gap-2" overrideDefaults>
                {tags.map((tag, index) => (
                  <Molecules.PostTag
                    key={`${tag}-${index}`}
                    label={tag}
                    showClose={!isUiDisabled}
                    onClose={() => {
                      setTags((prevTags) => prevTags.filter((_, i) => i !== index));
                    }}
                  />
                ))}
              </Atoms.Container>
            )}

            <Atoms.Container className="justify-between gap-4 md:flex-row md:gap-0">
              <PostInputTags tags={tags} onTagsChange={setTags} disabled={isUiDisabled} />
              <PostInputActionBar
                onPostClick={onSubmit}
                onEmojiClick={() => setShowEmojiPicker(true)}
                isPostDisabled={isPostDisabled}
                isSubmitting={isSubmitting}
                postButtonLabel={postButtonLabel}
                postButtonAriaLabel={postButtonAriaLabel}
              />
            </Atoms.Container>
          </Atoms.Container>
        </Atoms.Container>
      </Atoms.Container>

      <Molecules.EmojiPickerDialog
        open={showEmojiPicker && !isUiDisabled}
        onOpenChange={setShowEmojiPicker}
        onEmojiSelect={onEmojiSelect}
      />
    </>
  );
}
