import * as Core from '@/core';

/**
 * Recent search item types
 */
export interface RecentUserSearch {
  id: Core.Pubky;
  searchedAt: number; // Timestamp
}

export interface RecentTagSearch {
  tag: string;
  searchedAt: number; // Timestamp
}

/**
 * Search Store State
 */
export interface SearchState {
  recentUsers: RecentUserSearch[];
  recentTags: RecentTagSearch[];
  /** Active tags for optimistic UI - immediately updated, then synced with URL */
  activeTags: string[];
}

/**
 * Search Store Actions
 */
export interface SearchActions {
  addUser: (userId: Core.Pubky) => void;
  /** Add a tag to recent searches. Tag should be normalized (lowercase, trimmed) before calling */
  addTag: (tag: string) => void;
  /** Clear only recent searches (users and tags), keep active tags */
  clearRecentSearches: () => void;
  /** Set active tags (used for URL → store sync) */
  setActiveTags: (tags: string[]) => void;
  /** Add a tag to active tags (optimistic update). Tag should be normalized (lowercase, trimmed) before calling */
  addActiveTag: (tag: string) => void;
  /** Remove a tag from active tags (optimistic update). Tag should be normalized (lowercase, trimmed) before calling */
  removeActiveTag: (tag: string) => void;
}

/**
 * Complete Search Store Type
 */
export type SearchStore = SearchState & SearchActions;

/**
 * Initial state for search store
 */
export const searchInitialState: SearchState = {
  recentUsers: [],
  recentTags: [],
  activeTags: [],
};

/**
 * Action types for DevTools
 */
export enum SearchActionTypes {
  ADD_USER = 'ADD_USER',
  ADD_TAG = 'ADD_TAG',
  CLEAR_RECENT_SEARCHES = 'CLEAR_RECENT_SEARCHES',
  SET_ACTIVE_TAGS = 'SET_ACTIVE_TAGS',
  ADD_ACTIVE_TAG = 'ADD_ACTIVE_TAG',
  REMOVE_ACTIVE_TAG = 'REMOVE_ACTIVE_TAG',
}
