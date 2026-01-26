import type { TaggerWithAvatar } from '@/molecules/TaggedItem/TaggedItem.types';

export interface WhoTaggedExpandedListProps {
  /** Array of users who tagged */
  taggers: TaggerWithAvatar[];
  /** Additional class name */
  className?: string;
  /** Test ID */
  'data-testid'?: string;
}
