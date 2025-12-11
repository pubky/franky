import * as Core from '@/core';

export interface UserProfile {
  name: string;
  bio: string;
  publicKey: string;
  emoji: string;
  status: string;
  avatarUrl?: string;
  link: string;
  /** User's external links (social media, websites, etc.) */
  links?: Core.NexusUserLink[] | null;
}

export interface UseUserProfileResult {
  profile: UserProfile | null;
  isLoading: boolean;
}
