import * as React from 'react';
import * as Types from '@/app/profile/profile.types';

export interface ProfileMenuItem {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  pageType: Types.ProfilePageType;
  /** Whether this item should only be shown for own profile */
  ownProfileOnly?: boolean;
}

export interface ProfilePageMobileMenuProps {
  activePage: Types.ProfilePageType;
  onPageChangeAction: (page: Types.ProfilePageType) => void;
  /** Whether this is the logged-in user's own profile */
  isOwnProfile?: boolean;
}
