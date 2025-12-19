'use client';

import * as Core from '@/core';

/**
 * Context value for profile pages
 */
export interface ProfileContextValue {
  /** The pubky of the profile being viewed */
  pubky: Core.Pubky | null;
  /** Whether the profile belongs to the currently logged-in user */
  isOwnProfile: boolean;
  /** Whether the profile data is still loading */
  isLoading: boolean;
}

/**
 * Props for the ProfileProvider component
 */
export interface ProfileProviderProps {
  /** The pubky of the profile to display (if null, uses current user) */
  pubky?: Core.Pubky | null;
  /** Children to render within the provider */
  children: React.ReactNode;
}
