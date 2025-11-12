import * as React from 'react';
import * as Molecules from '@/molecules';
import * as Libs from '@/libs';

export interface PostTagsListTag {
  /** Tag label */
  label: string;
  /** Number of posts with this tag (optional) */
  count?: number;
  /** Custom color for the tag */
  color?: string;
  /** Whether the tag is selected */
  selected?: boolean;
}

export interface PostTagsListProps {
  /** Array of tags to display */
  tags?: PostTagsListTag[];
  /** Show the add tag input */
  showInput?: boolean;
  /** Show add button instead of input (mutually exclusive with showInput) */
  showAddButton?: boolean;
  /** Start in add button mode and open input on click */
  addMode?: boolean;
  /** Show emoji picker in input */
  showEmojiPicker?: boolean;
  /** Show close button on tags */
  showTagClose?: boolean;
  /** Callback when a tag is clicked */
  onTagClick?: (tag: PostTagsListTag, index: number) => void;
  /** Callback when a tag close button is clicked */
  onTagClose?: (tag: PostTagsListTag, index: number) => void;
  /** Callback when a new tag is added */
  onTagAdd?: (label: string) => void;
  /** Callback when add button is clicked */
  onAddButtonClick?: () => void;
  /** Callback when emoji picker is clicked */
  onEmojiClick?: () => void;
  /** Additional className */
  className?: string;
}

export function PostTagsList({
  tags = [],
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
}: PostTagsListProps) {
  const [inputValue, setInputValue] = React.useState('');
  const [isAdding, setIsAdding] = React.useState(addMode ? false : showInput);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Refocus input after clearing value in addMode (for adding multiple tags in a row)
  React.useEffect(() => {
    if (addMode && isAdding && inputValue === '' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [addMode, isAdding, inputValue]);

  const handleTagSubmit = (value: string) => {
    if (value.trim()) {
      onTagAdd?.(value.trim());
      setInputValue('');
      if (!addMode) {
        setIsAdding(false);
      }
    }
  };

  const handleTagClick = (tag: PostTagsListTag, index: number) => {
    onTagClick?.(tag, index);
  };

  const handleTagClose = (tag: PostTagsListTag, index: number) => (e: React.MouseEvent) => {
    e.stopPropagation();
    onTagClose?.(tag, index);
  };

  return (
    <div className={Libs.cn('flex flex-wrap items-center gap-2', className)}>
      {/* Render existing tags */}
      {tags.map((tag, index) => (
        <Molecules.PostTag
          key={`${tag.label}-${index}`}
          label={tag.label}
          count={tag.count}
          color={tag.color}
          selected={tag.selected}
          showClose={showTagClose}
          onClick={() => handleTagClick(tag, index)}
          onClose={handleTagClose(tag, index)}
        />
      ))}

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
