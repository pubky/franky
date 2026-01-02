import type { Pubky } from '@/core';
import type { AutocompleteUserData } from '@/hooks/useSearchAutocomplete/useSearchAutocomplete.types';

export interface SearchUsersSectionProps {
  title: string;
  users: AutocompleteUserData[];
  onUserClick: (userId: Pubky) => void;
}
