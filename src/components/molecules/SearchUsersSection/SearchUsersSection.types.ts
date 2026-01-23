import type { Pubky } from '@/core';
import type { AutocompleteUserData } from '@/hooks/useUserDetailsFromIds';

export interface SearchUsersSectionProps {
  title: string;
  users: AutocompleteUserData[];
  onUserClick: (userId: Pubky) => void;
}
