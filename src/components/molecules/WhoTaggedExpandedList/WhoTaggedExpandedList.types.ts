import type { TaggerWithAvatar } from '@/molecules/TaggedItem/TaggedItem.types';

export interface WhoTaggedExpandedListProps {
  /** Array of users who tagged */
  taggers: TaggerWithAvatar[];
  /** Test ID */
  'data-testid'?: string;
}
