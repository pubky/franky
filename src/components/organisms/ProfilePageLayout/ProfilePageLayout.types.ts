import { ProfileStats } from '@/hooks/useProfileHeader/useProfileHeader';
import { ProfilePageType, FilterBarPageType } from '@/app/profile/types';

export interface ProfilePageLayoutProps {
  /** Child pages to render in the main content area */
  children: React.ReactNode;
  /** Profile data from the smart container */
  profile: {
    name: string;
    bio: string;
    publicKey: string;
    emoji: string;
    status: string;
    avatarUrl?: string;
    link: string;
  };
  /** Statistics for the profile */
  stats: ProfileStats;
  /** Actions handlers for profile interactions */
  actions: {
    onEdit: () => void;
    onCopyPublicKey: () => void;
    onCopyLink: () => void;
    onSignOut: () => void;
    onStatusChange: (status: string) => void;
  };
  /** Currently active page */
  activePage: ProfilePageType;
  /** Active page for filter bar (excludes PROFILE page type) */
  filterBarActivePage: FilterBarPageType;
  /** Navigation handler */
  navigateToPage: (page: ProfilePageType) => void;
  /** Loading state */
  isLoading: boolean;
}
