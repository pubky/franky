/**
 * Represents a single avatar item in the group.
 * Generic structure to support any entity with an avatar.
 */
export interface AvatarGroupItem {
  /** Unique identifier for the avatar */
  id: string;
  /** Display name for fallback initials */
  name?: string;
  /** URL to the avatar image */
  avatarUrl?: string;
}

export interface AvatarGroupProps {
  /** Array of items to display as avatars */
  items: AvatarGroupItem[];
  /** Total count for overflow calculation (e.g., post count, user count) */
  totalCount: number;
  /** Maximum number of avatars to show before overflow indicator */
  maxAvatars?: number;
  /** Additional class name */
  className?: string;
  /** Test ID */
  'data-testid'?: string;
}
