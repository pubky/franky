import type { NexusTag } from '@/core/services/nexus/nexus.types';

export interface TaggerWithAvatar {
  id: string;
  avatarUrl: string;
}

export interface TagWithAvatars extends Omit<NexusTag, 'taggers'> {
  taggers: TaggerWithAvatar[];
}

export interface TaggedItemProps {
  tag: TagWithAvatars;
  onTagClick: (tag: TagWithAvatars) => void | Promise<void>;
  onSearchClick?: () => void;
}
