export interface HotTagCardTagger {
  id: string;
  name?: string;
  avatarUrl?: string;
}

export interface HotTagCardProps {
  /** Rank position (1, 2, 3) */
  rank: number;
  /** Tag name */
  tagName: string;
  /** Number of posts with this tag */
  postCount: number;
  /** Timeframe label (e.g., "this month") */
  timeframeLabel?: string;
  /** Array of top taggers (users) */
  taggers?: HotTagCardTagger[];
  /** Maximum number of avatars to show */
  maxAvatars?: number;
  /** Click handler for the card */
  onClick?: (tagName: string) => void;
  /** Additional class name */
  className?: string;
  /** Test ID */
  'data-testid'?: string;
}

export interface AvatarGroupProps {
  /** Array of taggers to display */
  taggers: HotTagCardTagger[];
  /** Total count for overflow calculation (e.g., post count) */
  totalCount: number;
  /** Maximum number of avatars to show */
  maxAvatars?: number;
  /** Additional class name */
  className?: string;
}
