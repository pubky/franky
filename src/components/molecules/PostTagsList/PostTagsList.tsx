import { useLiveQuery } from 'dexie-react-hooks';

import * as React from 'react';
import * as Molecules from '@/molecules';
import * as Libs from '@/libs';
import * as Core from '@/core';
import * as Types from './PostTagsList.types';

export function PostTagsList({
  postId,
  showInput = true,
  showAddButton = false,
  addMode = false,
  showEmojiPicker = false,
  showTagClose = false,
  onTagClick,
  onTagClose,
  onTagAdd,
  onAddButtonClick,
  onEmojiClick,
  className,
}: Types.PostTagsListProps): React.ReactElement {
  const [inputValue, setInputValue] = React.useState('');
  const [isAdding, setIsAdding] = React.useState(addMode ? false : showInput);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Refocus input after clearing value in addMode (for adding multiple tags in a row)
  React.useEffect(() => {
    if (addMode && isAdding && inputValue === '' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [addMode, isAdding, inputValue]);

  const handleTagSubmit = (value: string): void => {
    if (value.trim()) {
      onTagAdd?.(value.trim());
      setInputValue('');
      if (!addMode) {
        setIsAdding(false);
      }
    }
  };

  const tagCollection = useLiveQuery(
    () => Core.PostController.getPostTags({ compositeId: postId }),
    [postId],
    [] as Core.TagCollectionModelSchema<string>[],
  );

  return (
    <div className={Libs.cn('flex flex-wrap items-center gap-2', className)}>
      {/* Render existing tags */}
      {tagCollection?.flatMap((collection) =>
        collection.tags.map((tag, index) => (
          <Molecules.PostTag
            key={`${collection.id}-${tag.label}`}
            label={tag.label}
            count={tag.taggers_count}
            color={Libs.generateRandomColor(tag.label)}
            selected={false}
            showClose={showTagClose}
            onClick={(e) => {
              onTagClick?.(tag, index, e);
            }}
            onClose={(e) => {
              onTagClose?.(tag, index, e);
            }}
          />
        )),
      )}

      {/* Add tag input */}
      {(showInput || isAdding) && (
        <Molecules.PostTagInput
          ref={inputRef}
          value={inputValue}
          onChange={setInputValue}
          onSubmit={handleTagSubmit}
          onBlur={() => {
            if (addMode && !inputValue) setIsAdding(false);
          }}
          showEmojiPicker={showEmojiPicker}
          onEmojiClick={onEmojiClick}
          className="w-32 shrink-0"
          autoFocus={isAdding}
        />
      )}

      {/* Add button (alternative to input) */}
      {showAddButton && !showInput && !isAdding && (
        <Molecules.PostTagAddButton
          onClick={() => {
            onAddButtonClick?.();
            if (addMode) setIsAdding(true);
          }}
        />
      )}
    </div>
  );
}
