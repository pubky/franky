/**
 * Profile data for the header
 */
export interface ProfileHeaderData {
  avatarUrl?: string;
  emoji?: string;
  name: string;
  bio?: string;
  publicKey: string;
  link: string;
  status: string;
}

/**
 * Action handlers for the header
 */
export interface ProfileHeaderActions {
  onEdit?: () => void;
  onCopyPublicKey?: () => void;
  onCopyLink: () => void;
  onSignOut?: () => void;
  onStatusClick?: () => void;
  onAvatarClick?: () => void;
}

/**
 * Props for ProfilePageHeader component
 * Groups profile data and actions for better organization
 */
export interface ProfilePageHeaderProps {
  /** Profile information to display */
  profile: ProfileHeaderData;
  /** Action handlers for user interactions */
  actions: ProfileHeaderActions;
}

/**
 * Legacy flat props interface for backward compatibility
 * @deprecated Use ProfilePageHeaderProps with grouped props instead
 */
export interface ProfilePageHeaderPropsFlat {
  avatarUrl?: string;
  emoji?: string;
  name: string;
  bio?: string;
  publicKey: string;
  link: string;
  status: string;
  onEdit?: () => void;
  onCopyPublicKey?: () => void;
  onCopyLink: () => void;
  onSignOut?: () => void;
  onStatusClick?: () => void;
}
