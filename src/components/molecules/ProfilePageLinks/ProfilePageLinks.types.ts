import * as Icons from '@/libs/icons';
import * as Core from '@/core';

export interface ProfilePageSidebarLink {
  icon: React.ComponentType<Icons.LucideProps>;
  url: string;
  label: string;
}

export interface ProfilePageLinksProps {
  links?: Core.NexusUserDetails['links'];
  /** Whether the user is viewing their own profile */
  isOwnProfile?: boolean;
}
