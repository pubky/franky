import type { AvatarGroupItem } from '../AvatarGroup/AvatarGroup.types';

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
  taggers?: AvatarGroupItem[];
  /** Maximum number of avatars to show */
  maxAvatars?: number;
  /** Click handler for the card */
  onClick?: (tagName: string) => void;
  /** Additional class name */
  className?: string;
  /** Test ID */
  'data-testid'?: string;
}
