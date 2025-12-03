import * as Core from '@/core';

export interface SidebarUserItemProps {
  /** User ID (pubky) */
  id: Core.Pubky;
  /** User display name */
  name: string;
  /** User avatar URL */
  image?: string | null;
  /** Subtitle content (e.g., public key text or stats with icons) */
  subtitle?: React.ReactNode;
  /** Whether the current user is following this user */
  isFollowing?: boolean;
  /** Whether follow action is loading */
  isLoading?: boolean;
  /** Callback when user area is clicked */
  onUserClick?: (id: Core.Pubky) => void;
  /** Callback when follow button is clicked */
  onFollowClick?: (id: Core.Pubky, isFollowing: boolean) => void;
  /** Custom className */
  className?: string;
  /** Test ID */
  'data-testid'?: string;
}
