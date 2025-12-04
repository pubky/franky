import type { TagWithAvatars } from '@/molecules/TaggedItem/TaggedItem.types';

export interface ProfilePageTaggedAsProps {
  tags: TagWithAvatars[];
  isLoading?: boolean;
  onTagClick: (tag: TagWithAvatars) => void | Promise<void>;
  /** The pubky of the profile being viewed (undefined for own profile) */
  pubky?: string;
  /** The display name of the profile being viewed */
  userName?: string;
}
