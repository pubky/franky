import * as Icons from '@/libs/icons';

export interface ProfilePageSidebarLink {
  icon: React.ComponentType<Icons.LucideProps>;
  url: string;
  label: string;
}

export interface ProfilePageLinksProps {
  links?: ProfilePageSidebarLink[];
}
