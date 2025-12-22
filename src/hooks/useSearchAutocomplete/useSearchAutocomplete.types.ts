import type { Pubky } from '@/core';

export interface AutocompleteTag {
  name: string;
}

export interface AutocompleteUserData {
  id: Pubky;
  name: string;
  avatarUrl?: string;
}

export interface UseSearchAutocompleteParams {
  query: string;
  enabled?: boolean;
}

export interface UseSearchAutocompleteResult {
  tags: AutocompleteTag[];
  users: AutocompleteUserData[];
  isLoading: boolean;
}
