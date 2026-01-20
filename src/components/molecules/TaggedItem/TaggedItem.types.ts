import type { NexusTag } from '@/core/services/nexus/nexus.types';

export interface TaggerWithAvatar {
  id: string;
  avatarUrl: string;
}

export interface TagWithAvatars extends Omit<NexusTag, 'taggers'> {
  taggers: TaggerWithAvatar[];
}

export interface TaggedItemProps {
  /** The tag data to display */
  tag: TagWithAvatars;
  /** Callback when the tag is clicked */
  onTagClick: (tag: TagWithAvatars) => void | Promise<void>;
  /** Optional callback when search button is clicked - if not provided, uses default search navigation */
  onSearchClick?: () => void;
  /** Hide avatar group (useful for sidebar/compact layouts) */
  hideAvatars?: boolean;
}
