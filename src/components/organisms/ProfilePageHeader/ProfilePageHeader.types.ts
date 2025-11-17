export interface ProfilePageHeaderProps {
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
