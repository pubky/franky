import type { TagWithAvatars } from '@/molecules/TaggedItem/TaggedItem.types';

export interface ProfilePageTaggedAsProps {
  tags: TagWithAvatars[];
  isLoading?: boolean;
  onTagClick: (tag: TagWithAvatars) => void | Promise<void>;
}
