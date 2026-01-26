import type { MouseEvent } from 'react';
import * as Core from '@/core';
import type { TagWithAvatars } from '@/molecules/TaggedItem/TaggedItem.types';

export interface ClickableTagsListProps {
  /** The ID of the tagged entity (userId or postId) */
  taggedId: string;
  /** The kind of the tagged entity */
  taggedKind: Core.TagKind;
  /** Optional: pre-loaded tags (if not provided, will fetch from IndexedDB) */
  tags?: Core.NexusTag[];
  /** Maximum number of tags to display */
  maxTags?: number;
  /** Maximum character length per tag */
  maxTagLength?: number;
  /** Maximum total characters across all tags */
  maxTotalChars?: number;
  /** Whether to show the tag count badge */
  showCount?: boolean;
  /** Show the add tag input (includes emoji picker and autocomplete) */
  showInput?: boolean;
  /** Show add button instead of input (mutually exclusive with showInput) */
  showAddButton?: boolean;
  /** Start in add button mode and open input on click */
  addMode?: boolean;
  /** Show close button on tags */
  showTagClose?: boolean;
  /** Custom className */
  className?: string;
  /** Callback when a tag is clicked (optional, defaults to toggle) */
  onTagClick?: (tag: TagWithAvatars, index: number, event: MouseEvent) => void;
  /** Callback when a tag close button is clicked */
  onTagClose?: (tag: TagWithAvatars, index: number, event: MouseEvent) => void;
  /** Callback when a new tag is added */
  onTagAdd?: (label: string) => void;
  /** Callback when add button is clicked */
  onAddButtonClick?: () => void;
}
